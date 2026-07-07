import { Router, Request, Response } from "express";
import { classifyTicket } from "../handlers/ticket_classifier";
import { submitToHarness } from "../handlers/harness_client";

const router = Router();

/**
 * POST /payments/tickets
 *
 * Ingests a ticket from the internal GitHub issue tracker and submits it
 * to the AI harness for implementation.
 *
 * SECURITY ISSUE (S6 exercise): ticket_description is passed directly to
 * the AI harness without sanitisation.  A malicious ticket description can
 * contain prompt-injection instructions that redirect the agent to write
 * files outside the declared scope, exfiltrate secrets, or modify unrelated
 * services.
 */
router.post("/tickets", async (req: Request, res: Response) => {
  const { ticket_id, ticket_description, priority } = req.body;

  if (!ticket_id || !ticket_description) {
    return res.status(400).json({ error: "ticket_id and ticket_description are required" });
  }

  // BUG: no sanitisation — raw ticket_description forwarded to harness
  const classification = await classifyTicket(ticket_description);

  const harnessPayload = {
    ticket_id,
    description: ticket_description, // injection surface — S6 exercise
    classification,
    priority: priority ?? "normal",
  };

  try {
    const result = await submitToHarness(harnessPayload);
    return res.status(202).json({
      ticket_id,
      status: "queued",
      harness_job_id: result.job_id,
    });
  } catch (err) {
    console.error("Harness submission failed", err);
    return res.status(500).json({ error: "Failed to submit ticket to harness" });
  }
});

/**
 * GET /payments/tickets/:id
 *
 * Returns the status of a submitted ticket.
 */
router.get("/tickets/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  // TODO: implement status lookup
  return res.status(200).json({ ticket_id: id, status: "pending" });
});

export default router;
