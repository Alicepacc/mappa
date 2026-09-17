# Repository audit (M0)

SPEC §7 asks that the repository be read before anything is changed, and that
existing code be summarised with a proposal for integrating or restructuring
it. This is that audit, performed at the start of M0.

## What was in the repository

Commit `08ff142`, two files, 18.8 KB total:

| Path           | Size    | Contents                       |
| -------------- | ------- | ------------------------------ |
| `README.md`    | 7 bytes | `# mappa`                      |
| `docs/SPEC.md` | 18.7 KB | The full project specification |

Two commits (`29c5c53` initial, `08ff142` adding the spec). No source code, no
build tooling, no CI, no dependency manifest, no licence file, no `.gitignore`.

## Finding

**There is no existing code to integrate or restructure.** The repository is a
specification and nothing else, so M0 is greenfield scaffolding and the SPEC §7
integration question does not arise. No restructuring proposal is needed; the
layout follows SPEC §2 directly.

## Environment observations that shaped M0

Recorded because they affected decisions, and because they will affect CI:

1. **Current releases are ahead of the spec's assumptions.** SPEC §2.1 names
   React 18; the current stable line is React 19.3. TypeScript's latest (7.0)
   is not yet supported by `typescript-eslint`, which SPEC §6's type-aware
   linting needs. Both are resolved and justified in
   [ADR-0003](adr/0003-frontend-stack.md) — the React version is a deliberate
   deviation flagged for the spec owner.

2. **Geofabrik is unreachable from this environment.** The network egress proxy
   blocks `download.geofabrik.de`. This does not affect M0, which builds no
   data, but pipeline step 1 and the `e2e.yml` / `data.yml` workflows will need
   either an allowlist entry or a mirror. Noted in
   [pipeline.md](pipeline.md#network-access).

3. **Host toolchain is Node 22.22, pnpm 10.33, Docker 29.3, Java 21, Python
   3.11, GNU Make 4.3.** GDAL, osmium and tippecanoe are absent, which is
   expected: they live in the pipeline image
   (`pipeline/Dockerfile`), not on the host.

4. **`pnpm@10` blocks postinstall scripts by default.** esbuild needs its to
   place its platform binary, so it is listed under `onlyBuiltDependencies` in
   `pnpm-workspace.yaml`. Nothing else in the tree requires one — worth keeping
   that way.

## Licence

SPEC §7 says to ask before adding a LICENSE file. **None has been added.**
`package.json` carries `"license": "UNLICENSED"` as a placeholder so tooling
does not assume anything. This needs a decision — see the open questions in
the M0 summary.

Note the interaction worth deciding deliberately: OpenStreetMap data is ODbL,
which imposes share-alike obligations on derived _databases_. That constrains
how the produced tiles may be distributed, but does not dictate the licence of
this source code. They are separate choices.
