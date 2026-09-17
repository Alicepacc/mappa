# ADR-0007: Photon for search and reverse geocoding

- **Status:** Accepted
- **Date:** 2026-09-17
- **Milestone:** M4

## Context

SPEC §2.2 names Photon. SPEC §1.4 requires debounced autocomplete with viewport
bias, Italian-first ranking across comuni/frazioni/località/cime/rifugi/
addresses, and inputs as varied as `Rifugio Vajolet`, `Via del Corso 1 Roma`
and `46.5, 11.8`. SPEC §3.1 step 9 requires languages it, en, de, fr.

The alternative is Nominatim directly (excellent structured geocoding, poor
prefix/typo-tolerant autocomplete) or Pelias (more moving parts).

## Decision

[Photon](https://github.com/komoot/photon), restricted to the coverage area,
indexed in it/en/de/fr.

## Rationale

- Photon is built for **type-ahead**: prefix matching and typo tolerance out of
  the box, which Nominatim does not do well.
- It carries OSM's multilingual `name:*` tags natively — which is exactly what
  the bilingual Alto Adige / Ladin requirement in SPEC §4.1 needs.
- It supports reverse geocoding from the same index, so one service covers both
  SPEC §1.4 needs.

## Open question for M4

Photon ≥1.0 dropped Elasticsearch in favour of OpenSearch, and GraphHopper
publishes weekly per-country index dumps at
`download1.graphhopper.com/public/extracts/by-country-code/`. Building from our
own extract via Nominatim gives control and reproducibility; importing the dump
is far cheaper. The choice is made in M4 against the Photon docs current at
that time, and recorded as a follow-up ADR.

## Consequences

- Italian-first ranking is **ours to implement** in the gateway, not Photon's.
  Photon returns candidates; the gateway re-ranks by place type, population and
  distance from the viewport centre.
- Coordinate input (`46.5, 11.8`) never reaches Photon — the gateway parses it
  and answers directly.
- A separate JVM service with its own index on disk. See
  `docs/resource-estimates.md`.
