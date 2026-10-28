# MAITRI v2.0 — AI HANDOFF INDEX

> **READ THIS FILE FIRST.** This folder is the complete context package for any AI (or new human)
> picking up MAITRI 2.0.
> **State verified: 2026-10-02**, in the commit after `1c15743` (`main`) that contains that day's
> fix chunks 1–5. Everything here was checked against the repository on that date. **Do not assume unverified claims are true** — each file marks how
> its facts were established.

---

## 1. What MAITRI is

MAITRI 2.0 (`2.0.0-beta.1`) is an adaptive AI wellness workspace: a React 19 + TypeScript SPA
with an Express 5 / PostgreSQL backend, deployed on Vercel + Render + Supabase, installable as a
PWA and wrapped for Android with Capacitor. It senses the user's state (camera, voice, pose,
Bluetooth and ESP8266 biosensors), adapts six themed worlds and an AI companion, guides recovery
(breathing, meditation, focus, scored yoga, human psychologists, a peer community) and records
the outcome. Repository: `github.com/Vaibhavsolanki1/Maitriv2.0`.

## 2. Current state — one paragraph

The product is a deployed, multi-user beta with most surfaces live. The **Yoga Content Studio**
— recorded instructor poses replacing hand-written joint angles — is code-complete (phases 1–7,
3D practice studio, Pose Creator) but its content phase (recording the 19 native steps) shows no
sign of having started. The 2026-10-02 audit found four P0 and nine P1 items; on the same day the
owner ruled D13–D16 and fix chunks 1–3 closed all four P0s and P1-1…P1-6, P1-8, P1-9 (plus five
defects found on the way, including both WebSockets being broken). Chunk 5 proved it on a
scratch PostgreSQL 17 (migrations up/down/up and the production upgrade path, the persistence
suite 75/75 incl. the new admin and voice-guidance logic, the real `index.js` booted and
smoke-tested) and the work was committed (not pushed, not deployed). Gates: tsc clean, 514/514
tests with the DB, 44 lint warnings / 0 errors, build green. The two pre-existing 500s that
the boot test exposed (P1-12 community feed, P1-13 `avatar_url`) were fixed right after, with a
database suite. Still open: the deploy actions in KNOWN_ISSUES, P1-7 (CSRF), P1-10 (journal
password), deviations D-1 / D-5.

## 3. Document map

| # | Document | Purpose |
|---|---|---|
| 1 | `MAITRI_V2_HANDOFF_INDEX.md` | *(this file)* entry point and reading order |
| 2 | `MAITRI_V2_HANDOFF_NEXT_AGENT.md` | The one-page briefing: what bites, what's next, what not to do |
| 3 | `MAITRI_V2_CURRENT_STATUS.md` | Git state, verified baselines, feature-by-feature status, pending owner decisions |
| 4 | `MAITRI_V2_KNOWN_ISSUES.md` | Every known defect, security gap and canon deviation, with file references |
| 5 | `MAITRI_V2_PROJECT_CONTEXT.md` | What the system is: stack, repo map, architecture, every subsystem |
| 6 | `MAITRI_V2_API_AND_DATA_REFERENCE.md` | Every route, table, migration, WebSocket and env var |
| 7 | `MAITRI_V2_CANON_AND_GUARDRAILS.md` | The yoga rules: locked files, schema/API/auth rules, decisions D1–D16 |
| 8 | `MAITRI_V2_DEV_WORKFLOW_AND_TESTING.md` | Setup, running, test/lint gates, scratch-DB recipe, deploy notes |
| 9 | `MAITRI_V2_AI_RULES.md` | How an AI must behave in this repo (UI, git, mobile/desktop, Android, DB safety) |

## 4. Reading order

- **Fresh session, any task:** 1 → 2 → 9 → 3 → 4.
- **Before touching code:** add 5 and 8.
- **Before touching yoga** (`src/wellness-engine/yoga/**`, `backend/src/features/yoga-recordings/**`):
  add 7, then the canon in `docs/yoga-studio/`.
- **Backend / data work:** add 6.

## 5. Beyond this folder

| Need | Go to |
|---|---|
| Index of all documentation | `docs/README.md` |
| Product truth (users, positioning, what may be claimed) | `docs/PRODUCT.md` |
| Design system | `docs/DESIGN.md` |
| Board-level overview | `docs/PROJECT_OVERVIEW.md` |
| Feature & infrastructure backlog | `docs/PROJECT_BACKLOG.md` |
| Security findings with status | `docs/SECURITY_AUDIT.md` |
| Pricing tiers | `docs/pricing.md` |
| Backup & restore | `docs/database_backup_strategy.md` |
| Yoga canon & design records | `docs/yoga-studio/` |
| Admin Tools & Sandbox (testing and simulation suite, complete 2026-10-22) | `docs/ADMIN_SANDBOX_PLAN.md`; status in CURRENT_STATUS §N–§N.8 |
| Hardware wiring & flashing | `hardware/README.md` |

## 6. Exact next action

1. Read `MAITRI_V2_HANDOFF_NEXT_AGENT.md` in full.
2. Run `git log -1 --format=%H` — if it is not `1c15743f…`, re-run the gates in
   `MAITRI_V2_CURRENT_STATUS.md` §B and treat this package as possibly stale.
3. Do what the owner asked. If they asked for "whatever is most important", follow the suggested
   order in `MAITRI_V2_HANDOFF_NEXT_AGENT.md`.
4. Before you finish, update `MAITRI_V2_CURRENT_STATUS.md` and `MAITRI_V2_KNOWN_ISSUES.md`.
