# ADR-0014: Local-first storage in IndexedDB, no accounts in v1

- **Status:** Accepted
- **Date:** 2026-09-17
- **Milestone:** M7

## Context

SPEC §1.6 requires saved places and routes in folders with name, note, colour
and icon, stored in IndexedDB via Dexie, with JSON and GPX export/import, and
explicitly no accounts in v1. SPEC §1.7 adds an emergency coordinates panel
that must send data nowhere.

## Decision

All user data lives in the browser, in IndexedDB via Dexie. No server-side user
storage, no authentication, no telemetry. Export and import are the only ways
data leaves or enters.

## Rationale

- **No accounts means no account infrastructure**: no auth, no password resets,
  no GDPR data-subject workflows, no breach surface. For a map that saves
  waypoints, that is a large saving for a small loss.
- It makes the SPEC §1.7 promise ("no data sent anywhere") structural rather
  than a claim in a privacy policy.
- Export/import covers the real need behind sync — moving a list to another
  device — without a backend.

## Consequences

- Clearing site data loses everything. The UI must say so plainly where users
  save things, and export must be obvious rather than buried.
- No cross-device sync. If it is wanted later it is a new ADR and a real
  backend; the export format is the migration path, so it is versioned from the
  start.
- Dexie schema versioning matters from the first release: migrations run on
  users' own data with no server-side backfill available.
