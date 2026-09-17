# ADR-0001: Record architecture decisions

- **Status:** Accepted
- **Date:** 2026-09-17
- **Milestone:** M0

## Context

SPEC §8 asks M0 to produce "ADRs for key choices". The project spans a data
pipeline, four backend services, a cartographic style system and a frontend,
and it will be built over ten milestones. Decisions taken in M0 (tile format,
routing engine, coverage model) constrain M5 and M9. Without a record, the
reasoning behind those constraints is lost and gets re-litigated — or worse,
silently violated.

## Decision

Record every decision that is expensive to reverse as a numbered ADR in
`docs/adr/`, using MADR-flavoured markdown. An ADR is warranted when a choice:

- picks one tool or approach over a viable alternative, or
- constrains later milestones, or
- deviates from `docs/SPEC.md`.

Superseding an ADR means writing a new one and marking the old one
`Superseded by ADR-NNNN`. ADRs are not edited to change their decision after
acceptance; only status and links are updated.

## Consequences

- Reviewers can see the reasoning without reading the implementation.
- Deviations from SPEC.md are explicit and auditable rather than tacit
  (see ADR-0003).
- A small ongoing cost: one short document per significant decision.
