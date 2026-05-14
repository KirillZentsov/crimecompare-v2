# CLAUDE.md — Instructions for Claude Code

## Start of Every Session

1. Read `CONTEXT.md`, `ROADMAP.md`, `DECISIONS.md`.
2. Find the current task by unchecked checkboxes in `ROADMAP.md`.
3. Confirm understanding in one sentence.
4. If the task is ambiguous, ask exactly one clarifying question.

## Working Rules

**Scope:** Do exactly what the task says. No "while I'm at it" improvements. Extra refactoring → new entry in ROADMAP.md.

**Dependencies:** Never silently add npm/pip packages. One line of discussion before any `install`.

**Tests:** Required for critical logic only: `risk_score`, `make_circle_polygon`, postcode validation. Not for UI.

**Secrets:** Only via env vars. Never in code. `.env.example` contains only placeholder values.

**Uncertainty:** If unsure — say so. Do not invent API signatures or guess syntax.

**Commits:** One logical step = one commit. Format: `type(scope): message` (e.g. `feat(api): add /v1/compare endpoint`).

**Large tasks:** Use Plan Mode. Show plan → wait for approval → execute.

## After Each Task

- Mark checkbox done in `ROADMAP.md`.
- Add ADR to `DECISIONS.md` if an architectural choice was made.
- Provide a verification method: curl command, URL, or `pytest` invocation.
- End with a clear handoff: what was done, what's next.

## Key Constants (DO NOT CHANGE without ADR)

```
risk_score = min(100, (Σ count × weight) / 80 × 100)

CRIME_WEIGHTS:
  violence=10, robbery=9, possession-of-weapons=8,
  sexual-offences=7, burglary=6, vehicle-crime=5,
  drugs=4, theft-from-person=3, criminal-damage-arson=2,
  shoplifting=1

Radius conversion:
  minutes × 80 = metres
  miles × 1609.34 = metres

Colors:
  Postcode A: #1D9E75 (teal)
  Postcode B: #378ADD (blue)
```

## Repo Layout

```
crimes2/
├── CONTEXT.md       ← read first
├── ROADMAP.md       ← current task lives here
├── DECISIONS.md     ← ADR journal
├── CLAUDE.md        ← this file
├── backend/         ← FastAPI (Python)
└── frontend/        ← Next.js 15 (TypeScript)
```
