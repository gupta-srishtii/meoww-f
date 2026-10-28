---
name: MAITRI
description: Six sealed worlds you look into — translucent glass floating in living atmosphere, lit by the companion's gold.
colors:
  gold: "#FFD700"
  gold-bright: "#facc15"
  gold-soft: "#fcd34d"
  amber: "#f59e0b"
  forest-primary: "#2E7D32"
  forest-bg-from: "#122416"
  forest-bg-to: "#08120A"
  forest-text: "#F3FDF6"
  forest-text-muted: "#9BBCA4"
  space-primary: "#1A73E8"
  space-accent: "#00F2FE"
  space-bg-from: "#080F26"
  space-bg-to: "#030511"
  space-text: "#E2E8F0"
  space-text-muted: "#94A3B8"
  zen-primary: "#722F37"
  zen-accent: "#BA0C2F"
  zen-bg-from: "#1C1417"
  zen-bg-to: "#0C0709"
  zen-text: "#F8F1F2"
  zen-text-muted: "#C4AEAD"
  medical-primary: "#0EA5E9"
  medical-accent: "#38BDF8"
  medical-bg-from: "#F0F4F8"
  medical-bg-to: "#DCE4EC"
  medical-text: "#09111E"
  medical-text-muted: "#334155"
  focus-primary: "#EF6C00"
  focus-accent: "#FFB300"
  focus-bg-from: "#151515"
  focus-bg-to: "#090909"
  focus-text: "#FFFFFF"
  focus-text-muted: "#888888"
  custom-primary: "#8A2BE2"
  custom-accent: "#FF1493"
  custom-bg-from: "#140526"
  custom-bg-to: "#07010F"
  ink: "#020617"
  ink-panel: "#0F172A"
  text-primary: "#F1F5F9"
  text-secondary: "#CBD5E1"
  text-muted: "#94A3B8"
  text-faint: "#64748B"
  hairline: "rgba(255, 255, 255, 0.05)"
  hairline-strong: "rgba(255, 255, 255, 0.10)"
  surface-veil: "rgba(255, 255, 255, 0.05)"
  surface-veil-hover: "rgba(255, 255, 255, 0.10)"
  vital: "#34D399"
  caution: "#FBBF24"
  alert: "#F43F5E"
typography:
  display:
    fontFamily: "Outfit, Inter, system-ui, sans-serif"
    fontSize: "clamp(3rem, 6vw, 4.5rem)"
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Outfit, Inter, system-ui, sans-serif"
    fontSize: "clamp(1.875rem, 3.5vw, 2.25rem)"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "normal"
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: "normal"
  label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0.05em"
  numeral:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "0.875rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "normal"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  pill: "9999px"
  shell: "36px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  2xl: "32px"
components:
  panel:
    backgroundColor: "{colors.ink-panel}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
    padding: "24px"
  button-primary:
    backgroundColor: "{colors.gold-bright}"
    textColor: "{colors.ink}"
    typography: "{typography.title}"
    rounded: "{rounded.xl}"
    padding: "20px 48px"
  button-primary-hover:
    backgroundColor: "{colors.gold-soft}"
    textColor: "{colors.ink}"
  button-secondary:
    backgroundColor: "{colors.surface-veil}"
    textColor: "{colors.text-primary}"
    typography: "{typography.title}"
    rounded: "{rounded.xl}"
    padding: "20px 40px"
  button-secondary-hover:
    backgroundColor: "{colors.surface-veil-hover}"
    textColor: "{colors.text-primary}"
  button-icon:
    backgroundColor: "{colors.surface-veil}"
    textColor: "{colors.text-muted}"
    rounded: "{rounded.sm}"
    padding: "4px"
  input:
    backgroundColor: "{colors.surface-veil}"
    textColor: "{colors.text-primary}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: "12px 16px"
  chip:
    backgroundColor: "{colors.surface-veil}"
    textColor: "{colors.text-secondary}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "8px 16px"
  nav-shell:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.text-muted}"
    rounded: "{rounded.shell}"
    padding: "10px 12px"
---

# Design System: MAITRI

## Overview

**Creative North Star: "The Living Terrarium"**

MAITRI is not one interface with six color schemes. It is six sealed worlds, and the user is looking *into* one of them. Each world holds its own atmosphere — its own light, its own depth of field, its own weather — and the interface is a set of translucent panes suspended inside it. You never lose sight of the world behind the glass; that continuous, breathing backdrop is the product, and the UI is what floats in it. This is why the background is never a flat fill, why panels are translucent rather than opaque, and why switching worlds cross-fades (450 ms, 700 ms across the light line) rather than cutting: you are not reskinning an app, you are moving between terrariums.

Inside each world, one warm light source is constant: the companion. Gold is its light, not the system's accent color. Everything else — the emerald of the Forest, the cyan of Space, the crimson of Zen, the sky blue of Medical, the amber of Focus — belongs to the world you are currently inside and carries the ordinary accent load. This division is what keeps six distinct atmospheres from collapsing into one generic dark theme with a hue slider.

The density is a workspace density, not a marketing density. Body copy runs small (14px) and labels smaller (12px); panels carry 24px of internal air; the vertical rhythm is a 4px grid worked mostly in 8/12/16/24 steps. Corners are generously soft — 16 and 24px are the workhorses — and nothing has a hard edge. Motion runs in two registers that never blur into each other: the world breathes on 6-to-25-second cycles, and the UI answers in 200–300ms.

**Key Characteristics:**
- Six sealed atmospheres, each complete; the world is visible through every surface
- Translucent glass over living background — never opaque cards on flat color
- Gold is the companion's light; world accent carries the interface
- Hairline borders (white at 5–10%) instead of hard edges or heavy strokes
- Soft, generous geometry: 16–24px radii, roomy padding, nothing sharp
- Two motion registers — slow ambient life, fast UI response — never mixed
- Medical Sanctuary is the one light world, and it inverts deliberately

## Colors

Each world owns a complete palette — a two-stop background gradient, a primary, an accent, a panel tint, a border, and two text values — and swapping worlds swaps all eight at once through CSS custom properties on a `.world-*` class. Across all six, the interface chrome stays in a cool slate-to-near-black range so the world's own hue is the only saturated thing on screen.

### Primary

- **Companion Gold** (`#FFD700`, bright variant `#facc15`): the companion's light. It marks the orb, the single primary action on a screen, and active state. It is the only color that survives a world change unchanged, which is exactly why it must stay rare.
- **World Primary**: each world's structural hue — Forest `#2E7D32`, Space `#1A73E8`, Zen `#722F37`, Medical `#0EA5E9`, Focus `#EF6C00`, Custom `#8A2BE2`. Carries emphasis, selected state, and world identity in nav and controls.
- **World Accent**: the world's glow and highlight hue — Forest gold, Space `#00F2FE`, Zen `#BA0C2F`, Medical `#38BDF8`, Focus `#FFB300`, Custom `#FF1493`. This is the color that appears in glows, focus rings, and active borders.

### Neutral

- **Deep Ink** (`#020617`): the floor beneath everything. The floating nav shell sits at 85% opacity of this; the marketing surface grounds on `#060B08`.
- **Panel Ink** (`#0F172A`): the opaque fallback for panels where translucency would hurt legibility (dense admin tables, form fields on busy backgrounds).
- **Primary Text** (`#F1F5F9`) / **Secondary Text** (`#CBD5E1`): headings and body. Each world overrides these with a tinted equivalent (`--theme-text-main`), so text carries a trace of its world's hue rather than reading pure white.
- **Muted Text** (`#94A3B8`) / **Faint Text** (`#64748B`): metadata, timestamps, inactive labels, units. The heaviest-used color in the entire system.
- **Hairline** (`rgba(255,255,255,0.05)`) and **Hairline Strong** (`rgba(255,255,255,0.10)`): every border in the product. Panels, dividers, input strokes, tab edges.
- **Surface Veil** (`rgba(255,255,255,0.05)`, hover `0.10`): the secondary-surface fill. Ghost buttons, input backgrounds, list-row hovers, icon buttons.

### Tertiary

Status colors, used only to report real state and never as decoration:

- **Vital** (`#34D399`): connected devices, completed steps, healthy telemetry, streak intact.
- **Caution** (`#FBBF24`): approaching a limit, degraded signal, unverified.
- **Alert** (`#F43F5E`): crisis flags, disconnection, failed validation, destructive actions.

### Named Rules

**The Companion's Light Rule.** Gold is the companion's, not the interface's. It is permitted on exactly three things: the companion orb and its aura, the single primary action on a screen, and the current active state. Everything else that wants emphasis takes the active world's accent. A screen with two gold buttons has one too many.

**The One Saturated Thing Rule.** In any viewport, the world's atmosphere and the companion are the only sources of saturated color. Interface chrome — borders, surfaces, text, icons at rest — stays within slate and the white-alpha veils. If a screen reads colorful, something has taken color that should have taken opacity.

**The Medical Inversion Rule.** Medical Sanctuary is the only light world (`#F0F4F8` → `#DCE4EC`, text `#09111E`). It is not a light mode of the others and must never be treated as one: it exists to signal clinical calm, its panels are near-opaque white (92 % since 2026-10-02) rather than dark glass, and any component built for the dark worlds must be explicitly checked against it before shipping.

### Implementation note — the two-palette gap (re-measured 2026-10-02)

Two color systems run in parallel, and this is documented as fact, not endorsed as design:

1. **The world layer** — `--theme-*` custom properties in `src/index.css`, redefined per `.world-*` class, driving the body gradient, `.glass-panel`, and glow. Since 2026-08-29 it has a **bridge**: space-separated `--theme-*-rgb` mirrors back Tailwind's `colors.world` (`bg-world-accent/20`, `text-world-primary`, `border-world-accent/40`), and `src/lib/themeTokens.ts` / `useThemeTokens()` expose the same tokens to canvas and WebGL (with `isLightWorld()` for Medical).
2. **The component layer** — most components outside the yoga tree still hardcode Tailwind values (`slate-400` ≈ 540×, `yellow-400` ≈ 235× across `src/**/*.tsx`). World tokens are used in ~24 component files, almost all of them in `src/wellness-engine/yoga/`.

