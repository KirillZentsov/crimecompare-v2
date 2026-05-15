# CrimeCompare v2 — Roadmap

## Phase 1 — Backend (3–4 days)

- [x] Initialize repo structure (CONTEXT, ROADMAP, DECISIONS, CLAUDE, README, .gitignore)
- [x] Copy `crime_api_async.py`, `postcode_autocomplete.py`, `quota_manager.py` into `backend/app/`
- [x] FastAPI skeleton (`main.py`, `app/` structure, health endpoint)
- [x] Endpoint: `GET /v1/health`
- [x] Endpoint: `POST /v1/postcodes/search` (autocomplete)
- [x] Endpoint: `POST /v1/compare` (main comparison logic)
- [x] Unit tests: `risk_score`, `make_circle_polygon`, postcode validation
- [x] `pyproject.toml` with all dependencies
- [x] `Dockerfile` for Railway
- [x] Deploy to Railway, bind `api.crimecompare.co.uk`
- [x] Smoke test all endpoints on prod

## Phase 2 — Frontend Skeleton (2–3 days)

- [ ] Next.js 15 scaffold in `frontend/` (App Router, TypeScript, Tailwind)
- [ ] shadcn/ui init + base components
- [ ] Page `/compare` — empty form shell
- [ ] Postcode autocomplete component (wired to `/v1/postcodes/search`)
- [ ] TanStack Query setup
- [ ] Loading states & progress indicator ("Looking up postcodes → Fetching data → Calculating scores")
- [ ] Error states (invalid postcode, API down, quota exceeded)

## Phase 3 — Charts & UI (4–5 days)

- [ ] KPI cards (total crimes, risk score, density per km²)
- [ ] Winner banner
- [ ] Recharts: crime categories (side-by-side / overlay toggle)
- [ ] Recharts: 3-month trend
- [ ] Recharts: severity breakdown
- [ ] react-leaflet map with postcode markers + polygons
- [ ] Text summary block

## Phase 4 — Shareable URLs + SEO (1–2 days)

- [ ] Dynamic route `/compare/[a]/[b]` with SSR
- [ ] SSR pre-rendering for Google indexing
- [ ] OG tags (title, description, image) per postcode pair
- [ ] Sitemap generation
- [ ] Canonical URLs

## Phase 5 — Polish (2 days)

- [ ] Mobile QA (vertical stack, sticky toggle)
- [ ] Framer Motion animations
- [ ] Comprehensive error states
- [ ] User feedback widget
- [ ] Final cross-browser QA
- [ ] Cut over: update crimecompare.co.uk to point to new app
- [ ] Decommission Streamlit (or leave as fallback)

---

_Last updated: Phase 1 complete ✓ — Phase 2 next (Next.js scaffold)_
