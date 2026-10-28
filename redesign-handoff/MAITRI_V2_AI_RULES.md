# MAITRI v2.0 — AI CODING & WORKSPACE RULES

> Strict operating rules for AI assistants (Claude, Gemini, or any other) working on the MAITRI
> 2.0 codebase. **Moved from `rules_for_AI/Rules.md` on 2026-10-02** and extended with sections
> 7–10. Sections 1–6 are the owner's original rules, unchanged in substance.
>
> Tool-loaded companion: `.agents/rules/workspace-rules.md` (Antigravity/Gemini) carries a short
> version of §1–§4 and points here. The yoga subsystem has additional, stricter rules:
> `MAITRI_V2_CANON_AND_GUARDRAILS.md`.

---

## 1. UI & Visual Design Constraints
- **Preserve Existing UI**: **Do NOT change, redesign, or restyle the UI** unless explicitly requested by the user.
- **Maintain Layouts**: Keep existing layouts, color palettes, spacing, typography, and component structures intact.
- **Targeted Scope**: Apply changes strictly to requested logic, state, backend, or specific UI elements without unsolicited aesthetic overhauls.
- When a restyle *is* requested, follow `docs/DESIGN.md` and `docs/PRODUCT.md`, and record that it was requested (several yoga plans did this explicitly as a "Rule 1 exemption").

## 2. Image & Media Asset Policy
- **No Excessive Images**: **Do NOT add extra, excessive, or unnecessary images/media** to pages or components.
- **Explicit Need Only**: Only include or generate images when explicitly requested by the user or strictly required for a specified feature.
- **Asset Integrity**: Reuse existing assets from `/public/assets` whenever applicable instead of generating redundant files.
- **No OS emoji in UI.** Use `lucide-react` icons (`aria-hidden` when a text label sits beside them). Enforced by `tests/emojiBan.test.ts`.

## 3. Git & Deployment Safeguards
- **No Unsolicited Git Push**: **NEVER run `git push`** or push commits/branches to remote repositories unless explicitly instructed by the user.
- **Local Control**: Keep all changes local until the user explicitly requests a git push or release action. Don't commit unless asked.
- **Careful Staging**: Ensure temporary files, build artifacts, or secret files are not committed — never `.env`, `backend/backups/*.dump`, real DSNs, API keys or Wi-Fi credentials.
- **No deploys** (Vercel, Render, Android, firmware flash) unless asked.

## 4. Code & Architecture Standards
- **Preserve Existing Code**: Do not remove existing comments, docstrings, or features unless asked or necessary for bug fixes. Many files carry long "why" comments that cite canon sections and traps — keep them.
- **Verify & Test**: Validate changes by running `npx tsc -b`, `npm test`, `npx oxlint` and, when relevant, `npm run build` before finishing tasks. Report failures honestly; never weaken a test to make it pass.
- **Concise & Direct**: Keep changes clean, modular, and directly aligned with user requests.
- **Don't fix what you weren't asked to fix.** If you notice an unrelated defect, record it in `MAITRI_V2_KNOWN_ISSUES.md` instead of changing it.

## 5. Mobile UI & Desktop Isolation Rules
- **Separate Layouts**: Mobile uses `src/phone/MobileAppLayout.tsx` with bottom tab navigation. Desktop uses `AppLayout.tsx` with left sidebar + right chat drawer. **Never merge them into one file.**
- **Desktop is Sacred**: When modifying mobile UI, **NEVER change desktop-specific classes, layouts, or breakpoints** in `AppLayout.tsx` or any `md:` / `lg:` / `xl:` prefixed styles unless the user explicitly asks.
- **Platform Detection**: Always use `src/utils/platform.ts` (`isMobileViewport()`, `isCapacitorNative()`, `useIsMobile()`) as the single source of truth for conditional rendering. Do NOT hardcode `window.innerWidth` checks scattered across components.
- **All Phone Components Live in `src/phone/`**: All phone-only layouts and components (`MobileAppLayout`, `BottomTabBar`, `MobileHeader`, `ChatBottomSheet`) live exclusively in the dedicated `src/phone/` directory. Do not mix them into `src/components/ui/` or `src/layouts/`.
- **Touch Targets**: All mobile interactive elements must have a minimum 44×44px tap target. Never make buttons, checkboxes, or links smaller than this on mobile.
- **Safe Areas**: Always account for device notches and gesture bars using `env(safe-area-inset-*)` CSS in mobile layouts.
- **Test Both Viewports**: After any layout or component change, verify that **both** desktop (1440px+) and mobile (375px) views are unbroken.

## 6. Capacitor & Android APK Rules
- **Skip Android Dev Until Asked**: Do not run Android APK builds, gradle commands, `npx cap sync android`, or modify Android platform configurations unless the user explicitly requests Android or native app work.
- **Do NOT modify `android/` directory manually**: The `android/` folder is generated and managed by Capacitor. Use `npx cap sync` to push changes only when asked. Only modify `android/` files when configuring native settings (icons, splash, permissions).
- **API Base URL**: The mobile APK must use the deployed backend URL (not localhost). Set `VITE_API_URL`; every client resolves its base through `getApiBaseUrl()` in `src/utils/apiConfig.ts`.
- **No PWA Prompts in Native**: When running inside Capacitor (`isCapacitorNative() === true`), hide all PWA install banners and "Download App" buttons — the user is already in the native app.
- **Build Before Sync**: Always run `npm run build` before `npx cap sync android` when Android sync is specifically requested. Never sync stale or dev-mode bundles to the Android project.
- **Don't Commit Android Build Artifacts**: `android/app/build/` is gitignored. Never commit APK/AAB files to the repository.

## 7. Database Safety
- **Never point a dev backend or a test run at the production database.** `db.migrate.latest()` runs on every boot.
- Use a **local** scratch Postgres; the yoga persistence suite reads `YOGA_TEST_DATABASE_URL` only.
- **Never use the knex CLI** for migrations against a scratch DB (it can silently retarget production). Use the programmatic runner in `MAITRI_V2_DEV_WORKFLOW_AND_TESTING.md` §4.2.
- **Migrations are append-only** — add a new file; never edit one that has run.
- Never `DELETE` yoga data; take a backup before anything destructive.

## 8. Honesty in the Product
- **Never claim what is not built** (`docs/PRODUCT.md` "Not built — never imply otherwise"): no payment flow, no i18n, no clinical validation, no fake testimonials or metrics.
- **Measured or omitted:** a figure appears in the UI only if the product measured it or derived it from a measurement; absent data is omitted, never zeroed or estimated.

## 9. Yoga Subsystem
- Read `MAITRI_V2_CANON_AND_GUARDRAILS.md` before touching `src/wellness-engine/yoga/**` or `backend/src/features/yoga-recordings/**`.
- Locked files are never edited — write a new module instead (D11.4).
- Ambiguity in the canon → **stop and ask the owner**; don't invent a resolution.
- Follow `docs/yoga-studio/AI_IMPLEMENTATION_WORKFLOW.md` for phase work.

## 10. Keep the Handoff Alive
- Before ending a session that changed behaviour, update `docs/ai-handoff/MAITRI_V2_CURRENT_STATUS.md` (git state, baselines, what changed) and `MAITRI_V2_KNOWN_ISSUES.md` (fixed items removed, new items added with file references).
- Mark every claim with how you know it (ran it / read it / was told). "Claimed" is not "verified".
- New documentation goes in `docs/` (see `docs/README.md`), never in a new top-level folder.
