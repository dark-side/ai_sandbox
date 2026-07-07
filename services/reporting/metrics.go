package main

import (
	"time"
)

// MetricsSnapshot holds a point-in-time view of operational metrics.
type MetricsSnapshot struct {
	Timestamp          time.Time `json:"timestamp"`
	TotalTransactions  int64     `json:"total_transactions"`
	SuccessfulPayments int64     `json:"successful_payments"`
	FailedPayments     int64     `json:"failed_payments"`
	FraudFlagged       int64     `json:"fraud_flagged"`
	AvgProcessingMs    float64   `json:"avg_processing_ms"`
	P95ProcessingMs    float64   `json:"p95_processing_ms"`
}

// DailyReport contains reconciliation and volume data for a single day.
type DailyReport struct {
	Date               string          `json:"date"`
	TransactionCount   int64           `json:"transaction_count"`
	TotalVolumeUSD     float64         `json:"total_volume_usd"`
	ReconciliationOK   bool            `json:"reconciliation_ok"`
	Discrepancies      int             `json:"discrepancies"`
	HarnessTokensUsed  int64           `json:"harness_tokens_used"`
	HarnessCostUSD     float64         `json:"harness_cost_usd"`
}

// MetricsCollector gathers metrics from the various downstream services.
type MetricsCollector struct{}

func NewMetricsCollector() *MetricsCollector {
	return &MetricsCollector{}
}

func (mc *MetricsCollector) Snapshot() (*MetricsSnapshot, error) {
	// TODO: wire to real data store (Prometheus / OpenTelemetry collector)
	// For now returns stub data so the endpoint is exercisable.
	return &MetricsSnapshot{
		Timestamp:          time.Now().UTC(),
		TotalTransactions:  14823,
		SuccessfulPayments: 14601,
		FailedPayments:     189,
		FraudFlagged:       33,
		AvgProcessingMs:    142.7,
		P95ProcessingMs:    380.1,
	}, nil
}

// GenerateDailyReport produces a reconciliation + volume report for date.
func GenerateDailyReport(date time.Time) (*DailyReport, error) {
	// TODO: query transaction DB and reconciliation service
	return &DailyReport{
		Date:              date.Format("2006-01-02"),
		TransactionCount:  0,
		TotalVolumeUSD:    0,
		ReconciliationOK:  true,
		Discrepancies:     0,
		HarnessTokensUsed: 0,
		HarnessCostUSD:    0,
	}, nil
}
