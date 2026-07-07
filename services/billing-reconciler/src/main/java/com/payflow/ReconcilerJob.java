package com.payflow;

import java.time.LocalDate;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Scheduled job that triggers daily reconciliation.
 *
 * Runs at 02:00 UTC via the cron scheduler.  Writes a summary to the
 * reporting service and sends an alert if discrepancies are found.
 */
public class ReconcilerJob {

    private static final Logger LOG = Logger.getLogger(ReconcilerJob.class.getName());

    private final BillingService billingService;
    private final AlertService alertService;
    private final MetricsReporter metricsReporter;

    public ReconcilerJob(BillingService billingService,
                         AlertService alertService,
                         MetricsReporter metricsReporter) {
        this.billingService = billingService;
        this.alertService = alertService;
        this.metricsReporter = metricsReporter;
    }

    public void run() {
        LocalDate yesterday = LocalDate.now().minusDays(1);
        LOG.info("Starting reconciliation for " + yesterday);

        try {
            List<DiscrepancyReport> discrepancies = billingService.reconcile(yesterday);

            if (discrepancies.isEmpty()) {
                LOG.info("Reconciliation clean for " + yesterday);
                metricsReporter.recordCleanRun(yesterday);
            } else {
                LOG.warning("Found " + discrepancies.size() + " discrepancies for " + yesterday);
                for (DiscrepancyReport report : discrepancies) {
                    LOG.warning("Discrepancy: " + report);
                }
                alertService.sendAlert(yesterday, discrepancies);
                metricsReporter.recordDiscrepancies(yesterday, discrepancies.size());
            }

        } catch (Exception e) {
            LOG.log(Level.SEVERE, "Reconciliation failed for " + yesterday, e);
            alertService.sendCriticalAlert("Reconciliation job failed: " + e.getMessage());
        }
    }
}
