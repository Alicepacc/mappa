# ADR-0008: A single Fastify gateway in front of every service

- **Status:** Accepted
- **Date:** 2026-09-17
- **Milestone:** M0

## Context

SPEC §2.2 requires the frontend to talk only to the gateway and the tile host,
and lists seven coverage-checked endpoints. Valhalla and Photon both speak
their own dialects, and neither knows anything about Italian coverage.

## Decision

One Fastify service owning `/api/*`. It is the only public entry point for
non-tile traffic and the only place upstream URLs are known.

Responsibilities:

1. **Coverage enforcement** — every request carrying coordinates is checked
   against the coverage polygon before an upstream is touched (ADR-0011).
2. **Normalisation** — Valhalla and Photon responses become the DTOs in
   `packages/shared`, so the frontend never sees an upstream's shape.
3. **Caching and rate limiting** — one place to reason about both.
4. **Localisation of errors** — SPEC §1.0's user-facing Italian message is
   produced here.

## Rationale

- A frontend that knows three upstreams' shapes is a frontend that breaks when
  one of them is replaced. The DTO boundary in `packages/shared` is what keeps
  M4 and M5 from leaking into M2's code.
- Coverage checks that live in the client are advisory. In the gateway they are
  enforcement.
- Fastify over Express: schema-based validation, meaningfully faster, and
  first-class TypeScript types.

## Consequences

- One extra hop. Negligible next to a routing or geocoding query.
- The gateway is a single point of failure for the API. It is stateless, so it
  scales horizontally.
- Implemented from M0: the validation and coverage behaviour of every endpoint
  is already testable, with the upstream call replaced by a `501` naming the
  milestone that will serve it. A malformed request gets `400` and an
  out-of-coverage one gets `422` today.
