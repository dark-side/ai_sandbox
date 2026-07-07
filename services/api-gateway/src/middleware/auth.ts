import { Request, Response, NextFunction } from "express";
import { createHmac } from "crypto";

const API_KEY_HEADER = "x-payflow-api-key";
const INTERNAL_SECRET = process.env.INTERNAL_API_SECRET ?? "";

export function requireApiKey(req: Request, res: Response, next: NextFunction): void {
  const key = req.header(API_KEY_HEADER);

  if (!key) {
    res.status(401).json({ error: "Missing API key" });
    return;
  }

  const expected = createHmac("sha256", INTERNAL_SECRET)
    .update(req.path + (req.header("x-request-timestamp") ?? ""))
    .digest("hex");

  if (!timingSafeEqual(key, expected)) {
    res.status(403).json({ error: "Invalid API key" });
    return;
  }

  next();
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}
