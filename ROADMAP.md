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

- [x] Next.js 15 scaffold in `frontend/` (App Router, TypeScript, Tailwind)
- [x] shadcn/ui init + base components
- [x] Page `/compare` — empty form shell
- [x] TanStack Query setup
- [x] Postcode autocomplete component (wired to `/v1/postcodes/search`)
- [x] Loading states & progress indicator ("Looking up postcodes → Fetching data → Calculating scores")
- [x] Error states (invalid postcode, API down, quota exceeded)

## Phase 3 — Charts & UI (4–5 days)

- [x] KPI cards (total crimes, risk score, density per km²)
- [x] Winner banner
- [x] Recharts: crime categories (side-by-side / overlay toggle)
- [x] Recharts: 3-month trend
- [x] Recharts: severity breakdown
- [x] Text summary block

## Phase 4 — Shareable URLs + SEO + Map (1–2 days)

- [x] Dynamic route `/compare/[a]/[b]` with SSR
- [x] SSR pre-rendering for Google indexing
- [x] OG tags (title, description, image) per postcode pair
- [x] Sitemap generation
- [x] Canonical URLs
- [x] react-leaflet map with postcode markers + circle polygons

## Phase 5 — Polish (2 days)

- [x] Mobile QA (winner banner text wrap fix, categories chart toggle sticky on mobile)
- [x] Framer Motion animations (subtle entrances, stagger KPI cards, MotionConfig reducedMotion="user")
- [x] Comprehensive error states (role="alert", aria-live, aria-atomic on loading/error)
- [ ] User feedback widget — **deferred** (not needed for launch)
- [ ] Final cross-browser QA — manual (Chrome + Firefox + Safari)
- [x] Vercel deployment config (`frontend/vercel.json`; set NEXT_PUBLIC_API_URL env var in Vercel dashboard)
- [ ] Cut over: update crimecompare.co.uk DNS to point to Vercel — user action
- [ ] Decommission Streamlit — leave as fallback for now

---

_Last updated: Phase 5 in progress — animations + mobile QA + Vercel config done; cut-over + QA remaining_
