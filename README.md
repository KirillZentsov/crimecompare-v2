# CrimeCompare v2

Compare crime levels between any two UK postcodes. Built on Police.uk open data.

**Live:** [crimecompare.co.uk](https://crimecompare.co.uk)

## What It Does

Enter two UK postcodes → get a side-by-side comparison of:
- Risk score (0–100) and total crime count
- Crime density per km²
- Breakdown by crime category
- 3-month trend
- Severity analysis
- Interactive map

Results are shareable via URL: `crimecompare.co.uk/compare/CO27QG/DE11TQ`

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, TypeScript, Tailwind CSS, shadcn/ui |
| Charts | Recharts |
| Map | react-leaflet |
| Backend | FastAPI (Python) |
| Database | Supabase (1.5M UK postcodes) |
| Hosting | Vercel (frontend) + Railway (API) |
| Data | [Police.uk Open Data API](https://data.police.uk/docs/) |

## Development

### Backend

```bash
cd backend
pip install -e ".[dev]"
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Environment Variables

Copy `.env.example` to `.env` and fill in values. See `backend/.env.example` and `frontend/.env.example`.

## Architecture

- `crimecompare.co.uk/` — static landing page (Vercel, not in this repo)
- `crimecompare.co.uk/compare` — Next.js app
- `api.crimecompare.co.uk/v1/*` — FastAPI

See `CONTEXT.md` for full architecture notes and `DECISIONS.md` for ADR journal.
