# frontend/CLAUDE.md

## Stack

Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Recharts, react-leaflet, TanStack Query.

## Structure (after scaffold)

```
frontend/
├── app/
│   ├── layout.tsx
│   ├── page.tsx              ← redirects to /compare
│   └── compare/
│       ├── page.tsx          ← empty form (SSG)
│       └── [a]/[b]/
│           └── page.tsx      ← result page (SSR)
├── components/
│   ├── ui/                   ← shadcn/ui components
│   ├── PostcodeInput.tsx
│   ├── KpiCards.tsx
│   ├── CategoryChart.tsx
│   ├── TrendChart.tsx
│   ├── SeverityChart.tsx
│   └── CrimeMap.tsx
├── lib/
│   ├── api.ts                ← API client (TanStack Query fetchers)
│   └── utils.ts
├── .env.example
└── next.config.ts
```

## Rules

- App Router only. No Pages Router.
- All API calls go to `NEXT_PUBLIC_API_URL` (env var). Never hardcode the API URL.
- No new npm packages without discussion.
- Leaflet requires dynamic import with `ssr: false` — always use `next/dynamic` for CrimeMap.
- Colors are fixed: `#1D9E75` (postcode A), `#378ADD` (postcode B).
- Run dev: `npm run dev`
- Type check: `npm run type-check`

## Key Env Vars

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```
