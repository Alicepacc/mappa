# ADR-0002: pnpm workspace monorepo with source-exporting packages

- **Status:** Accepted
- **Date:** 2026-09-17
- **Milestone:** M0

## Context

SPEC §2 prescribes a pnpm-workspace monorepo with `apps/web`, `apps/gateway`,
`packages/style`, `packages/icons`, `packages/shared`, `pipeline/` and
`infra/`. Frontend and gateway share DTOs (`Place`, `Route`, `Waypoint`), and
the style package shares design tokens with the frontend. Those types must not
drift.

The open question was how internal packages expose themselves: compiled to
`dist/` like published libraries, or as TypeScript source.

## Decision

Internal packages export **TypeScript source**:

```json
{ "exports": { ".": "./src/index.ts" } }
```

Consumers bundle them (Vite for the frontend, esbuild for the gateway). Only
the two applications and the two artefact producers (`style` → JSON,
`icons` → sprite) have a build step.

SPEC §9 requires `pnpm lint && pnpm typecheck && pnpm test && pnpm build` to
pass **in that order**. Had `packages/shared` compiled to `dist/`, `typecheck`
would have failed on a clean checkout because the apps' declarations did not
exist yet — the gate would only pass if `build` ran first, contradicting the
stated order. Source exports remove the ordering dependency entirely.

## Consequences

- `pnpm typecheck` works on a clean checkout with no prior build.
- One less build artefact to keep fresh, and no stale-`dist/` class of bug.
- Type errors in `packages/shared` surface in every consumer at once, which is
  the intent.
- Consumers must be able to compile TypeScript. Both can. If a package ever
  needs to be consumed by something that cannot, it gets a build step then.
