# InspectWise Go — Structured PWA

## Edit without coding
- Operators: `data/operatorList.json`
- Parts: `data/partsList.json`

## Where logic lives
- AQL & sampling helpers: `js/samplingPlan.js`
- App wiring & UI events: `js/app.js`
- PWA registration: `js/sw-register.js`
- Offline caching: `service-worker.js`

## When you add new files
- Add path to `PRECACHE_URLS` in `service-worker.js`
- Bump `CACHE_NAME` (e.g., `-v6`)
- Commit with message like: `chore: bump cache to v6`

## Free CDNs (pinned)
- jsPDF 2.5.1
- AutoTable 3.5.23
- Fabric.js 5.3.1