The consequence: the yoga surfaces follow the world; most of the rest of the workspace changes only its backdrop and glass. New work should use `world-accent` / `world-primary` (or `var(--theme-*)`) rather than a hardcoded hue wherever the element is world-sensitive.

### Implementation note — world fixes (2026-10-02, owner-approved, global)

- **Zen:** the 20 px crimson diamond texture behind every `.glass-panel` is gone; panel hairlines
  are a warm neutral (`rgba(244,230,226,0.10)`). Crimson remains the accent — active, focus, glow.
- **Medical, premium white glass:** `src/index.css` carries a mechanical remap layer under
  `.world-medical` — dark veils (`bg-black/N`, `bg-slate-950|900|800[/N]`) → white glass graded by
  opacity; `border-white/5–40` → ink hairlines; status/brand hues 100–500 → their 700 shade (800 for
  amber, yellow, orange, lime). Panels are 92 % white with a 20 px blur. The hospital backdrop
  is **unblurred** (owner review, 2026-10-08): clear under a light 15 % veil behind the companion,
  faint under a heavier veil full-screen. Yoga surfaces are exempt (their own treatment).
- **`.surface-ink`** marks a deliberately dark island that keeps light text in every world (camera
  preview, controls over imagery, crisis and SOS scrims). Medical's text overrides skip it, using
  `:not(:where(…))` so their specificity is unchanged. New dark islands should use it rather than
  fight the Medical rules.
- **Red is for crisis and SOS.** Toggle "off" states are a quiet veil, never red (the dashboard's
  presence toolbar is the reference).

## Typography

**Display Font:** Outfit (300–800), falling back to Inter, system-ui, sans-serif
**Body Font:** Inter (300–700), falling back to system-ui, sans-serif
**Numeral Font:** the system monospace stack (`ui-monospace`, SFMono-Regular, Menlo)

**Character:** Outfit is geometric and slightly warm — round bowls, open apertures — and it does the emotional work at large sizes. Inter does everything else, chosen for how it holds up at 12 and 14px in dense workspace UI. The mono stack is reserved for numbers that represent measurement: heart rate, timers, hold counts, posture scores, OTP digits. The pairing reads as an instrument built by someone kind.

### Hierarchy

- **Display** (800, `clamp(3rem, 6vw, 4.5rem)`, 1.05, -0.025em): marketing hero headlines only. One per page. Often carries a gold gradient clip on a single emphasized phrase.
- **Headline** (800, 30–36px, 1.15, -0.02em): section openers on marketing surfaces, page titles in the workspace.
- **Title** (700, 18px, 1.4): panel headers, card titles, dialog headings, list-group labels.
- **Body** (400, 14px, 1.65): the default. Prose caps at 65–75ch. 16px is used only where reading is the actual task (blog posts, legal, journal entries).
- **Label** (600, 12px, 0.05em, frequently uppercase): metadata, field labels, badge text, nav labels, table headers. This is the most-used size in the product by a wide margin (479 occurrences of `text-xs` against 212 of `text-sm`) — correct for a telemetry-dense workspace, but it means every 12px decision is a legibility decision.
- **Numeral** (mono, 700, 14px): any figure the product measured rather than authored. Heart rate, BPM, timers, scores, percentages, token counts, verification codes.

### Named Rules

**The Measured Numeral Rule.** If the product sensed it, computed it, or counted it, it is set in mono. If a human wrote it, it is Inter. This is how a user tells telemetry from copy at a glance, and it is the single clearest signal that this is an instrument and not a content app.

**The One Display Rule.** Outfit at display weight appears once per page, on the thing the page exists for. Its scarcity is what makes the marketing surfaces feel composed rather than shouted. In the workspace, display type does not appear at all.

**The Twelve-Pixel Floor.** 12px is the smallest type in the system, and it must be 600 weight or heavier and never below `#94A3B8` on a dark world. There is no 10px or 11px tier; where one appears in current code (`text-[10px]` in the nav, `text-[11px]` in stat labels) it is an exception carried by high weight and short strings, not a tier new work may draw from.

## Layout

The product runs two spatial models.

**Marketing surfaces** are centered single-column: a `max-w-6xl` (1152px) content container inside full-bleed sections, 24px horizontal padding, sections separated by 96px of vertical air (`py-24`). The hero is full-viewport-height with the world video behind it. Prose blocks narrow to `max-w-2xl` (672px). Stat strips and world grids break to 2 columns at `md` and 4 at `lg`.

**Workspace surfaces** are a persistent shell — on desktop a left sidebar plus a right chat drawer (`AppLayout.tsx`; on `/app` the chat arena replaces the drawer), below 768px a separate mobile tree with a header and bottom tab bar (`src/phone/`) — and content in a 12-column responsive grid that collapses to single column below `md`. Panels are the unit of layout: everything lives in a `GlassCard` at 24px internal padding, stacked with 16px (`space-y-4`) between siblings and 24px between groups. Dense panels drop to 16px padding; chip rows and icon clusters run at 8px gaps.

**Spacing rhythm.** A 4px base grid, but the working vocabulary is narrow and should stay narrow: 8, 12, 16, 24, 32. Panel padding is 16 or 24. Sibling spacing is 8, 12, or 16. Section spacing is 24 or 32. Values outside this set need a reason.

**Breakpoints.** `sm` 640px, `md` 768px, `lg` 1024px. `md` carries the real weight (189 uses against 126 for `sm`, 50 for `lg`); `xl` is effectively unused, meaning the design does not currently do anything special above 1280px — wide-screen layout is an open opportunity, not a solved problem.

**Mobile.** Content must clear the fixed bottom tab bar and respect `env(safe-area-inset-*)`: scrollable workspace views carry `.mobile-safe-bottom` (`src/index.css`). Touch targets are at least 44×44px. (The 88px → 66px tab-width rule belongs to the unmounted `FloatingNavbar`.)

### Named Rules

**The Visible World Rule.** No layout may cover the full viewport in opaque surface. Some part of the world's atmosphere stays visible on every screen at every breakpoint — usually the margins and the gaps between panels. A screen that has become an unbroken wall of glass has lost the terrarium.

**The Panel-as-Unit Rule.** Workspace content lives in panels, and panels do not nest more than one level. If content needs a third level of containment, it needs a different information architecture, not another border.

## Elevation & Depth

**Glass over atmosphere.** Depth in MAITRI comes from translucency and blur against a living background, not from stacked shadows. A panel is a pane of glass: you see the world's gradient, its imagery, and its slow motion continuing behind it. The 1px hairline border is what defines the pane's edge — not a shadow, not a color step. Shadow exists to anchor a floating element to the ground plane; it does not do the work of separating a card from a page.

The canonical surface is `.glass-panel`: `backdrop-filter: blur(12px)`, background from the world's `--theme-panel-bg` (a 40–85% tint of the world's darkest value), a 1px `--theme-border` hairline, and `0 8px 32px rgba(0,0,0,0.2)` to seat it. Hover lifts 2px, brightens the border to white/15%, and deepens the shadow to `0 12px 40px rgba(0,0,0,0.3)`.

Blur strength is a hierarchy of its own: 12px for standard panels, 16px (`backdrop-blur-md`) for overlays sitting on content, 24px (`backdrop-blur-2xl`) for the floating nav and modals that must fully separate from what is behind them.

Colored glow is a **separate channel from elevation** and reports state rather than height. The companion's aura, the active nav tab, a focused field, a connected device — these glow. A glow that does not correspond to something being alive, active, or focused is decoration and should be removed.

### Shadow Vocabulary

- **Seat** (`box-shadow: 0 8px 32px 0 rgba(0,0,0,0.2)`): every resting glass panel. Grounds the pane; not a separation device.
- **Lift** (`0 12px 40px 0 rgba(0,0,0,0.3)`): panel hover, paired with a 2px translate and a border brightening.
- **Float** (`0 20px 60px -15px rgba(0,0,0,0.9)`): elements genuinely detached from the page — the bottom nav shell, modals, popovers.
- **Aura** (`drop-shadow(0 0 20px <world accent> / 0.5–0.7)`): the companion only. Per-world: Space `rgba(0,242,254,0.7)`, Medical `rgba(77,208,225,0.6)`, Focus `rgba(255,179,0,0.5)`, Forest/default `rgba(255,215,0,0.65)`.
- **Active glow** (`0 0 15–20px <world accent> / 0.25–0.4`): the `--theme-glow` token. Active tabs, focused inputs, live telemetry.

### Named Rules

**The No-Opaque-Card Rule.** Cards are glass. An opaque panel is permitted only where translucency measurably hurts legibility — dense admin tables, form fields over busy imagery — and it uses Panel Ink (`#0F172A`), never a lightened neutral. If a design needs opaque cards throughout, it is fighting the terrarium.

**The Glow-Means-Alive Rule.** Colored glow reports state: focused, active, connected, sensing, in-progress. Never height, never hierarchy, never emphasis. A static element that glows is lying about being alive.

## Shapes

Soft, generous, and consistently round. The corner vocabulary in shipped code is narrow and should stay that way: **16px (`rounded-2xl`) and 12px (`rounded-xl`) are the workhorses** — 265 and 141 uses respectively — with 8px (`rounded-lg`) for small controls and icon buttons, 24px (`rounded-3xl`) for large primary CTAs, and full pills for badges, chips, avatars, and status dots (175 uses).

One shape sits outside the scale deliberately: the floating nav shell at 36px with 28px tab targets and a 26px active capsule inside it. These are hand-tuned nested radii — the inner radius tracks the outer minus its padding — and they should not be normalized into the scale.

