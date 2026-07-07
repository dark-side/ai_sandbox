# ADR-004: API Versioning Policy

**Status:** Accepted  
**Date:** 2026-07-01  
**Deciders:** Platform team, API consumers (mobile, partner integrations)

---

## Context

The API gateway has broken three partner integrations in six months by changing
response shapes without notice. Partners discovered breaking changes in production.

## Decision

### URL versioning

All public API endpoints are prefixed with a version segment: `/v1/`, `/v2/`, etc.

### Compatibility window

- A version is **supported** for a minimum of **12 months** after the next version ships.
- Breaking changes (removed fields, changed types, new required fields) require a new version.
- Additive changes (new optional fields) may ship in the current version.

### Deprecation process

1. Announce deprecation via the partner developer newsletter ≥ 90 days before sunset.
2. Add a `Deprecation` response header to deprecated endpoints.
3. Remove the endpoint only after the 12-month window closes.

### Internal APIs

Services within the PayFlow cluster communicate over versioned gRPC contracts
(`.proto` files in `services/proto/`). Breaking proto changes follow the same
12-month window.

## Consequences

- API gateway routes must include the version prefix; unversioned routes are rejected.
- The AI harness must not generate code that modifies a versioned endpoint's
  response shape without an explicit version bump.
- Partner SLAs require written notice of breaking changes — accidental breakage
  constitutes a contract violation.
