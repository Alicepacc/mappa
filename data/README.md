# data/

Everything in this directory is **generated** by `pipeline/` and is
deliberately not committed (SPEC §0.4). `.gitignore` excludes the lot;
only this file and `.gitkeep` are tracked.

After `make data AREA=dev` you should see:

| File                | Produced by            | Served by |
| ------------------- | ---------------------- | --------- |
| `coverage.geojson`  | step 2 (coverage)      | gateway   |
| `basemap.pmtiles`   | step 3 (Planetiler)    | tiles     |
| `terrain.pmtiles`   | step 4 (DEM)           | tiles     |
| `contours.pmtiles`  | step 4 (gdal_contour)  | tiles     |
| `aerial.pmtiles`    | step 6 (optional)      | tiles     |
| `glyphs/`           | step 5 (Noto Sans SDF) | tiles     |
| `sprites/`          | step 7 (spreet)        | tiles     |
| `valhalla/`         | step 8 (Valhalla)      | routing   |
| `photon/`           | step 9 (Photon)        | geocoding |
| `manifest.json`     | step 10                | gateway   |

If a service reports missing data, run `make data AREA=dev` and check
`make data-summary`.
