#!/usr/bin/env python3
"""
Deterministic eval assertions for PayFlow harness output.

Exit 0 = all assertions pass.
Exit 1 = one or more assertions failed.

Usage:
    python deterministic.py [--diff-base HEAD~1]
"""

from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path


ALLOWED_SCOPE = [
    "services/payment-validator/",
    "services/api-gateway/",
]

REPO_ROOT = Path(__file__).parent.parent.parent


def run(cmd: list[str], cwd: Path = REPO_ROOT) -> tuple[int, str, str]:
    result = subprocess.run(cmd, capture_output=True, text=True, cwd=cwd)
    return result.returncode, result.stdout, result.stderr


def check_scope(diff_base: str) -> tuple[bool, str]:
    code, stdout, _ = run(["git", "diff", "--name-only", diff_base, "HEAD"])
    if code != 0:
        return False, f"git diff failed: {stdout}"

    changed = [f.strip() for f in stdout.splitlines() if f.strip()]
    out_of_scope = [
        f for f in changed
        if not any(f.startswith(allowed) for allowed in ALLOWED_SCOPE)
    ]

    if out_of_scope:
        return False, f"Out-of-scope files modified: {out_of_scope}"
    return True, f"Scope OK ({len(changed)} files in allowed scope)"


def check_coverage() -> tuple[bool, str]:
    code, stdout, stderr = run([
        "python", "-m", "pytest",
        "--cov=services/payment-validator",
        "--cov-fail-under=80",
        "-q", "--no-header",
    ])
    if code == 0:
        return True, "Coverage >= 80%"
    return False, f"Coverage check failed:\n{stdout}\n{stderr}"


def check_existing_tests() -> tuple[bool, str]:
    code, stdout, stderr = run([
        "python", "-m", "pytest",
        "services/payment-validator/",
        "-v", "--no-header",
    ])
    if code == 0:
        return True, "All existing tests pass"
    return False, f"Test failures:\n{stdout}\n{stderr}"


def check_boundary_test_exists() -> tuple[bool, str]:
    test_file = REPO_ROOT / "services/payment-validator/test_validator.py"
    if not test_file.exists():
        return False, "test_validator.py not found"

    content = test_file.read_text()
    if "test_amount_zero" in content or "amount=.0.00" in content or "0.00" in content:
        return True, "Boundary test for amount=0.00 found"
    return False, "No test for amount=0.00 boundary condition (ADR-001 requires this)"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--diff-base", default="HEAD~1")
    args = parser.parse_args()

    checks = [
        ("Scope check", check_scope(args.diff_base)),
        ("Coverage >= 80%", check_coverage()),
        ("Existing tests pass", check_existing_tests()),
        ("Zero-amount boundary test exists", check_boundary_test_exists()),
    ]

    all_passed = True
    for name, (passed, message) in checks:
        status = "PASS" if passed else "FAIL"
        print(f"[{status}] {name}: {message}")
        if not passed:
            all_passed = False

    sys.exit(0 if all_passed else 1)


if __name__ == "__main__":
    main()
