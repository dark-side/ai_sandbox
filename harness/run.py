#!/usr/bin/env python3
"""
PayFlow AI Harness — main runner.

Reads a ticket file, classifies it, builds a prompt, and calls the
Anthropic API to generate a PR implementation.

KNOWN GAPS (intentional — these are the exercises):
  - No eval gate: generated output is accepted without quality checks (S2)
  - No cost tracking: tokens used per run are not recorded (S5, S7)
  - No pre-push hook: generated code is committed without scope validation (S6)
  - No OTel instrumentation (S7)
  - Single-model routing: all task types call the same frontier model (S5)
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path

import anthropic


MODEL = "claude-opus-4-6"  # BUG: all tasks use the same frontier model (S5 exercise)
PROMPTS_DIR = Path(__file__).parent / "prompts"
CONFIG_PATH = Path(__file__).parent / "config.yaml"


def load_ticket(ticket_path: str) -> str:
    path = Path(ticket_path)
    if not path.exists():
        print(f"Error: ticket file not found: {ticket_path}", file=sys.stderr)
        sys.exit(1)
    return path.read_text()


def load_system_prompt() -> str:
    prompt_file = PROMPTS_DIR / "implement.md"
    if not prompt_file.exists():
        return "You are a senior software engineer. Implement the requested feature."
    return prompt_file.read_text()


def run_harness(ticket_content: str, dry_run: bool = False) -> dict:
    client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

    system_prompt = load_system_prompt()

    # No pre-processing, no scope check, no cost estimate before calling
    messages = [
        {
            "role": "user",
            "content": f"Implement the following ticket:\n\n{ticket_content}",
        }
    ]

    if dry_run:
        print("[dry-run] Would call model:", MODEL)
        print("[dry-run] Ticket length:", len(ticket_content), "chars")
        return {"status": "dry_run"}

    print(f"Calling {MODEL}...")

    response = client.messages.create(
        model=MODEL,
        max_tokens=8192,
        system=system_prompt,
        messages=messages,
    )

    # No eval gate — output is accepted unconditionally
    result = {
        "model": response.model,
        "input_tokens": response.usage.input_tokens,
        "output_tokens": response.usage.output_tokens,
        "content": response.content[0].text,
    }

    # No cost tracking — tokens are logged but not persisted or compared to budget
    print(f"Tokens used — input: {result['input_tokens']}, output: {result['output_tokens']}")

    return result


def main() -> None:
    parser = argparse.ArgumentParser(description="PayFlow AI Harness")
    parser.add_argument("--ticket", required=True, help="Path to ticket markdown file")
    parser.add_argument("--dry-run", action="store_true", help="Print config without calling API")
    parser.add_argument("--output", help="Write output JSON to this file")
    args = parser.parse_args()

    ticket = load_ticket(args.ticket)
    result = run_harness(ticket, dry_run=args.dry_run)

    if args.output:
        Path(args.output).write_text(json.dumps(result, indent=2))
        print(f"Output written to {args.output}")
    else:
        print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
