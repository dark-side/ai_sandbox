# ADR-003: Database Schema Versioning

**Status:** Accepted  
**Date:** 2024-11-15  
**Deciders:** Platform team

---

## Context

Two schema migrations were applied manually to production in Q4 2024, bypassing
the migration runner. One caused a 20-minute outage when a column was dropped
that a background job still referenced.

## Decision

All schema changes must go through **Flyway** migration scripts located in
`services/payment-validator/migrations/`.

### Rules

1. Migration filenames follow `V{version}__{description}.sql` (Flyway convention).
2. Migrations are **never edited after merge**. Fix-forward only: a new migration corrects
   an earlier mistake.
3. Every migration that drops a column or table must be preceded by a migration
   that removes all references from application code (two-PR pattern).
4. CI runs `flyway validate` before unit tests. A drift between the migration
   history and the actual schema fails the build.
5. Manual schema changes in any environment are prohibited. Exceptions require
   a P0 incident record and a follow-up migration within 24 hours.

## Consequences

- Schema history is fully auditable via the migration files in version control.
- Rollback is handled by the fix-forward approach, not by down-migrations.
- Developers must never use `ALTER TABLE` or `DROP` statements in ad-hoc queries
  against production.
