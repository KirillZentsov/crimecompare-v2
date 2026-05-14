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
