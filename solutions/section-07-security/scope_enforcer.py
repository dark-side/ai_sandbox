#!/usr/bin/env python3
"""
Scope enforcer hook — PreToolUse hook for Write, Edit, NotebookEdit.

Blocks any file write outside the declared scope directories.

Wire in .claude/settings.json:
  {
    "hooks": {
      "PreToolUse": [
        {
          "matcher": "Write|Edit|NotebookEdit",
          "hooks": [
            {"type": "command", "command": "python .claude/hooks/scope_enforcer.py"}
          ]
        }
      ]
    }
  }
"""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path

ALLOWED_SCOPE = [
    "services/payment-validator/",
    "services/api-gateway/",
]

# These paths are always readable (never blocked) but the hook only
# fires for write-type tools so reads are unaffected.
READ_ONLY_ALLOWED = [
    "docs/",
    "harness/evals/",
]


def main() -> None:
    raw = os.environ.get("CLAUDE_TOOL_INPUT", "{}")
    try:
        tool_input = json.loads(raw)
    except json.JSONDecodeError:
        # Can't parse input — allow and let the tool handle it
        sys.exit(0)

    file_path = tool_input.get("file_path", "")
    if not file_path:
        sys.exit(0)

    # Normalise to relative path from repo root
    repo_root = Path(os.environ.get("CLAUDE_PROJECT_ROOT", ".")).resolve()
    try:
        relative = str(Path(file_path).resolve().relative_to(repo_root))
    except ValueError:
        # Absolute path outside repo — block it
        print(
            f"BLOCKED: {file_path} is outside the repository.",
            file=sys.stderr,
        )
        sys.exit(1)

    if any(relative.startswith(allowed) for allowed in ALLOWED_SCOPE):
        sys.exit(0)

    print(
        f"BLOCKED: '{relative}' is outside the declared scope.\n"
        f"Allowed directories: {ALLOWED_SCOPE}\n"
        f"To modify files outside this scope, a human must explicitly approve the change.",
        file=sys.stderr,
    )
    sys.exit(1)


if __name__ == "__main__":
    main()
