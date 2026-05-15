# CrimeCompare v2 — Architecture Decisions

## ADR-001 — Migrate from Streamlit to Next.js + FastAPI

**Date:** 2026-05-14
**Status:** Accepted

**Context:**
Streamlit Community Cloud sleeps after inactivity. Cold starts take 30–90 seconds. Users arrive from the landing page, see a white screen, and leave. Conversion suffers.

**Decision:**
Replace Streamlit with Next.js 15 (frontend) + FastAPI on Railway (backend). Railway hobby tier (£5/mo) keeps the server always warm. Next.js enables SSR for shareable, SEO-indexed URLs per postcode pair.

**Consequences:**
- Streamlit app stays live in parallel until v2 is production-ready and tested.
- Landing page (`crimecompare.co.uk/index.html`) is not touched — it already has good SEO.
- Backend logic from Streamlit repo is ported as-is (no refactor in Phases 1–2).

---

## ADR-002 — Single Dashboard, No Tabs

**Date:** 2026-05-14
**Status:** Accepted

**Context:**
Streamlit version has Month/Quarter tabs for time ranges, which adds complexity and hides data behind clicks.

**Decision:**
Single scrollable dashboard showing all data at once. Side-by-side / Overlay toggle replaces chart tabs.

---

## ADR-003 — Shareable URLs with SSR

**Date:** 2026-05-14
**Status:** Accepted

**Context:**
Each postcode pair comparison is a unique page worth indexing for long-tail SEO.

**Decision:**
Dynamic route `/compare/[a]/[b]` with Next.js SSR. Each pair gets its own OG tags and canonical URL. Google can index millions of postcode pair combinations.

---

## ADR-004 — risk_score Formula Is Frozen

**Date:** 2026-05-14
**Status:** Accepted

**Context:**
`risk_score = min(100, (Σ count × weight) / 80 × 100)` with specific `CRIME_WEIGHTS`. Changing this would break comparability with historical data and user expectations.

**Decision:**
Formula and weights are frozen. Any change requires a new ADR and explicit discussion before implementation.

---

## ADR-005 — shadcn/ui v2 (base-nova) with Slate colour palette

**Date:** 2026-05-15
**Status:** Accepted

**Context:**
Phase 2 requires a UI component library. shadcn/ui is the standard choice for Next.js + Tailwind projects. By the time of implementation, shadcn released v2 which replaced the old "default"/"new-york" style split with a unified "base-nova" preset built on `@base-ui/react` (instead of `@radix-ui/react-*`).

**Decision:**
Use shadcn/ui v2 (`base-nova` preset) with:
- Base colour: **Slate** (OKLCH palette, CSS custom properties)
- CSS variables: enabled (`@theme inline` mapping for Tailwind v4)
- Icon library: lucide-react

Components added at init:
`button`, `input`, `select`, `tabs`, `badge`, `card`, `skeleton`

**Consequences:**
- `@base-ui/react` is the primitive layer (replaces Radix UI).
- `tw-animate-css` handles animations (replaces `tailwindcss-animate`).
- Slate variables are defined manually in `globals.css` — shadcn v2 init does not auto-populate them for Tailwind v4 projects.
