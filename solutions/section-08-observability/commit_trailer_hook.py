#!/usr/bin/env python3
"""
Reference Solution (S8) — AI attribution commit trailers.

A PostToolUse hook on git commit (or a git `post-commit` hook) that appends attribution
trailers to any commit created inside an agent session. Trailers live in the commit
message body, so they survive squash-merge, rebase, fork, and archive restore — unlike a
PR-description note. A `git log` query on any checkout then answers "which lines were
agent-generated?" for the compliance audit.

Wire in .claude/settings.json:
  {
    "hooks": {
      "PostToolUse": [
        {
          "matcher": "Bash",
          "hooks": [
            {"type": "command", "command": "python .claude/hooks/commit_trailer_hook.py"}
          ]
        }
      ]
    }
  }
"""

from __future__ import annotations

import json
import os
import subprocess
import sys

HARNESS_VERSION = os.environ.get("PAYFLOW_HARNESS_VERSION", "1.4.0")
MODEL = os.environ.get("PAYFLOW_ACTIVE_MODEL", "claude-sonnet-4-6")

TRAILERS = [
    ("Co-authored-by", "payflow-harness <noreply@payflow.internal>"),
    ("X-AI-Harness-Version", HARNESS_VERSION),
    ("X-AI-Model", MODEL),
]


def _is_git_commit(tool_input: dict) -> bool:
    cmd = tool_input.get("command", "")
    return "git commit" in cmd


def main() -> None:
    # Only act on git commit invocations inside an agent session.
    raw = os.environ.get("CLAUDE_TOOL_INPUT", "{}")
    try:
        tool_input = json.loads(raw)
    except json.JSONDecodeError:
        sys.exit(0)

    if not _is_git_commit(tool_input) or os.environ.get("CLAUDE_AGENT_SESSION") != "1":
        sys.exit(0)

    # Amend the just-created commit with trailers if they aren't present yet.
    msg = subprocess.check_output(["git", "log", "-1", "--pretty=%B"], text=True)
    additions = [f"{k}: {v}" for k, v in TRAILERS if f"{k}:" not in msg]
    if not additions:
        sys.exit(0)

    new_msg = msg.rstrip() + "\n\n" + "\n".join(additions) + "\n"
    subprocess.run(["git", "commit", "--amend", "-m", new_msg], check=True)
    print(f"Added {len(additions)} attribution trailer(s) to HEAD.", file=sys.stderr)


if __name__ == "__main__":
    main()
