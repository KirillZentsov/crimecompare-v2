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

---

## ADR-006 — Overlay chart = grouped overlapping bars, not stacked

**Date:** 2026-05-17
**Status:** Accepted

**Context:**
The categories chart needs a side-by-side / overlay toggle. Multiple visual interpretations of "overlay" exist.

**Decision:**
Overlay = grouped overlapping bars at the same X-tick. B bar rendered at 80% of A bar width, both at 0.75 opacity. Tooltip shows both values + percentage difference.

**Consequences:**
Stacked bars were rejected because they imply a combined total, which confuses "comparison" with "sum." Overlapping bars preserve the individual scale while making relative size immediately visible.

---

## ADR-008 — Shareable URL structure: `/compare/[a]/[b]`, radius fixed at 10 min

**Date:** 2026-05-17
**Status:** Accepted

**Context:**
Each postcode-pair comparison needs a canonical, indexable URL. Two options: encode radius in the URL (`/compare/[a]/[b]/[radius]`) or use a fixed default.

**Decision:**
`/compare/[a]/[b]` with radius always defaulting to 10 min walk. Radius is not in the URL.

**Consequences:**
- Clean, short URLs that are easy to share and remember.
- Google indexes one canonical page per postcode pair (not 6 variants per pair).
- Users who want a different radius use the form at `/compare`.

---

## ADR-007 — react-leaflet map deferred to Phase 4

**Date:** 2026-05-17
**Status:** Accepted

**Context:**
Phase 3 includes a map in the ROADMAP, but react-leaflet requires SSR workarounds (`dynamic` import with `ssr: false`), a Leaflet CSS import, and adds leaflet + @types/leaflet to the bundle.

**Decision:**
Move the map to Phase 4 alongside the dynamic route `/compare/[a]/[b]`. The SSR handling for the map aligns naturally with the SSR work already planned for shareable URLs.

**Consequences:**
Phase 3 ships KPI cards, winner banner, and 3 Recharts charts without the map complexity. Phase 4 adds the map once the SSR infrastructure is in place.

---

## ADR-009 — Animation scope: Subtle entrances only

**Date:** 2026-05-17
**Status:** Accepted

**Context:**
Phase 5 adds Framer Motion to improve perceived quality. Multiple scopes were considered.

**Decision:**
- `MotionConfig reducedMotion="user"` at layout level (WCAG 2.1 SC 2.3.3 — motion honours OS preference automatically)
- Fade + slide-up (`y: 12→0`, 350ms ease-out) for result sections and cards
- `staggerChildren: 70ms` for KPI card grid only — "wave" appearance
- No hover-lift on cards; hover reserved for interactive elements (buttons, toggles)
- Recharts default animation retained (`isAnimationActive=true`, ~600ms ease-out)
- Risk score renders with final value immediately; only the card container animates

**Consequences:**
Polished feel without distracting data-heavy users. Users with `prefers-reduced-motion: reduce` get zero animation automatically via `MotionConfig`.