There are no square corners anywhere in the product, and no borders heavier than 1px. Emphasis is achieved by raising border opacity (5% → 10% → 20% → 40%), never by thickening the stroke or changing to a solid color. Dividers are the same hairline as borders. Circular geometry recurs as a motif: the companion's dashed aura ring, the habit completion ring, status dots, avatar frames, and the blurred radial light-bloom shapes behind hero content.

### Named Rules

**The Hairline Rule.** Every border in the product is 1px. Emphasis moves through opacity, never thickness. A 2px border is a bug.

**The Nested Radius Rule.** When a rounded element sits inside another, the inner radius equals the outer radius minus the gap between them. The nav's 36/28/26 progression is the reference implementation.

## Components

### Buttons

- **Shape:** generously soft — 24px (`rounded-3xl`) for marketing CTAs, 16px (`rounded-2xl`) for workspace actions, 8px for icon buttons.
- **Primary:** gold gradient (`#facc15` → `#f59e0b` → `#fcd34d`, left to right) on near-black text (`#020617`), 800 weight, 20px/48px padding on marketing scale. Carries a gold bloom rather than a shadow: `0 0 35px rgba(250,204,21,0.3)`, deepening to `0 0 60px rgba(250,204,21,0.5)` on hover. Subject to the Companion's Light Rule — one per screen.
- **Hover / Focus:** gradient shifts lighter, scale to 1.04, bloom intensifies; active presses to 0.98. Transitions run 300ms. Icons inside translate 4px on hover.
- **Secondary / Ghost:** Surface Veil fill (white 6%, hover 12%), hairline border brightening 10% → 25%, white text at 700, 12px backdrop blur. The default for everything that is not the one primary action.
- **Icon button:** 8px radius, 4px padding, veil fill appearing on the parent's group-hover, `slate-400` icon lifting to white.
- **Destructive:** Alert (`#F43F5E`) as border and text on a transparent fill, never as a filled button. Filled red is reserved for confirmed-destructive dialogs.

### Inputs / Fields

- **Style:** Surface Veil background (white 5%), 1px white/10% hairline, 16px radius, 12px/16px padding, 14px Inter, placeholder at Faint Text (`#64748B`).
- **Focus:** border shifts to the world accent at 60% and gains a matching 1px ring — `focus:border-yellow-400/60 focus:ring-1 focus:ring-yellow-400/60` in current gold-based code. **`focus:outline-none` appears throughout the codebase, sometimes without a replacement ring; every instance without one is an accessibility defect**, and PRODUCT.md's keyboard commitment makes fixing them mandatory.
- **Numeric / code fields:** mono, 700, gold text, larger target (48×56px for OTP digits), stronger focus ring (2px at 40%).
- **Error:** Alert border at 50%, message in Alert at 12px/600 below the field. **Disabled:** 50% opacity, no state transitions.
- **Admin variant:** an older opaque style persists in the admin console (`bg-slate-800`, `border-slate-700`, `focus:border-indigo-500`). It is inconsistent with the glass system and should converge on the veil treatment.

### Cards / Containers

- **Corner Style:** 16px (`rounded-2xl`). **Background:** `.glass-panel` — world panel tint at 40–85%, 12px backdrop blur.
- **Border:** 1px `--theme-border` hairline. **Shadow Strategy:** Seat at rest; Lift on hover when interactive (see Elevation).
- **Internal Padding:** 24px standard, 16px dense. **Hover:** only when the card is actually a control — 2px rise, 1.01 scale, border to white/15%, 300ms.
- The canonical implementation is `src/components/ui/GlassCard.tsx` (`hoverEffect` prop). New panels should use it rather than reassembling glass by hand.
- Thin wrappers built on it (2026-08-29+): `HudPanel` (live practice instruments — binds glow and `aria-live`), `SurfacePanel` + `SectionHeading` (launcher surfaces; `tone="quiet"` for cells inside a tray, with a Medical-aware veil), and `Telemetry` (every measured number — mono, tabular, 12px floor).

### Chips

- **Style:** full pill, Surface Veil fill, hairline border, 12px/600 label, 8px/16px padding. Frequently paired with a leading 8px status dot or a 14px Lucide icon.
- **State:** unselected is veil + slate text; selected takes the world accent at 5–10% fill, accent border at 30%, accent text. World-selector chips additionally carry the world's own accent rather than the global one.

### Dashboard `/app` — Dashboard v2 (owner-approved 2026-10-17, Rule 1 exemption; built in 7 phases)

**The conversation is the centre.** `/app` is a workspace: a chat arena with the companion in it, a stage where the companion and the user can sit together, an Engines panel that says what is really running, and a quick dock the user fills. It replaced the 2026-10-03 "one question, one next step" page; that page's check-in, Today, week and next step live on as dock widgets and in the arena's empty state. Full record: `docs/DASHBOARD_V2_SPEC.md` (§14 is the build log). `pages/dashboard.tsx` only picks the composition — `components/dashboard/DesktopDashboard.tsx` at ≥ 768 px, `phone/dashboard/MobileDashboard.tsx` below — and fetches the week's check-ins.

