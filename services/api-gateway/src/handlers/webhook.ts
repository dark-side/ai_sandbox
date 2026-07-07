import { Request, Response } from "express";

/**
 * Public webhook endpoint — receives events from third-party payment processors.
 *
 * SECURITY ISSUES (S6 exercise):
 *   1. No input validation — any JSON body is accepted and processed.
 *   2. No signature verification — a spoofed processor event will be acted on.
 *   3. event_type is used in a string template that gets logged and then
 *      forwarded to downstream services.
 */
export async function handleWebhook(req: Request, res: Response): Promise<void> {
  const { event_type, payload, processor_id } = req.body;

  // BUG: no validation that event_type is one of the expected values
  console.log(`Received webhook: type=${event_type} processor=${processor_id}`);

  // BUG: no HMAC / signature check against a shared secret
  await processWebhookEvent(event_type, payload);

  res.status(200).json({ received: true });
}

async function processWebhookEvent(eventType: string, payload: unknown): Promise<void> {
  switch (eventType) {
    case "payment.completed":
      await handlePaymentCompleted(payload);
      break;
    case "payment.failed":
      await handlePaymentFailed(payload);
      break;
    case "refund.initiated":
      await handleRefundInitiated(payload);
      break;
    default:
      // BUG: unknown event types are silently ignored instead of rejected
      console.warn(`Unknown event type: ${eventType}`);
  }
}

async function handlePaymentCompleted(payload: unknown): Promise<void> {
  console.log("Payment completed", payload);
}

async function handlePaymentFailed(payload: unknown): Promise<void> {
  console.log("Payment failed", payload);
}

async function handleRefundInitiated(payload: unknown): Promise<void> {
  console.log("Refund initiated", payload);
}
