package com.payflow;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Billing reconciliation service.
 *
 * Reconciles daily transaction totals against the payment processor's
 * settlement reports.
 *
 * ARCHITECTURAL ISSUE (S3 / S4 exercise):
 *   This class re-implements a retry pattern already standardised in
 *   ADR-002 (fraud detection approach).  ADR-002 specifies that all
 *   retries must use exponential back-off with jitter and a circuit-breaker.
 *   The implementation below uses a fixed 500ms sleep — violating the ADR.
 *   An agent without ADR context will re-invent this wrong pattern again.
 *
 * No tests exist for this class.
 */
public class BillingService {

    private static final int MAX_RETRIES = 3;
    private static final long RETRY_SLEEP_MS = 500; // ADR-002 violation: should be exponential back-off

    private final Map<String, BigDecimal> dailyTotals = new ConcurrentHashMap<>();
    private final SettlementReportClient reportClient;
    private final TransactionRepository transactionRepo;

    public BillingService(SettlementReportClient reportClient,
                          TransactionRepository transactionRepo) {
        this.reportClient = reportClient;
        this.transactionRepo = transactionRepo;
    }

    /**
     * Reconciles transactions for the given date.
     *
     * @param date the date to reconcile
     * @return list of discrepancy reports (empty = clean reconciliation)
     */
    public List<DiscrepancyReport> reconcile(LocalDate date) {
        SettlementReport settlement = fetchSettlementWithRetry(date);
        List<Transaction> transactions = transactionRepo.findByDate(date);

        BigDecimal settlementTotal = settlement.getTotal();
        BigDecimal localTotal = transactions.stream()
            .map(Transaction::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        dailyTotals.put(date.toString(), localTotal);

        List<DiscrepancyReport> discrepancies = new ArrayList<>();

        if (settlementTotal.compareTo(localTotal) != 0) {
            BigDecimal delta = settlementTotal.subtract(localTotal);
            discrepancies.add(new DiscrepancyReport(date, delta, "TOTAL_MISMATCH"));
        }

        for (Transaction tx : transactions) {
            if (!settlement.containsTransaction(tx.getId())) {
                discrepancies.add(new DiscrepancyReport(date, tx.getAmount(), "MISSING_IN_SETTLEMENT"));
            }
        }

        return discrepancies;
    }

    public BigDecimal getDailyTotal(LocalDate date) {
        return dailyTotals.getOrDefault(date.toString(), BigDecimal.ZERO);
    }

    // ADR-002 violation: fixed-sleep retry instead of exponential back-off with jitter
    private SettlementReport fetchSettlementWithRetry(LocalDate date) {
        Exception lastException = null;
        for (int attempt = 0; attempt < MAX_RETRIES; attempt++) {
            try {
                return reportClient.fetch(date);
            } catch (Exception e) {
                lastException = e;
                try {
                    Thread.sleep(RETRY_SLEEP_MS); // should be: (long)(Math.pow(2, attempt) * 100 + jitter)
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    throw new RuntimeException("Interrupted during retry", ie);
                }
            }
        }
        throw new RuntimeException("Failed to fetch settlement after " + MAX_RETRIES + " attempts", lastException);
    }
}
