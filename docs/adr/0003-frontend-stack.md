# ADR-0003: Frontend stack — Vite, React 19, TypeScript strict

- **Status:** Accepted
- **Date:** 2026-09-17
- **Milestone:** M0

## Context

SPEC §2.1 specifies "Vite + React 18 + TypeScript (strict)". At the time of the
M0 audit (September 2026) the current stable releases are React 19.3, Vite 8.3
and TypeScript 7.0. React 18 is two majors behind and no longer receives
feature work.

TypeScript 7 is the native (Go) port. `typescript-eslint@8.70` — the only
maintained type-aware ESLint integration — declares a peer range of
`>=4.8.4 <6.1.0`, so pinning TypeScript 7 would disable type-aware linting,
which SPEC §6 depends on.

## Decision

- **React 19.3**, not React 18. This is a deliberate deviation from SPEC §2.1,
  flagged for the spec owner. Nothing in SPEC relies on React-18-specific
  behaviour; React 19 is a drop-in for the patterns this app uses, and starting
  a greenfield project two majors behind would mean a migration inside the same
  ten milestones.
- **TypeScript 6.0.3**, not 7.0. The highest stable release inside
  typescript-eslint's supported range. Revisit when typescript-eslint supports
  TypeScript 7.
- **Vite 7.3**, not 8.3. `@vitejs/plugin-react@6` (the Vite 8 line) requires
  three additional peer dependencies (`oxc-transform-react`,
  `@rolldown/plugin-babel`, `babel-plugin-react-compiler`). Vite 7 with
  `@vitejs/plugin-react@5` is a smaller, well-trodden surface. Vitest 5
  supports both.
- **TypeScript strict**, plus `noUncheckedIndexedAccess`,
  `exactOptionalPropertyTypes`, `noImplicitOverride`, `noUnusedLocals` and
  `noUnusedParameters` (`tsconfig.base.json`). Geospatial code indexes into
  coordinate arrays constantly; `noUncheckedIndexedAccess` is what makes that
  safe.

## Consequences

- If the spec owner wants React 18, it is a version change in one
  `package.json` plus `@types/react`; no application code depends on React 19
  APIs today. The longer this is deferred the more that changes.
- Three pins (TypeScript, Vite, React) are held below latest for concrete,
  documented reasons rather than inertia. Each has a stated revisit trigger.
- The strict flags above will reject some idiomatic-looking code. That is the
  point; see `packages/shared/src/geo.ts` for the intended style.
