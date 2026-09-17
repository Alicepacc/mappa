# Contributing

## Setup

```bash
corepack enable
pnpm install
make check      # lint, typecheck, test, build — ~18s warm
```

Node ≥ 22.12 (`.nvmrc` pins 22), pnpm ≥ 10, Docker, GNU Make.

## Workflow

One branch per milestone, per SPEC §7:

```
feat/m1-data-pipeline
feat/m2-web-shell
```

[Conventional Commits](https://www.conventionalcommits.org/):

```
feat(pipeline): add Planetiler profile for hiking_routes
fix(gateway): reject waypoints outside the coverage polygon
docs(adr): record the DEM source decision
```

Scopes follow the workspace: `web`, `gateway`, `shared`, `style`, `icons`,
`pipeline`, `infra`, `docs`, `ci`.

A milestone ends with a PR containing a summary, screenshots and test notes.
**Work stops for confirmation after each milestone** (SPEC §8).

## Definition of done

Per SPEC §9, before a milestone PR:

- [ ] `pnpm lint && pnpm typecheck && pnpm test && pnpm build` pass
- [ ] `docker compose up` runs the milestone end to end locally
- [ ] Docs updated; an ADR added for any decision that is expensive to reverse
- [ ] No data or secrets committed
- [ ] Manually verified in a browser; known limitations stated in the PR

## Conventions

**TypeScript.** Strict, plus `noUncheckedIndexedAccess`,
`exactOptionalPropertyTypes`, `noImplicitOverride` and no unused locals or
parameters. Geospatial code indexes into coordinate arrays constantly, and
`noUncheckedIndexedAccess` is what makes that safe — do not disable it locally.
`any` is an error; narrow explicitly at the edges instead.

**Comments** explain _why_, not _what_. Where behaviour is driven by the spec,
cite the section (`SPEC §1.5`) so the constraint is traceable.

**Shared types** live in `packages/shared`. If the frontend and the gateway
both need to know a shape, it is defined there once — never duplicated.

**Internal packages export source**, not `dist/`
([ADR-0002](docs/adr/0002-pnpm-monorepo.md)). Do not add a build step to a
package that does not produce an artefact.

**User-facing text** is Italian first, English second, both in
`apps/web/src/i18n/locales/`. Never hard-code a user-visible string in a
component.

## Tests

| Layer    | Tool                      | Where                         |
| -------- | ------------------------- | ----------------------------- |
| Unit     | Vitest                    | `*.test.ts` beside the source |
| Contract | Vitest + `fastify.inject` | `apps/gateway/src/*.test.ts`  |
| E2E      | Playwright                | `e2e/` (from M2)              |
| Visual   | Playwright snapshots      | fixed views, SPEC §6          |

Unit and contract tests must run **without map data** and without a network —
that is what keeps the fast gate fast. Anything needing real tiles belongs in
the E2E workflow.

When changing cartography, regenerate visual baselines deliberately and review
the diff. An updated baseline is a design decision, not a fix.

## Data

Never commit `*.osm.pbf`, `*.pmtiles`, `*.tif`, Valhalla tiles or the Photon
index (SPEC §0.4). `.gitignore` covers them; scripts rebuild them.

Adding a data source means **verifying its licence from the official source
first** and recording it in [CREDITS.md](CREDITS.md) — before any bytes are
fetched (SPEC §0.3).

## Architecture decisions

Write an ADR when a change picks one tool or approach over a viable
alternative, constrains a later milestone, or deviates from `docs/SPEC.md`.
Copy the shape of an existing one in [`docs/adr/`](docs/adr/README.md) and add
it to the index.

Deviating from the spec is allowed — doing it silently is not.