**Layout (desktop and tablet; revised after the owner's 2026-10-17 review).** A main column and the dock column (`.dash-v2`, index.css). **The dock runs the full height**; only while a widget sits beside the stage does it split into the upper dock and the lower cell — the column keeps one width either way, so only its bottom edge moves. The main column holds the arena row and the stage row, with Engines beside the stage. Tracks animate (260 ms columns, 300 ms the stage row); transitions switch on one frame after the first measurement, and are instant under reduced motion. The layout is driven by the dashboard's **measured** size, not breakpoints — a pure resolver (`lib/dashboard/layout.ts`, tested) whose one invariant is that **the arena is never narrower than 420 px**, in either stage position: space is given back in order (Engines full → compact → pill, dock inline → overlay, side wings → the stage below). The height is the viewport minus `<main>`'s padding; the page does not scroll, the conversation does. The chat drawer and its toggle are not rendered on `/app` (every other page keeps the drawer).

- **Chat arena** (`dashboard/arena/`, shared pieces in `dashboard/chat/` and `dashboard/composer/`, also used by the drawer and phone sheet): a centred reading column (max 3xl) — the companion's **still orb** on the left wall (`CompanionStillOrb`; no live video per message), the user's `AvatarBadge` on the right, avatars on the first message of a run only. The list follows the conversation only while the reader is at the bottom; scrolled up, a "New messages" pill appears. Everything the drawer had stays: the elevated-risk SupportCard pinned on top, suggestion chips, the referral card, web sources, the offline banner, "MAITRI is speaking / Stop", and the always-visible **"Need help now?"**. Header: **History** (past conversations, kept on this device per account — `lib/chatHistory.ts`; switching waits while a reply streams; inline delete) and **New chat** (no confirmation — the conversation goes into history), the conversation's title, and **Join stage** while the stage is left. Empty state: the time-of-day greeting with `preferredName`, then the welcome, then **one next step** (`ArenaNextStep`, `lib/nextStep.ts`, deterministic): before today's check-in a quiet "Start with a check-in…" prompt that focuses the dock's Check-in (or opens the same check-in inline if the dock lacks it); after it, the one step with "Begin" / "Open chat" (an editable opener placed in the composer, never sent) and at most one quiet secondary; then the starters.
- **Composer:** `+` (turns 45° into ×) opens a menu of four real actions — Add a document, Connect a sensor, Web search for facts (On/Off), New conversation — a real `role="menu"` (arrows, Home/End, Esc returns focus). An auto-growing textarea. **Voice is live (2026-10-21, `docs/COMPANION_VOICE_PLAN.md` V2–V4), all of it on the device:**
  - **The morph slot** (`lib/dashboard/composerAvailability.ts`, tested) is **one 40 px element** whose job follows the box: `send` (the world accent, never gold) the moment there is text; `send-disabled` while a reply is still arriving; `voice` ("Start voice conversation", a quiet veil) when the box is empty; `voice-end` ("End voice conversation", an accent hairline on a 25 % accent fill — **never red**, red is crisis only) while a conversation runs. The icon cross-fades (150 ms), the fill changes, the textarea never reflows. Typing during a conversation still morphs it to Send.
  - **The dictation mic** (`composer/DictationMic.tsx`) says what pressing it will do — "Start dictation (on this device)", "Preparing dictation · N %", "Stop dictation". Listening is an accent fill with a **level ring** that follows the microphone (a fixed ring under reduced motion); the same ring sits on `voice-end` while the conversation listens. During a voice conversation the mic is dimmed (`aria-disabled`, a note on press): one owner of the microphone and the text.
  - **Caret insertion** (`lib/voice/dictationMerge.ts`, tested): dictated text goes **at the caret**, interim text is replaced in place by the final text, spaces are fitted and a sentence start is capitalised; text the user types is never overwritten (an edit inside the interim text adopts it). Dictation **never sends**; Send or Enter stops it first.
  - **First use** of either asks once, in a quiet glass prompt above the composer, before the one-time download ("about 67 MB", measured), with "Not now" and "Download and start".
  - **The helper line** under the composer tells the truth about the microphone: "Transcribed on this device" while dictating; "Listening on this device", "MAITRI is thinking…", "MAITRI is speaking · talk to interrupt" during a conversation; a failure in plain words otherwise. Each dictated segment is announced once to screen readers; interim text is not. A spoken user message carries a quiet "Spoken" label, a cut-off reply "Interrupted".
- **Stage** (`dashboard/stage/`): the live chroma-keyed companion for the world and the user's camera tile, in one of **two positions** chosen from the control bar and saved per user (`stagePosition`):
  - **Bottom stage** — **compact**: each tile about 4:3 at the stage's height, at most 512 px, the pair centred (`lib/dashboard/stageGeometry.ts`); a tile may narrow to 1.2:1 to make room for the side strips, never into a letterbox. A **drag divider** between them (0.3–0.7 of the pair, saved per user; a focusable separator — ←/→ 5 %, Home/End, Enter or double-click to even out) and a **Perspective** button (one tile ⅔, then the other). When there is room either side (≥ 140 px), two quiet strips: **"Breathe with MAITRI · in 4 s, out 6 s"** — a soft light swelling and settling on the companion's own breath from the shared clock (`lib/breathPace.ts`; a guide, never a reading of the user's breathing; still under reduced motion) — and the session: real **time on stage** since the companion arrived (mono, ticking only while visible) and the **soundscape** with "Choose".
  - **Side wings** (default since 2026-10-23, owner request; preferences version 3 moved every saved "Bottom stage" from before then to the wings once, and a choice made after is kept) — the companion as a tall wing left of the chat, the camera as a tall wing right of it (200–300 px each), the stage row collapsed, Engines as the pill. No divider and no Perspective (the wings have fixed widths). The wings take priority over an open dock, which opens as the overlay instead; a window too narrow for wings shows the stage below, and the layout button then says "Wings need room" and offers to keep it below. A lower-zone dock widget joins the dock panel while the stage row is absent.
  - **The camera never restarts when the stage moves:** the camera tile is rendered once into a stable host element that whichever slot is showing adopts (`stage/CameraHost.tsx`) — the same `<video>`, stream and perception loop carry straight on. One stage controller serves both positions.
 Camera tile: live and mirrored with "On this device only"; off, it does not collapse — the user's photo or chosen icon on a dark card with one plain line and one action (off · starting · blocked · no camera · stopped). The controls float on the companion tile's edge (wrapping to two rows in a narrow wing): **Leave stage**, Camera, **Voice** (live since 2026-10-21: starts or ends the same voice conversation as the composer's button, shown pressed — accent hairline and dot — while one runs), Perspective (bottom only), the layout button (**Side wings** / **Bottom stage**), and the Engines pill when Engines is closed — quiet, never red. The rules come from one pure state machine (`lib/dashboard/stageMachine.ts`, tested): **a page load never starts the camera**; **Join** (a gesture) starts the camera first and the companion arrives **350 ms after the camera answers**, with a two-note synthesised **chime** (`utils/stageChime.ts`, gesture joins only); the companion never waits on a camera that is denied or missing; **Leave** releases the camera in the same commit, **ends a voice conversation** (mic released, soundscape back up), stops any speech, and collapses the row so the arena takes the full height. Perception models start only once the companion has arrived. Tiles are dark islands (`surface-ink`) with no blur over live video.
- **Engines** (`dashboard/engines/`, words from `lib/dashboard/engineStatus.ts`, tested): Perception, Body sensor, Soundscape, Companion model, Voice — each a state that is **true right now** (Off · Starting · Running on this device · Simulated · Not connected · Local GPU, online/offline · Coming soon) with the way to fix it. The Voice row (`lib/voice/voiceEngineStatus.ts`) follows what the voice is really doing: Not set up · Downloading voice · N % · Loading on this device · On this device, ready · Speaking on this device / System voice · Listening on this device · Voice conversation, MAITRI is thinking · Microphone blocked · Couldn't start (Retry). No numbers but the count of what is on, no library names, no emotion verdicts; on = accent dot, simulated = accent hairline + "Simulated" tag, off/attention = slate, never red or amber. Only the sensor node's own live stream counts as a live body sensor. Forms: a 260 px column, a 56 px icon strip, a 44 px strip above a dock widget, a pill in the stage bar when closed, and a small row in the arena header while the stage is left. The rig is probed every 60 s only while a form that shows it is on screen and the tab is visible.
- **Quick dock** (`dashboard/dock/`): collapsed, a **56 px tab** with a CSS ambient fallback (a breathing accent glow and drifting motes, 12–21 s, transform/opacity only, stilled under reduced motion). Open, a ~340 px column (`clamp(320, 0.3·w, 380)`) that reflows the arena — right-anchored and clipped so it reveals rather than re-wraps — or, when that would squeeze the arena, a modal **overlay sheet** (focus trap, Esc, outside press, focus back to the tab). An **upper zone** beside the arena and a **lower zone** (one tall widget) beside the stage, sharing that cell with Engines, which then shrinks to its 44 px strip; with no widget there the dock runs the full height. Widgets render **bare** — the dock is the panel (Panel-as-Unit) — and load lazily: **Check-in**, **Today**, **Your week**, **Quick note** (a real journal entry; locked when the journal is password-protected), **Yoga** (the routine the UI already reaches), **Body signals** (measured or tagged "Simulated"; "No sensor connected" otherwise; anything labelled `source: 'simulated'` is tagged, whatever path it came by), **Admin tools** (admins only; the sandbox's quick controls — see "Admin tools & sandbox"). **Customize**: move up/down, size, beside the stage ↔ back up, remove, "Add a widget". The layout is saved per user (`maitri-dashboard:<hash of e-mail>`); default Check-in + Today.
- **Check-in** (dock widget, and inline from the arena): the five-step radio group (Struggling · Low · Okay · Good · Great) with Lucide weather glyphs and words, sized to their words; optional tags and a ≤ 280-character note in the standard size; **choose, then Save** — two taps on purpose, because check-ins are **append-only** (no edit, no delete) and a mis-tap must not become a permanent row; "Check in again" adds a row; the note is crisis-scanned server-side. **Today**: progress as words ("2 of 4 habits done", never "0/1"), the habit list's own controls, the checklist link. **Your week**: the last seven days' latest check-in, empty outlines for days without one, one sentence for screen readers.
- **Phone** (`src/phone/dashboard/`, < 768 px, inside `MobileAppLayout`): the page fills the screen and does not scroll — a **stage strip** pinned on top, **collapsed by default** (a 44 px row: status, then Join stage or Show; expanded, two 96 px tiles with Camera and Leave stage; the keyed companion runs only while expanded; a camera left on while collapsed says "Camera on" with a one-tap off) — then the conversation at full height with the composer docked above the tab bar. The header swaps the Chat button for the **Engines pill** and the **Dock button**; Engines, the Dock (every widget at the standard size, with Customize) and the `+` menu open as **bottom sheets** (portalled, drag the handle / backdrop / Esc to close, focus trapped and returned, opaque). Every control is at least 44 px (`.phone-touch`).
- **Sound:** the floating music player is retired. The soundscape library (world ambience, library tracks, one volume) is a glass popover from the sidebar's sound row, the collapsed rail's sound button, and the phone header's speaker (`components/ui/SoundscapeMenu.tsx`) — without the old player's invented progress bar.
- **Session summary** (owner brief 2026-10-23, milestone 3; `dashboard/chat/SessionInsightsDrawer.tsx`, logic `lib/sessionInsights.ts`, state `store/useSessionInsightsStore.ts`): the person's own look back at a conversation. **Summary** (Lucide `Sprout`, a quiet header button like History, shown from the second message they send; icon-only on the phone) opens it; after **New chat** the empty arena offers "Look back on your last conversation" under the starters. Three sections under hairline dividers, no nested cards: **How you seemed** (one sentence on the arc; the camera's first and last reading as two pills, "Tense → Calm", strain in a veil pill and ease in an accent pill; a trail with one mark per message they sent, high and in the world accent at ease, low and slate under strain, a faint tick where the camera had no reading, with its counts in words and mono numerals; a real body sensor's arc the same way; today's check-in), **Thoughts you looked at** (each thinking trap by name and gist, "Looked at together" when the next reply asked about it, else "Came up", which message, never a quote), **Grounding** (each offered tool as a badge, "You opened it" when the suggestion was tapped). The footer says what it is: estimates from the camera on this device, a real sensor and the words, a rough guide, kept only for this session. Desktop: a **400 px panel over the right of the arena** (`absolute`, inset 8 px, `bg-slate-900` — solid Panel Ink in the dark worlds, the near-opaque white Medical gives that class — Float shadow, 220 ms slide and fade, a fade only under reduced motion; non-modal `role="dialog"`, Esc closes, focus in to Close and back to Summary). The 95 % veil was tried first: the conversation showed through at 5 %, which a summary read over text cannot afford. Phone: the shared `BottomSheet` at `large`. Verified in the headless shell at 1440 × 900 (arena 503–1125 px, drawer 716–1116 px) and 375 × 812 (sheet 0–375 px, top 122 px), Forest and Medical, no horizontal overflow; screenshots in `docs/screenshots/session-summary/`.
- **Measured, simulated or omitted — never invented,** on every surface above. The page never shows a face-emotion verdict; the camera only says it is processed on this device. The one place the camera's estimate is shown is the session summary, on request (owner brief 2026-10-23): always "seemed", the source named, the note saying it is an estimate, and a simulated sensor never counted.

### Settings sections and rows (2026-10-08; polished 2026-10-21)

- **`SettingsSection`** (`components/settings/SettingsSection.tsx`) is every Settings group: a real `<button aria-expanded>` inside an `<h2>` (keyboard-reachable — the old headers were clickable `div`s), an icon tile that is neutral at rest and lights in the world accent while its section is open (one hue for every section, never a colour per section), and a body that reveals over 200 ms by easing grid rows. A collapsed body is `inert`. 16 px side padding on phones, 20 px from `sm`. Each section has its own icon (Custom World Controls is the palette). The page title is the workspace headline (Outfit 800, 30 px).
- **Profile identity card** (`ProfileIdentity.tsx`, owner request 2026-10-21 — replaced the 2026-10-08 "native rows", whose right-aligned name and footnote greeting read as awkward): a card with the avatar inside a softly glowing aura ring in the world accent (the avatar is the control — hover or focus brightens the ring and lays "Change" and a camera over it; a camera badge stays for touch), the name exactly as it is being typed (Outfit), the @handle, and the plan and role pills (`AccountBadges.tsx`: plan on a faint accent tint, role on the veil). Below it, plain left-aligned glass fields (`rounded-xl`, white 4 %, hairline, accent border and 1 px ring on focus, 44 px), each with its label and what it is for above, and a mono character count inside its trailing edge that turns amber at 90 % of the limit (name 40, about-you 500). The about-you field grows with its text. Instant settings still save themselves (700 ms debounce, on leaving the field, on leaving Settings) and the card says "Changes save automatically" → "Saving…" → "Saved" / "Couldn't save — Retry"; there is no Save button.
- **Show what a setting does:** under the name field, the companion's real greeting (`lib/greeting.ts`, title and subline, as the dashboard shows them) in a speech bubble beside MAITRI's chat avatar, styled like the arena's replies, updated as you type, captioned "Live preview of how your companion greets you on the dashboard."
- **Choice cards** (`ModelProviderPicker.tsx`): native radios styled as cards, one field for the chosen route, and every state named — loading, unreachable with "Try again", not connected, checking, not recognised, connected, revoked, offline, not set up, saving not enabled.
- **Voice & Speech** (`VoiceSettings.tsx`, 2026-10-21), four small-caps groups, each shown while its feature is live: **Spoken replies** — a "Read replies aloud" switch (off by default), the five voices as choice cards with a preview each, where the voice is made (Automatic · On this device · System voice, "In use" on the active one), and which system voice would be used; **Dictation** — "Stop after silence", 5 · 8 (default) · 12 · 15 s as radio pills, live mid-dictation; **Voice conversations** — one quiet card on where to start one, barge-in, and the soundscape at 20 %; **On-device models & storage** — one row per model (Spoken replies · Kokoro-82M; Dictation & voice conversations · Moonshine-base) with its state, its **measured** size in this browser, a real download percentage, and Download / Test again / Try again / Remove, plus "Remove all speech models". Files a running dictation or conversation uses cannot be removed until it ends. Every state is spelled out, including why a device can't run it. Each model row opens with what it is for, in one line — Spoken replies **speaks** (replies, voice-conversation answers, the previews), Dictation **listens** and never speaks ("No WebGPU needed": it runs on WASM). In a browser with no WebGPU adapter the voice row says "Requires WebGPU, which this browser isn't providing" and folds a "Why, and how to turn WebGPU on" note (Brave or Chrome: `#enable-unsafe-webgpu`, plus Vulkan on Linux; Firefox: `dom.webgpu.enabled`); previews that cannot play say why on the button and in a line under the voices (2026-10-21 clarity pass).
- **Workspace Theme & Audio Mixer** (`AmbienceMixer.tsx`, 2026-10-21): every control in the world accent (it was Space cyan in every world). The volume slider fills to its value in the accent over a slate track that also shows on Medical; a change **glides** on the running synth (`WebAudioSynth.setVolume`, its own effect in `AppLayout` / `MobileAppLayout`) and never restarts it. Under it, what is really playing in words (accent dot when something plays) and "Open sound menu" (`maitri-open-sound`, which the sidebar and the phone header both answer). Background image mode is a pair of choice cards (Companion panel · Full viewport), each saying what it does.
- **Account & Session** (`AccountSession.tsx`, 2026-10-21): a plan-and-role card (the same pills; the plan's end date when an administrator set one), with "Cancel subscription" asking once inline ("Move to Basic straight away?" · Keep · Yes, cancel) because it takes effect at once and only an administrator can restore a plan. Then who is signed in, as a chip (avatar, name, e-mail), beside a quiet Sign out; then Delete account, set apart under a hairline, Alert border and text on no fill. Its confirmation is a real `alertdialog` portalled to `<body>` (a fixed element inside a glass panel is positioned by the panel's backdrop-filter): focus starts on Cancel, Tab stays inside, Escape or a press outside closes it — never while deleting — focus returns to the button, and the filled red confirm shows a spinner while the request runs.

### World picker (2026-10-08)

`components/settings/WorldPicker.tsx`. Each card is a window into its world: the world's real backdrop on its own dark base under its own gradient, primary and accent dots, one line of character, and a "Light" tag on Medical. Each card carries its own `world-*` class, so its tokens are its world's whatever the page is in; dark cards are `.surface-ink` islands. Selected = accent hairline, the world's glow, a check — **never scale, never a ping**. A `role="radiogroup"` with one Tab stop and arrow/Home/End movement.

**Hover previews the whole page** in the hovered world after 120 ms of intent (`uiStore.previewWorld`, never persisted; sound and the companion change only on select). Leaving the grid, blurring it or Escape reverts. Hover is tracked by pointer position against the cards' rectangles, not CSS `:hover`, because Chrome drops `:hover` and fires `pointerleave` when a View Transition starts. Touch and reduced motion: no page-wide preview. A closed section keeps the picker mounted but clipped and `inert`, its rectangle still lying over the sections below: the picker is told it is closed (and checks for an `inert` ancestor or a zero-size grid), tracks nothing then, and closing the section ends any preview at once (fix, 2026-10-21).

### Coming soon — locked features (2026-10-08; none locked since 2026-10-21)

`ComingSoonBadge` (`components/ui/ComingSoon.tsx`): a lock glyph and two words on a quiet veil. Locked content shows at reduced opacity, is not interactive, and is not focusable (screen readers reach it by its heading). **No gold, no dates, no fake progress, no "early access".** Locks are flags in `src/lib/features.ts`, so a feature returns with a one-line change. **Locked today: nothing.** Companion voice was locked from 2026-10-08 until it shipped on the device on 2026-10-21; the Custom Domain world and its controls were locked over the same span and went live on 2026-10-21 (`FEATURES.customWorld`). The **Companion Visual Orb Customizer** was retired on 2026-10-21, not unlocked: the companion is the standardized floating MAITRI still orb (`CompanionStillOrb.tsx`), so there is no clip or aura to choose. Its flag and its Settings card are gone.

### Custom World Controls (2026-10-21)

`components/settings/CustomWorldControls.tsx`, palette logic in `lib/customWorld.ts` (pure, tested). One Settings section, shown in every world:
- **Preview strip** — a `.surface-ink` window onto the palette (its two background stops, primary and accent glows, the hue, harmony and drone). **"Active Sanctuary"** with an accent dot that pings (stilled under reduced motion) when Custom Domain is the active world; otherwise a **"Switch to Custom Domain"** button.
- **Presets** — six palettes, each with its drone: Violet Twilight (the default, 150 Hz), Bioluminescent Emerald (174 Hz), Oceanic Abyss (136.1 Hz), Solar Flare Amber (256 Hz), Rose Quartz Zen (432 Hz), Deep Astral Cobalt (108 Hz). The current one is pressed and checked.
- **Palette** — a primary hue slider (0–359° on a rainbow track) and four accent harmonies: Monochrome 0°, Analogous +45°, Triadic +120°, Complementary +180°. From the hue: primary `hsl(h 70% 50%)`, accent `hsl(h+offset 90% 60%)`, background stops `hsl(h 77% 8.5%)` → `hsl(h 88% 3%)`. Hue and harmony are **read back off the saved colours, never stored**. A preset's accent usually sits at no named harmony, so none is pressed, and moving the hue keeps the accent's distance round the wheel until a harmony is chosen.
- **Ambient drone** — 40–432 Hz, with chips for Deep Hum 55, OM Resonance 136.1, Solar Drone 150 and Harmonic Calm 432. A change **glides** (50 ms time constant, `WebAudioSynth.setFrequency`) and never restarts the synth.
- **Reset to defaults** (disabled when already default).

Pressed states inside the section use the custom palette's own accent, since the section previews that palette. `uiStore.updateCustomSettings` writes every `--custom-*` property on `<html>` whatever the active world: primary and accent in both triple formats, the background stops, and border, panel, glow and text tints derived from them. That way the picker's Custom card and a hover preview always show the user's colours, and a green world never keeps the default's pink hairlines or lilac text. The persisted shape is unchanged (five fields), so older saved custom worlds still load.

### Admin to-do drawer (2026-10-09)

`components/admin/AdminTodoDrawer.tsx`, admins on desktop only. A 24 × 56 handle (44 px hit area) centred on the sidebar's right edge (or the collapsed rail's) opens a 320 px glass panel that slides out from **behind** the sidebar over 220 ms without pushing the layout. A light scrim and Escape close it and return focus to the handle; the closed panel is `inert`. Tasks have one level of subtasks on a hairline guide, an inline "Add a task" field, row actions on hover or focus, a mono "N of M done" count, and a folded "Done (n)" group.

### Admin console dialogs and telemetry (2026-10-21)

The admin console keeps its own opaque slate-and-indigo style (see "Admin variant" above). The
control-center work added one shared primitive and two data displays:

- **`components/admin/AdminDialog.tsx`** is the console's only dialog. It is portalled to `<body>`
  and is a `.surface-ink` dark island, so it stays legible in Medical. It has `role="dialog"` (or
  `alertdialog` for confirmations), aria-modal, and is named by its title. **Focus**: an explicit
  target, then a `data-autofocus` control, then the first field (a radio group at its checked
  option), then the first control in the body or footer, never the corner X. A drawer focuses its
  own panel. Tab stays inside, and Escape or a backdrop press closes it unless a request is
  running. Focus goes back to the opener. `variant="drawer"` is a full-height sheet on the right
  (session review). Inline confirmations inside a dialog move focus onto "Keep…" when they appear,
  back to their trigger when dismissed, and to Close once an action finishes.
- **Uptime meters** (dataviz method): the track is a faint step of the fill's hue. "Heap used of
  allocated" stays sky at any level, because V8 grows the heap and a high share is normal. "Heap
  used of the V8 limit" carries severity: sky, then amber at 75 %, then rose at 90 %.
- **WebSocket split**: one 12 px bar, vitals `#3987e5` and therapy `#d95926` (the palette's dark
  slots 1 and 2, validated on `#0f172a`: CVD ΔE 26.8, normal 31.8, both ≥ 3:1). It has a 2 px gap,
  a 4 px rounded data end, and a legend with counts in text tokens. With no connections it shows an
  empty track and a sentence, never 0-width segments.
- **Service Health Matrix**: four cards (PostgreSQL, WebSocket gateway, Email engine, Auth
  service). Each has a status chip with **icon + label** (Operational, Degraded, Down, Not
  configured) in emerald, amber, rose and orange, a sentence saying what was measured, and a muted
  detail line. Measured numbers stay mono, as everywhere in the console.

### Admin tools & sandbox (2026-10-21 → 22, complete — `docs/ADMIN_SANDBOX_PLAN.md`, Rule 1 exemption, ruling 10)

The admin console's testing, simulation and diagnostics suite. It uses the console's own style.

- **`/admin/tools/:module`** (`pages/admin/tools/`). It has a "Tools & Sandbox" nav item (`FlaskConical`), placed after System Uptime. The item hides only when the server says the sandbox is off.
- **Header.** The page has the console's header: an indigo title, a one-line promise ("Nothing here reaches production data…"), "Checked <time>" and Refresh.
- **Status strip** (a `GlassCard`). Four tiles in the uptime page's stat-tile style:
  - Companion model, E-mail, Sandbox database and Device voice.
  - Each tile has an uppercase label, then a **tone icon + value**, then a one-sentence detail.
  - Tones: emerald (available), amber (needs attention), slate (not set up / unknown). Never red: nothing here is down.
  - The model's words are the Engines panel's own (`modelEngine`).
- **"Running now".** Each live simulation is listed with its module, its start time (mono) and Stop, beside **Stop all**.
- **Modules.** Six module links sit in a wrapping row. They are links, not tabs, because each is a URL: `aria-current="page"`, with the active one in the nav's indigo gradient.
- **Unbuilt modules.** Until a module's phase landed, its panel said so: a "Not built yet · Phase N" chip, what it would do, and what it depended on (the matching strip fact), with no inert controls. Since Phase 7 every one of the six has its panel; `ModulePlaceholder` stays only as the fallback for a module without one.
- **The "Sandbox active" banner** (`components/sandbox/SandboxBanner.tsx`). It appears only while a simulation runs, and it names what is live, with Stop all. It never reads the user's role, so it survives a role preview. It is a `.surface-ink` dark island, so it reads the same in Medical, and it is never red or amber. Placement by variant:
  - **Desktop `/app`:**
    - It is 40 px tall, in flow above `<main>`, with a world-accent hairline and an "Open Tools & Sandbox" link.
    - It publishes `--sandbox-banner-h`. `.dash-v2` subtracts it, so `/app` still doesn't scroll. The floating chat toggle moves below the bar.
    - Its controls sit beside the label, on the left, where the chat drawer (an overlay on the right) can't cover them.
  - **Phone:** under the header, in one block with it. The label is a link, Stop all is a 44 px target, and the summary truncates.
  - **Admin:** opaque, sticky, and pinned flush to the top of the scrolling column. Its offset cancels `<main>`'s padding, so nothing scrolls past above it.

- **Vitals module** (`pages/admin/tools/modules/VitalsModule.tsx`, Phase 1). Two `GlassCard`s, five to seven columns wide from `xl`, stacked below that.
  - **Controls** (left; `components/sandbox/vitals/VitalsControls.tsx`, shared with the dock):
    - "Frames go": Local / Socket, two radio cards with a one-line hint each.
    - Heart rate, HRV and SpO₂: sliders with the value in mono. SpO₂ notes it is always tagged Simulated.
    - Stress: four radio pills with their 0–100 values.
    - Rhythm: six radio cards with hints.
    - One full-width Start/Stop.
    - Selected choices take the console's indigo. Socket is disabled, with the reason, when the API is off, missing or unreachable.
  - **What the dashboard receives** (right):
    - A status line.
    - The ECG preview (below).
    - Six stat tiles, each with a label, a mono value and a hint: frames accepted or shown, came back over the socket, failed or skipped, relay time, socket round trip, running time. "—" is used where the figure doesn't apply to the mode.
    - "The dashboard now shows": five tiles read from the store.
    - "Where it shows", with links to `/app` and `/app/health`.
- **ECG preview** (`components/sandbox/vitals/SandboxEcgPreview.tsx`). One series on an opaque `#0f172a` panel, 140 px tall.
  - A 2 px line in the console's vitals blue `#3987e5` (dataviz checker: passes on `#0f172a`).
  - Solid 1 px hairlines one step off the surface, at each 0.5 s frame boundary and the 512 midpoint.
  - An 8 px end dot with a 2 px surface ring on the newest sample.
  - Scaled like `EcgWaveform` (centred, at least 150 counts), so the shape matches `/app/health`. It isn't `EcgWaveform`, whose "LIVE HARDWARE" header a simulation must not wear.
  - Pointer and arrow keys (Shift for ten, Home/End, Esc) move a crosshair, read in a mono tooltip ("−1.23 s · ADC 640").
  - Its text equivalent is the rhythm sentence below it. There is no legend, because the title names the series.
  - It redraws on new samples only, with no animation loop.
- **Dock widget** (`dock/widgets/AdminToolsWidget.tsx`, Phase 1) has three sizes, medium by default.
  - Order: the status line, then the **actions** (Start/Stop, Stop all, Open full suite), then the settings.
  - Why that order: the fixed sizes hide what's below, and Stop must never need a scroll.
  - Small: status and actions.
  - Medium (also the phone's dock sheet): adds mode, heart rate and a rhythm `<select>`.
  - Tall: adds HRV, SpO₂ and stress, and, right after the actions, **Safety previews** (Phase 3; `SafetyQuickLaunch.tsx`): a heading with a "Safety tools" link, one sentence, Support card and Acute flow. While a preview runs: what is running, "Next acute message" between skips, and End preview. Desktop only: the phone's sheet shows the standard size.
    - Below those, **Role & plan preview** (Phase 5; `components/sandbox/access/AccessQuickPreview.tsx`): a heading with a "What changes" link, a one-line state ("Viewing as … The server still sees you."), two 44 px selects side by side (Role, Plan; "Your own" first) that apply at once, an amber one-liner while a paid plan shows (Cancel subscription is real), and End preview. The dock keeps this widget through a role preview (it reads the real role). Desktop only, like the safety launches.
  - World-accent choices with 44 px targets.
- **Safety module** (`pages/admin/tools/modules/SafetyModule.tsx`, Phase 2; pieces in `components/sandbox/safety/`). A "Nothing recorded" chip and four jump links, then four `GlassCard`s. The scanner, the previews and the helplines are two columns (5 : 7) from `xl`, the library one.
  - **Risk chips** (`SafetyBits.tsx`): None slate, Elevated violet, Acute rose, with who read it ("Server", "Client floor", "Model") in a lighter weight. **Amber is kept for disagreement**, so it never reads as a level: an amber-bordered row or tile with a `AlertTriangle` line saying what the difference does in live chat.
  - **Choices** are radio pills styled as a segmented control (indigo when chosen), 44 px on phones and 36 px from `sm`. Buttons are 44 / 40 px.
  - **Scanner:** One message / Conversation. A conversation is an editable list of turns (Person / Companion, a remove button each, "Add a message"), with "Carried in from before" and "Simulated model reading". On the right:
    - "Live chat would act on" with the level and what shows on screen;
    - six fact tiles: latest, earlier in the window, the window, companion mode (and where it comes from), human support, and the model reading with the cap;
    - then each message, with both chips, its matched patterns in mono, the negation, and the escalation category. Companion turns say they aren't scanned.
  - **Sample library:** "Run all N" top right. Then the score (rounded down), and a 3 × 3 matrix whose diagonal is emerald and whose non-zero off-diagonal cells are amber. Then per-group pills, a client-floor sentence, and the mismatches, missed risk first, each with expected / read chips, why it was expected, and what it costs. The groups below list every phrase with its expectation, and after a run a check or a cross.
  - **Previews:** a status box (what is running with End preview, or the admin's own state in this browser), then the support-card fieldset (helpline source, drawer width) and the acute-flow fieldset (skips 0–3). Both are disabled while a preview runs. "Send the next acute message" shows between skips. On the right: the real `SupportCard` as the chat shows it (320 px wide for the drawer), the links the SOS protocol offered (mono, amber when not in the server's list), the event log (`role="log"`, mono times), and the restore check.
  - **Preview ribbon** (`PreviewRibbon.tsx`): a `.surface-ink` bar across the top at z 400, above the takeovers (300 and 350), with an indigo hairline. It reads "Preview, nothing is recorded", with a one-line note from `md` and End preview (44 px on phones). It shows only while a takeover is open in a preview, and is portalled to `<body>`. Since Phase 3 the banner (`SandboxBanner`) mounts it, so it covers a takeover started from the dock on `/app` too.
  - **Helplines:** Country name / ISO code, a field, Look up, and one chip per country the server knows plus "No country". Then the reply checker. On the right: how the server found the list, the emergency number in mono, each line with its target as **selectable mono text, never a link**, the comparison with the client fallback (a table from `sm`, a block per line on phones, differences in amber), and a folded "Every country against the fallback".

- **Companion module** (`pages/admin/tools/modules/CompanionModule.tsx`, Phase 3; pieces in `components/sandbox/companion/`). A "Nothing recorded" chip, then two `GlassCard`s.
  - **Turn tester:** two columns (5 : 7) from `xl`.
    - **Settings** (`TurnSettings`): the shared `ConversationEditor` (Person / Companion turns, also used by the crisis scanner), then these controls, in segmented pills, selects and fields of the Safety module's kind:
      - Mode: "Auto (live chat: …)" from the server's plan, then Steady, Supportive and Crisis.
      - Context: Synthetic, or "My real context (read-only)", which hides the synthetic fields.
      - World and camera mood hint (selects).
      - Local time: a time zone, a fixed hour or Unknown, with what the prompt says.
      - Check-in mood, 1–5 with their words.
      - Memory, name and bio.
      - Extra context lines.
      - Suggest a person: Auto (yes/no) · On · Off.
      - Country.
      - "Override sampling", which reveals a temperature slider and max tokens; otherwise live chat's values are named.
      - One full-width Run / Stop.
    - **Output** (`TurnOutput`): a status line and the route, in plain terms, never an address. Then:
      - "What the person sees" (the reply) beside "What the model sent", in mono, with the hidden tags as violet-hairline chips.
      - **Safety**, nine fact tiles: keyword reading, the model's own reading (with the raw tag), combined (with the cap), mode, helplines (owed and why), suggested tool, suggest a person, camera hint, web search.
      - **Timings**, stat tiles with mono values: queue wait, time to headers, TTFT, first visible text, generation, total, chunks, estimated tokens per second, the context read, and this browser's own figures. "—" where a figure didn't happen.
      - A folded **System prompt** inspector: characters and ≈ tokens; the local time, history and context counts; an amber line when context lines are dropped; the exact prompt in mono (scrolls past 28 rem).
  - **Benchmark** (`TurnBenchmark`):
    - Runs 1–5 and "The same turn" or "Varying length", with Run / "Stop after run N".
    - Four tiles giving "median · p90" for TTFT, first text, total and queue wait.
    - A sentence: how many finished, that p90 of five runs or fewer is the slowest, and tokens per second.
    - The runs as a table from `sm`, one block per run on phones. Failed runs are amber and never averaged in.
  - Indigo focus rings, 44 px targets on phones, no live links.
  - **Views** (Phase 4): "Turn tester" and "Voice" as indigo pill links beside the heading (`?view=voice`).
- **Voice view** (`components/sandbox/voice/`, Phase 4; lazily loaded). Two `GlassCard`s, two columns (5 : 7) from `xl`.
  - **Voice out:**
    - **Engine:** On-device (Kokoro) · System voice.
    - **Device voice state:** a status box in Settings' words, the measured size in this browser, the last start time, and Download and start / Start / Test again.
    - **Voice picker:** a "All 28 English Kokoro voices (test only)" checkbox, then a select of the five presets (name and description), or all 28 (name, accent, gender, grade, "test only").
    - **System voice:** a select of local English voices, the first option naming what replies would pick, plus a preset select for rate and pitch.
    - Sample text; a speed slider (0.50–2.00×, mono value with the resulting Kokoro speed or rate); Speak and measure / Stop.
    - **Results:** stat tiles for synthesis time, audio length, real-time factor, peak, self-test limits (amber when outside, saying which) and voice; then this session's runs as a table. A system voice shows time to first sound and spoken length, and says why there is no peak or RTF.
  - **Voice in:**
    - An amber notice when dictation or a voice conversation holds the speech model; the controls are disabled then.
    - **Model and reference:** the model's status box; a reference select (three sentences or "Your own text") over its textarea.
    - **Source:** My microphone · On-device voice · A recording file.
      - Record / "Stop and transcribe (n s)" with an indigo level meter (`role="meter"`).
      - "Read it and transcribe".
      - "Choose a recording and transcribe".
    - **Results:**
      - "Heard" in a quiet box, with the source line;
      - tiles for word error rate (with wrong / missed / added of N), transcription, real-time factor and model start;
      - "Against the reference": the words inline. Substitutions are amber chips (the reference struck through, then what was heard), misses red strikethrough, additions violet "+word".
  - **Downloads:** both models ask first, in an `AdminDialog` alertdialog with the size from the device's plan.
- **Access module** (`pages/admin/tools/modules/AccessModule.tsx`, Phase 5; pieces in `components/sandbox/access/`). A "Nothing recorded" chip, then two `GlassCard`s, each two columns (5 : 7) from `xl`.
  - **Role & plan preview** (`AccessPreviewPanel.tsx`, `Eye`):
    - **Left:** a status box (the preview in plain words, or "No preview"; then *your* role and plan in mono, with the plan's end date); two segmented rows, Role (Your own · Standard user · Beta tester · Instructor · Psychologist · Admin) and Plan (Your own · Basic · Starter · Pro · Enterprise), which apply at once; **Open /app** (primary) and End preview; one line on where else it can be ended.
    - **Right:** while a paid plan shows, an **amber note** first ("A real button is on screen": Cancel subscription calls the real route and moves the account to Basic). Then the readout: "As <role>", "On the <plan> plan", "Any role preview", "Any plan preview" and "Not covered yet" (`Info`), each claim a quiet row with the file it rests on below in mono slate-500. With nothing chosen, one line asks for a choice.
  - **E-mail test** (`EmailTester.tsx`, `Mail`):
    - A notice first when it can't send: for any admin but the superadmin ("the tester is off"), or with no Brevo key. Its controls are disabled then.
    - **Left:** Recipient (prefilled with your e-mail); a "Deliver to inbox" checkbox whose hint says what happens either way; ticking it opens an `AdminDialog` alertdialog ("Deliver real e-mails?", focus on Keep sandbox mode). Send in sandbox mode / Send to inbox, beside the quota in mono ("4 / 5 remaining this hour · another frees up at …").
    - **Right:** the last result in an emerald (accepted) or rose (refused) box: Mode, HTTP status, Message id, Time taken and Code in mono, and the error when there is one; earlier sends as mono lines below.
- **Banner during a preview:** the activity's label is `describePreview` ("Viewing as Standard user · Pro plan"), so the banner names it with Stop all, on `/app`, the phone and `/admin`.
- **Sound module** (`pages/admin/tools/modules/SoundModule.tsx`, Phase 6; pieces in `components/sandbox/sound/`). A "Nothing recorded" chip and five jump links (Readout, Worlds, Meditation engine, Tests, Track names), one `Info` line ("Sound plays on this device… no recordings"), an amber alert while the music player or another source holds the audio (every Play and Run disabled then), then five `GlassCard`s.
  - **Live readout** (`Activity`), two columns (5 : 7) from `xl`. Left: a status box ("Playing: Medical Sanctuary · Drone at 120 Hz" with Stop, or "Nothing playing. Your own audio is untouched."), then a Lab volume slider (5 % steps, mono value, a hint that Settings' volume isn't touched). Right: **Level**, a 12 px slate track with an indigo RMS fill and a white 2 px peak tick (`role="meter"`, −60 to 0 dB, mono "RMS −12.3 dB · peak −9.3 dB" beside the label); **Frequency** in mono ("Configured 120.0 Hz · measured 120.0 Hz · Δ −0.01 Hz", Δ emerald within ±0.5 Hz, amber beyond; tones found for the meditation engine; "No pitch (noise) · spectral centroid … Hz" otherwise); two context boxes (Soundscape synth, Meditation engine: state emerald when running, amber otherwise; sample rate; base and output latency in ms); one quiet line naming what holds the audio and the duck level.
  - **World matrix** (`Globe2`): one card per world in a 1 / 2 / 3-column grid (`md`, `2xl`): name, what plays in mono ("Synth at 80 Hz + 120 Hz"), a quiet Play / Playing toggle (`aria-pressed`, indigo when on, the card tinted too), Engine and Configured (with "not used: no pitch" or "not used: your Custom frequency plays"), the engine's behaviour in a sentence, and the description's claims as a list: emerald `Check` "holds" or amber `AlertTriangle` "doesn't hold", each with the reason. The Custom card adds a 40–432 Hz slider that starts at the user's own frequency and glides the playing synth. Three world-wide facts follow as quiet rows with their source file in mono.
  - **Meditation engine** (`Waves`): four cards in two columns: label, Play, what it plays, where the app offers it and under which name, an amber `Info` note when something doesn't work or overclaims, the source file in mono; two engine facts below.
  - **Tests** (`FlaskConical`): four sections in two columns from `xl`, each with its name, one sentence, an indigo Run button ("Running 4 / 12" while it runs, with a 6 px indigo progress bar), then the verdict in an emerald or amber box and the evidence: the sweep and ramp as mono tables (`whitespace-nowrap`, scrolling inside the card if they must), the duck as four mono tiles (Before, Ducked, Down in, Back up in), the clicks as a sentence. "Measured <time>" in mono under each.
  - **Track names** (`ListMusic`): six cards like the world matrix's (title, category, "Plays: …" in mono, the claims), amber-tinted when a claim doesn't hold; never an icon (the library's icons are emoji, G3).
- **Sessions module** (`pages/admin/tools/modules/SessionsModule.tsx`, Phase 7; pieces in `components/sandbox/sessions/`). A "Sandbox database only" chip, one `Info` line (synthetic actors, the real code, nothing reaches the live database, what isn't covered), a rose alert for a refused action, then the database card full width and, from `xl`, two columns (7 : 5): create and drive on the left, the room monitor on the right (`xl:sticky`).
  - **Sandbox database** (`Database`): one status box, emerald when ready (`CheckCircle2`; host / database, "every account in it is synthetic", the migration count and the latest), amber when refused, unreachable or not ready (`AlertTriangle`, the server's reason), slate when not configured (how to set it), with "Check again" beside it (below it on a phone). When ready: "Synthetic actors" with Seed (indigo until seeded, quiet after), the six actors as small cards (name, then level · verified · not accepting clients; the stand-in admin says what it stands in for), the counts in mono, "Open in Session Monitor" and a quiet "Reset sessions" that turns rose on hover and opens a danger `alertdialog` ("Keep them" focused).
  - **Create a session** (`CirclePlus`): State as a segmented control (Requested, Active, Escalated, Completed) with the chain of real handlers it will run in mono beneath ("requestSession → acceptSession → requestEscalation"); Practitioner (junior to specialist); the client's first message; a hand-off checkbox with its hint; an Escalation fieldset (To, Urgency, the rationale) for Escalated; a rating select for Completed. One indigo button ("Running the handlers…" while it runs). The result is a **step trail**: one line per handler — emerald `CheckCircle2` or rose `XCircle`, the handler in mono, "as the Junior", the HTTP status, the ms, the handler's own message beneath.
  - **Drive a session** (`Route`): a session select ("a5195159… · active · Junior → Specialist"); a status chip (amber requested, emerald active, violet escalated, slate completed, rose cancelled), the practitioners, counts in mono and "Review in Session Monitor"; only the actions the session's state allows: Accept / Complete / a rating with Rate; Send as (Client, Practitioner, System) with a textarea and Send; an Escalate fieldset on an active session; a violet box per pending escalation with "Accept as" and Accept, and one quiet line on what the real handler does and doesn't check. The last action's step trail under it.
  - **Room monitor** (`Radio`): a state chip (Not joined, Connecting, Joined emerald, Refused rose, Closed amber), the session's short id in mono, Join / Leave; once joined, Client typing, Practitioner typing and Ping. Below, the log (`role="log"`, `aria-live="polite"`, up to 80 lines, scrolling inside a dark box): time in mono, the frame type in small mono caps, the line coloured by kind (messages bright, status emerald, typing violet, info slate, errors rose).
- **`/admin/sessions`, the "Sandbox data" source** (Phase 7, `AdminSessionMonitor.tsx`; ruling 10 as confirmed). A segmented Live data (`Database`, indigo when on) / Sandbox data (`FlaskConical`, amber when on) switch beside Refresh; `?source=sandbox`. In the sandbox source, under the header, a **banner** that stays pinned while the page scrolls: a `.surface-ink` island (amber-950 ground, a 2 px amber-400 border, `FlaskConical`), "VIEWING SANDBOX DATABASE — SYNTHETIC DATA ONLY" in black uppercase, one line beneath and "Drive sessions" / an amber "Back to live data" from `sm`; on a phone only the title, as a compact strip. The drawer and the assign and close-case dialogs repeat the title as an amber strip at their top. The sessions heading reads "Synthetic Sessions in the Sandbox Database"; a client's "View account" becomes "A synthetic account in the sandbox database.", and the assign dialog's empty state links to Seed instead of the practitioner list. Everything else is the same page.

### Authoring surfaces — Pose Creator and Recording Studio (2026-10-09)

One language for both, recorded in detail in `docs/yoga-studio/YOGA_SURFACES_DESIGN_RECORD.md`: a single glass tray (header · body · footer), an outline rail as real navigation, one thing at a time with the figure always in view (the Wall card in the Creator, the camera in the Studio), layout chosen from the surface's **own width** (≥1024 three columns, ≥704 two, a stepper or picker below — AppLayout takes ~616 px of the viewport first), and a footer whose single gold action is gold **only when it can be pressed** — otherwise a neutral disabled button with its reason beside it as a link that does the missing thing. The Studio rebuilds this in its prefixed stylesheet (Rule 17), not with the Creator's Tailwind.

### Navigation

> **Implementation status (2026-10-02):** `FloatingNavbar.tsx` is **not mounted anywhere** —
> nothing imports it. Workspace navigation today is the **left sidebar** in
> `src/layouts/AppLayout.tsx` (desktop, with the chat drawer on the right on every page but `/app`) and the **bottom tab
> bar** in `src/phone/components/BottomTabBar.tsx` (below 768px, inside `MobileAppLayout`). The
> floating pill below remains the reference craft for the system — its rim highlight was lifted
> verbatim into the yoga hero and practice shell — but don't assume users see it.

**Floating Pill Navbar** (`src/components/ui/FloatingNavbar.tsx`) — the product's signature component and its most complete piece of craft.

A fixed bottom-center shell: 36px radius, Deep Ink at 85%, 24px backdrop blur, 1px white/10% border, Float shadow, and a 1px top inner highlight (`transparent → white/20% → transparent`) reading as light catching the rim. Tabs are 80px wide (66px below `sm`), stacking an 18px Lucide icon over a 10px/700 label. The active tab is a spring-morphing capsule (`layoutId`, stiffness 400, damping 30) filled with a vertical gradient in the world's accent, bordered in that accent at 40%, with an inner white/10% shadow; its icon takes the world's text color and a white drop-shadow.

Above the shell, the **companion character rides the active tab** — a chroma-keyed video that springs horizontally to the selected tab (stiffness 350, damping 26), breathes vertically on a 2.5s loop, casts a soft radial shadow onto the nav below it, and cross-fades its video source when the world changes. This is the clearest expression of the whole system: the companion is present, alive, and attached to where you are.

Marketing navigation is a separate, conventional top header (`MarketingHeader.tsx`) and should stay separate — the floating nav belongs to the workspace.

### Companion Orb

The identity anchor (PRODUCT.md makes it binding). A chroma-keyed video composited to a transparent canvas at 260px height, wrapped in a per-world `drop-shadow` aura (Medical: a soft deeper-sky shadow, since a cyan glow vanishes on white). **It breathes at the resonance pace the product teaches** (`Companion.tsx`, all motion time-based so 60, 120 and 144 Hz look identical): a 10 s vertical cycle (≈4 s rise, 6 s settle; 6 breaths a minute) of 6 px, under a 17 s sideways sway of 3 px, peaking at ~2.4 px/s. Pointer and hand tracking lean it 0.12× toward the target, capped at 24 px, settling in ~1.2 s; hand positions are low-pass filtered first. A 176px dashed ring rotates behind it on a 25-second cycle and swells to 1.04 over 600 ms on hover (the spin and the swell live on separate elements, because both set `transform`). Reduced motion: no float, no lean, no ring rotation — a fully composed still pose. Per-world aura values are listed under Elevation.

**Keying** (`utils/chromaKey.ts`) runs once per decoded video frame (`requestVideoFrameCallback`, with a rAF fallback that skips repeated frames). It keeps greens darker, less pure or cooler than an evenly lit screen, grown from solid seeds, then fills inside the outline of a kept object (convex hull) and small enclosed gaps — which is what keeps Medical's dark-green tie and clipboard solid. `tests/chromaKey.test.ts` pins the sampled pixels.

### Ambient Background

Full-viewport, `z-0`, pointer-events-none: the world's two-stop gradient (135°), the world's `.webp` backdrop, and a WebGL2 animated gradient with a CSS fallback. **World changes** (2026-10-08) run through `document.startViewTransition` in `uiStore`: one compositor cross-fade of the whole page, 450 ms between dark worlds and 700 ms across the light line (`--world-shift-ms`), with a change requested mid-fade queued rather than cutting in. The backdrop image itself dissolves over 800 ms, opacity only — no zoom. Without View Transitions, or under reduced motion, the change is instant. (A per-element colour cross-fade was tried and measured at ~48 fps; the view transition holds 60.) Medical's backdrop is never blurred. Marketing surfaces additionally float two large blurred radial blooms (320px and 288px, 120–140px blur, world accent at 4–5%) on 8s and 10s offset float cycles.

### Motion pace (measured, 2026-10-08)

| What | Pace |
|---|---|
| Companion breath / sway | 10 s / 17 s cycles, 6 px / 3 px, time-based |
| Companion lean, hover swell | 0.12× capped at 24 px, ~1.2 s settle · 1.04 over 600 ms |
| World change | View Transition, 450 ms dark↔dark, 700 ms across the light line |
| Backdrop image | 800 ms opacity dissolve |
| Settings hover preview | 120 ms intent |
| Section reveal, drawer, sidebar collapse | 200 ms · 220 ms · 300 ms then the rail fades in after 220 ms |
| UI feedback (buttons, rows, fields) | 150–200 ms colour/shadow |

Nothing static pings, pulses or spins (`animate-ping` / `animate-pulse` / `animate-spin-slow` were removed from Settings; `animate-in`, `fade-in`, `slide-in-from-*` and `animate-spin-slow` were never defined and are no-ops). Selection is shown by fill and hairline, never by scale. Under reduced motion every item above is instant or still, except the backdrop's opacity dissolve; `src/index.css` also stops Tailwind's looping utilities globally.

## Do's and Don'ts

### Do:

- **Do** reserve gold (`#FFD700` / `#facc15`) for the companion, the single primary action, and active state. Everything else takes the active world's accent.
- **Do** build surfaces as glass over the living background: `.glass-panel` or `GlassCard`, 12px blur, 1px hairline, world panel tint.
- **Do** set every measured value in mono — heart rate, timers, scores, counts, codes — and everything humans wrote in Inter.
- **Do** keep borders at 1px and move emphasis through opacity (5% → 10% → 20% → 40%).
- **Do** stay inside the spacing vocabulary: 8, 12, 16, 24, 32. Panel padding 16 or 24.
- **Do** split motion into two registers — 6–25s ambient for world, orb and background; 200–300ms for UI response — and gate the ambient register behind `prefers-reduced-motion` (PRODUCT.md makes this binding).
- **Do** use spring physics for anything that tracks position or state (nav capsule, companion, world switch) and `cubic-bezier(0.4, 0, 0.2, 1)` for everything else.
- **Do** verify every new component against Medical Sanctuary, the one light world, before considering it done.
- **Do** prefer `var(--theme-accent)` / `var(--theme-primary)` over a hardcoded hue on any element that should respond to the active world.
- **Do** pair every `focus:outline-none` with a visible focus ring in the world accent.

### Don't:

- **Don't** put two gold elements in one viewport. Gold's scarcity is what makes the companion read as a light source.
- **Don't** build opaque cards on the dark worlds. If translucency genuinely hurts legibility, use Panel Ink (`#0F172A`) — never a lightened neutral.
- **Don't** use colored glow for emphasis, height, or decoration. Glow means alive, active, focused, or connected.
- **Don't** introduce square corners or borders heavier than 1px anywhere.
- **Don't** add type below 12px, and don't set 12px lighter than 600 weight or dimmer than `#94A3B8`.
- **Don't** cover the entire viewport in surface. The world stays visible at every breakpoint.
- **Don't** nest panels more than one level deep — a third border means the information architecture is wrong.
- **Don't** treat Medical Sanctuary as a light mode of the other worlds; it is its own world with near-opaque white panels and dark text.
- **Don't** write `focus:outline-none` without a replacement ring. Current code does this in several places; it is a defect, not a pattern to copy.
- **Don't** animate anything decoratively in the fast register. UI motion answers an action; ambient motion belongs to the world.
