# ADR-0009: Generate MapLibre styles from TypeScript

- **Status:** Accepted
- **Date:** 2026-09-17
- **Milestone:** M0

## Context

SPEC §4 requires four base styles (Base, Turistica, Invernale, Aerea) sharing
tokens, with Mapy.com-level density at z13–16, and validation against the
MapLibre style spec in CI. A style at that density is thousands of lines of
JSON; four of them sharing a palette, by hand, is not maintainable.

## Decision

Styles are **TypeScript functions** in `packages/style` that take a
`StyleContext` (tile host, glyph URL, sprite URL, coverage URL) and return a
`StyleSpecification`. `pnpm --filter @mappa/style build` writes JSON to
`dist/`; `pnpm style:validate` runs the official validator over the in-memory
styles.

## Rationale

- **Shared tokens are enforced by the compiler.** `carto.forest` is one value in
  `tokens.ts`; a style cannot drift from the palette without a type error.
- **Repetition becomes code.** Road hierarchy, per-difficulty path dashes and
  parallel route offsets are loops, not copy-paste.
- **Environments are parameters.** The same source produces the local compose
  style and a deployed one; no find-and-replace over JSON.
- **Validation runs against the real object**, so it is meaningful whether or
  not `build` has run. It is wired as both a script (for CI) and a unit test.

## Consequences

- A style change means a rebuild. The build is milliseconds.
- `StyleSpecification` from `@maplibre/maplibre-gl-style-spec` types the output,
  so a malformed expression is a compile error rather than a runtime
  "layer ... is not a valid layer".
- The generated `dist/*.json` is gitignored; it is an artefact.
- M0 ships only `base`, with the land background and the coverage mask — the
  two things fully specified before any tiles exist. It exists to prove the
  generate-and-validate loop, not to look finished.
