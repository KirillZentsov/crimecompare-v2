# CrimeCompare v2 — Project Context

## What This Is

Migration of CrimeCompare from Streamlit (cold-start problem) to Next.js + FastAPI.
Compares UK crime levels between two postcodes using Police.uk API data.

## URLs

| Environment | URL |
|---|---|
| Landing (don't touch) | https://crimecompare.co.uk |
| Old app (stays live until v2 ready) | https://crimecompare.streamlit.app |
| New compare page | https://crimecompare.co.uk/compare |
| New shareable result | https://crimecompare.co.uk/compare/{A}/{B}?radius=10min |
| API | https://api.crimecompare.co.uk/v1/* |
| Streamlit source repo | https://github.com/KirillZentsov/CrimeCompare |

## Stack

| Layer | Technology |
|---|---|
| Landing | Current index.html on Vercel — DO NOT TOUCH |
| Frontend `/compare` | Next.js 15 (App Router) + TypeScript |
| UI | Tailwind + shadcn/ui |
| Charts | Recharts |
| Map | react-leaflet |
| State | TanStack Query |
| Backend | FastAPI on Railway (£5/mo hobby, always warm) |
| Database | Supabase (~1.5M UK postcodes, trigram index, quotas, feedback) |

## Key UX Decisions

- Single dashboard, no tabs (no Month/Quarter split like Streamlit)
- Side-by-side / Overlay toggle for charts
- Live progress indicator: "Looking up postcodes → Fetching data → Calculating scores"
- Mobile-first: vertical stack + sticky A/B/Both toggle
- Colors: Teal `#1D9E75` = postcode A, Blue `#378ADD` = postcode B
- Shareable URLs with SSR for SEO (Google indexes each postcode pair)

## Glossary

- **postcode** — UK postcode (`CO2 7QG`). Stored as `postcode` (with space) and `search_key` (no space, for trigram search).
- **polygon** — Array of `[lat, lng]` points for Police.uk API. 32-point circle approximation via `make_circle_polygon`.
- **risk_score** — Weighted score 0–100. Formula: `min(100, (Σ count × weight) / 80 × 100)`. Weights in `CRIME_WEIGHTS` (violence=10, robbery=9, …, shoplifting=1). DO NOT change without discussion.
- **radius** — User selects in minutes (5/10/15) or miles (0.5/1/2). Conversion: minutes × 80 = metres, miles × 1609.34 = metres.
- **search_key** — Postcode without spaces, uppercase (`CO27QG`). Supabase column for fast lookup.

## Repo Structure

```
crimes2/
├── CONTEXT.md
├── ROADMAP.md
├── DECISIONS.md
├── CLAUDE.md
├── README.md
├── .gitignore
├── backend/
│   ├── CLAUDE.md
│   ├── app/
│   ├── tests/
│   └── pyproject.toml
└── frontend/
    ├── CLAUDE.md
    └── (Next.js scaffold goes here)
```
