# LL Explorer Project Status

This file is a condensed implementation plan with current progress marked.

## Current status

- Phase 0: Complete
- Phase 1: Complete
- Phase 2: Complete
- Phase 3: Complete
- Phase 4: In progress
- Phase 5: Not started

Work is active on the completed Phase 3 map plus Phase 4.

## Updated phase plan

### Phase 0: Scaffold and cleanup

Status: Done
- Created the Vite React app in `app/`
- Added ESLint and Prettier setup
- Moved pipeline/docs assets into:
  - `data-pipeline/`
  - `docs/`
- Moved static assets into `app/public/assets/`
- Copied runtime data into `app/public/data/`
- Removed unused scaffold files from the Vite starter

### Phase 1: Port wireframe components

Status: Done

Delivered:

- Modular React component structure
- Landing page
- LL detail page
- Router-based navigation
- Metadata and GeoJSON loading
- Placeholder charts and placeholder LL detail map
- Ported the wireframe into reusable React components under `app/src/components/`
- Added routed app shell in `app/src/App.jsx`
- Added:
  - landing page
  - LL detail page
  - layout A / B switching
  - metadata hook
  - GeoJSON hook
  - theme tokens
  - chart placeholder data
  - inline SVG icon registry
- Added `react-router-dom`
- Kept the lightweight landing SVG map
- Kept the detail map as a Phase 3 placeholder component

### Phase 2: Bilingual UI

Status: Done

Delivered:

- English / German toggle
- UI translation layer
- Metadata language switching
- Saved language preference
- Added `i18next` and `react-i18next`
- Added `app/src/i18n.js`
- Added EN / DE language toggle in the header
- Switched UI strings to translation keys
- Wired metadata loading to the active language
- Added language persistence with `localStorage`

### Phase 3: Real map with react-leaflet + PMTiles

Status: Done

Delivered:

- Installed `react-leaflet`, `leaflet`, and `pmtiles`
- Replaced the placeholder LL detail map with a real Leaflet map
- Fit map bounds to the selected Living Lab geometry
- Swapped thematic raster overlays by selected tab
- Kept unavailable tabs visible with a clean "coming soon" state

### Phase 4.1: LL data ingestion

Description of feature requirements: Presently the information for the LLs is entered in data-pipeline\python\fetch_nuts.py this is a throwback to when the app was just a dummy version. What is needed is a concrete data input system ideally in a structured format like JSON. However, the challenge is that some data will be user entered i.e. taglines and textual descriptions etc. but some of the data for the charts will be generated programmatically from the preocessing of the spatial data layers (data-pipeline\sources\sources.yaml). Hence the workflow for ingesting data during the app build needs to account for both.  

### Phase 4.2: Extensible geodata pipeline

Status: In progress

Tasks completed:
- [x] Convert the approved Phase 3 + crop-types plan into a live progress checklist in this file
- [x] Add `sources.yaml` and source-registry docs for the crop-types layer
- [x] Add pipeline helpers for loading sources, resolving repo paths, and locating `pmtiles`
- [x] Add `build_pmtiles.py` for clipping, reprojection, palette handling, MBTiles generation, and PMTiles conversion
- [x] Add `sync.py` to copy pipeline outputs into `app/public/data/` and generate `landuse_legend.js`
- [x] Update pipeline requirements, README instructions, `.gitignore`, and the latent repo-root path bug in `fetch_nuts.py`
- [x] Wire app data files: `landuse_legend.js`, `layers.js`, `main.jsx`, and LL detail prop updates
- [x] Update `MapLegend.jsx` to render generated land-use legend entries with language-aware labels
- [x] Replace the placeholder `LLMap` with a real `react-leaflet` + PMTiles map and stub unavailable tabs cleanly
- [x] Install the new frontend dependencies and refresh `package-lock.json`
- [x] Run verification (`npm run lint`, `npm run build`, and targeted Python checks) and record results here


Planned:

- Add working example of ingestion and preparation of a vector data source
- Add tests to ensure consistency of outputs from both PMTiles and vector equivalent processing routines. 
- Add a one-command "refresh all layers" workflow that reads every layer declared in `data-pipeline/sources/sources.yaml`: Goal: one command to refresh all layer outputs instead of building each layer manually:

Likely shape:

- `python data-pipeline/python/build_pmtiles.py --all`

or

- `python data-pipeline/python/build_all_layers.py`

Expected behavior:

- iterate through every layer in `sources.yaml`
- build each layer in sequence
- report successes and failures clearly
- optionally run `python sync.py` at the end

### Phase 4.3 Chart data

Description of feature requirements: for the thematic layers during data preparation add routines to prepare summary data for charts i.e. % area of each crop type. Wire this in the existing CHART.js. THis will be difficult as different data sources will require different charts. 
 

### Phase 5: Documentation

Status: Pending

Planned:

- Rewrite root `README.md`
- Document app architecture
- Document pipeline workflow
- Document how to add labs and layers


