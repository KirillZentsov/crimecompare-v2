# backend/CLAUDE.md

## Stack

Python 3.12+, FastAPI, Uvicorn, httpx (async HTTP), supabase-py.

## Structure

```
backend/
├── app/
│   ├── main.py          ← FastAPI app, mounts routers
│   ├── routers/
│   │   ├── compare.py   ← POST /v1/compare
│   │   └── postcodes.py ← POST /v1/postcodes/search
│   ├── services/
│   │   ├── crime_api.py        ← Police.uk API calls (ported from Streamlit)
│   │   ├── postcode_lookup.py  ← Supabase postcode lookup
│   │   └── quota_manager.py    ← Rate limiting (ported from Streamlit)
│   └── core/
│       ├── config.py    ← Settings from env vars (pydantic-settings)
│       └── scoring.py   ← risk_score, CRIME_WEIGHTS (frozen — see DECISIONS.md ADR-004)
├── tests/
│   ├── test_scoring.py
│   └── test_polygon.py
├── pyproject.toml
├── Dockerfile
└── .env.example
```

## Rules

- All config from env vars via `pydantic-settings`. No hardcoded secrets.
- `risk_score` formula is frozen (ADR-004). Tests must pass before any deploy.
- Port logic from Streamlit repo as-is in Phase 1. Refactor is a separate task.
- New pip dependency → one line of discussion first.
- Run tests: `pytest tests/ -v`
- Run dev server: `uvicorn app.main:app --reload --port 8000`

## Key Env Vars

```
SUPABASE_URL=
SUPABASE_KEY=
POLICE_API_BASE=https://data.police.uk/api
ALLOWED_ORIGINS=http://localhost:3000,https://crimecompare.co.uk
```