## Future pipeline feature



### Phase 3 — Real map (react-leaflet + PMTiles)
- Install `react-leaflet`, `leaflet`, `protomaps-leaflet`, `pmtiles`
- `components/LLMap/index.jsx`: `<MapContainer>` bounded to the selected LL's NUTS-3 feature, vector highlight overlay, one PMTiles raster layer at a time driven by `layer` state
- `components/LLMap/layers.js`: `{ id, i18nKey, url, type: 'categorical'|'continuous' }`
- Land-use layer first (produced by pipeline); others stubbed until built
- Landing keeps its lightweight SVG Germany map (different UX goal)

**Rules:**
- `bundle-dynamic-imports` + `async-suspense-boundaries` — `LLMap` behind `React.lazy` + `Suspense`
- `rerender-transitions` — `startTransition` on layer tab clicks

**Verify:** LLDetail shows a real Leaflet map bounded to the LL; layer tabs swap the raster underlay without jank; `npm run build` shows Leaflet in its own chunk.

### Phase 4 — Extensible geodata pipeline
- `data-pipeline/python/fetch_nuts.py` — trimmed to NUTS fetch + clip
- `data-pipeline/python/generate_metadata.py` — emits `ll_metadata.json` from structured input
- `data-pipeline/python/build_pmtiles.py` — clip → reproject (EPSG:3857) → tile (`gdal2tiles.py` or `rio-tiler`) → pack (`pmtiles convert`) → `data/pmtiles/<id>.pmtiles`
- `data-pipeline/sources/sources.yaml` — declarative registry:
  ```yaml
  layers:
    - id: landuse-corine
      title_en: Land use (CORINE 2018)
      title_de: Landnutzung (CORINE 2018)
      type: categorical
      source_url: https://...
      fetcher: python                  # or 'r'
      script: build_pmtiles.py
      output: data/pmtiles/landuse-corine.pmtiles
  ```
- `data-pipeline/R/fetch_example.R` — stub using `sf` / `terra` + handoff to `pmtiles` CLI, showing how to add R-based sources
- Sync step copies `data/ll_metadata.json`, GeoJSON, and `data/pmtiles/` into `app/public/data/` (a small `data-pipeline/sync.sh` or npm script)

**Verify:**
- `python data-pipeline/python/fetch_nuts.py` from a clean state → regenerates the metadata + GeoJSON identically to today
- `python data-pipeline/python/build_pmtiles.py --layer landuse-corine` → produces a `.pmtiles` that renders in the app

### Phase 5 — Documentation
Rewrite `README.md` to cover:
- Architecture (one-screen overview)
- Quick start (`cd app && npm install && npm run dev`)
- Data pipeline (Python + R setup, how to sync to `app/public/`)
- How to add a new Living Lab
- How to add a new data layer (edit `sources.yaml`, implement fetcher if novel format, run pipeline)
- Deployment to TYPO3 (static sub-path, `npm run build` → `app/dist/`)

In-line code comments: sparse, `Why:` only — projection choice, NUTS-3 clip buffer, PMTiles swap trick. No restating what identifiers already show.

## Out of scope (explicit)

- **React Native / Expo** — not applicable; the `vercel-react-native-skills` skill is not used for this web+static deploy
- **SSR / RSC** — Vite static build is the target; no Next.js
- **TypeScript** — confirmed JavaScript
- **Real chart data** — `chart_data.js` stays placeholder until stakeholders provide a source
- **Tailwind / CSS modules migration** — defer; inline-style-with-theme pattern ports cleanly
- **Authentication** — static public site

## End-to-end verification

After all phases:
1. Fresh clone → `cd app && npm install && npm run dev` → Landing renders Germany map + 5 LLs
2. Click a LL → detail page with real Leaflet map + working layer tabs
3. `DE`/`EN` toggle flips UI and metadata
4. `cd data-pipeline && pip install -r requirements.txt && python python/fetch_nuts.py` → regenerates data identically
5. `npm run build` + `npx serve app/dist` under a sub-path confirms TYPO3-style deploy works
6. Bundle check: main chunk small, Leaflet in its own chunk (via dynamic import)

## Simple dev workflow

### First time only

From the project root:

```powershell
cd app
npm install
```

### For small changes while working

Start the dev server:

```powershell
cd app
npm run dev
```

Then:

- Open the local Vite URL shown in the terminal
- Edit a file in `app/src/`
- Save the file
- The browser should update automatically

This is usually called hot reload or live reload. For normal component/text/style edits, you do not need to rebuild manually.

### When you should refresh or restart

- If you change files in `app/public/`, do a browser refresh
- If you change package dependencies or Vite config, stop and restart `npm run dev`

### When you want a production build

Run:

```powershell
cd app
npm run build
```

This creates the production output in `app/dist/`.

### Optional local production preview

```powershell
cd app
npm run preview
```

That lets you quickly check the built app locally.
