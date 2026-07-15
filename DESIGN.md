---
name: Nextide UI v2
description: A precise, confident, alive interface foundation for Nextide products.
colors:
  signal-turquoise: "#1ee4bc"
  focus-teal: "#006b5a"
  graphite-canvas: "#0a0a0a"
  graphite-surface: "#171717"
  graphite-raised: "#262626"
  paper-canvas: "#ffffff"
  paper-surface: "#f5f5f5"
  ink-primary: "#0a0a0a"
  ink-inverse: "#fafafa"
  warning-yellow: "#ffda53"
  danger-red: "#ff3355"
  intelligence-purple: "#af2eff"
typography:
  brand:
    fontFamily: '"Nextide Display", system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif'
    fontSize: "1.75rem"
    fontWeight: 700
    lineHeight: 0.92
    letterSpacing: "-0.01em"
  display:
    fontFamily: '"Nextide Display", system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif'
    fontSize: "2rem"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "-0.015em"
  title:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "1.1875rem"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "0"
  body:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0"
  label:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0"
  caption:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.35
    letterSpacing: "0"
  micro:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "0"
rounded:
  control: "0.5rem"
  surface: "0.625rem"
  overlay: "0.75rem"
spacing:
  hairline: "0.25rem"
  compact: "0.5rem"
  control: "0.75rem"
  content: "1rem"
  section: "1.5rem"
  region: "2rem"
components:
  button-primary:
    backgroundColor: "{colors.signal-turquoise}"
    textColor: "{colors.ink-primary}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "0.625rem 0.875rem"
    height: "2.5rem"
  button-secondary:
    backgroundColor: "{colors.graphite-raised}"
    textColor: "{colors.ink-inverse}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "0.625rem 0.875rem"
    height: "2.5rem"
  input:
    backgroundColor: "{colors.graphite-surface}"
    textColor: "{colors.ink-inverse}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "0.625rem 0.75rem"
    height: "2.5rem"
  surface:
    backgroundColor: "{colors.graphite-surface}"
    textColor: "{colors.ink-inverse}"
    rounded: "{rounded.surface}"
    padding: "1rem"
---

# Design System: Nextide UI v2

## Overview

**Creative North Star: "The Signal Desk"**

The Signal Desk is a focused place where complex activity becomes clear, actionable state. The system is precise enough for campaign operations, confident enough for commercial decisions, and alive enough to feel recognizably Nextide. It uses familiar SaaS dashboard ergonomics, then earns distinction through typographic discipline, information hierarchy, state behavior, and selective signal color.

The foundation stays quiet at rest. Product identity comes from composition: Daedalus Console is a dense operational workbench, Creator Portal is a guided mobile task flow, and Kraken is an evidence-led analytical product. They share primitives and interaction truth without sharing a page template or product theme fork.

The system rejects generic shadcn dashboard output, card grids without hierarchy, unbounded decorative glow and glass, universal brand-font treatment, and compressed-desktop mobile layouts. A precise turquoise glow is reserved for the primary product lockup and live signal marks.

**Key Characteristics:**

- Graphite and paper neutrals with turquoise used as a scarce signal.
- Fixed, readable product typography with real weight roles and predictable metrics.
- Tonal layering at rest; lift only communicates state or temporary depth.
- Dense information grouped by task, not by a reflex to put every fact in a card.
- Responsive composition changes at 320, 390, 768, and 1440 CSS pixels.

## Colors

Graphite and signal: neutral surfaces carry the work while turquoise marks the current action, selected state, or confirmed progress.

### Primary

- **Signal Turquoise:** The sole shared action accent. Use it for primary actions, dark-surface focus, current progress, and positive active state; never as broad decoration.
- **Focus Teal:** The light-surface keyboard focus color. It keeps the turquoise family while meeting the non-text contrast requirement against paper surfaces; dark surfaces use Signal Turquoise.

### Secondary

- **Intelligence Purple:** An opt-in Kraken expression color for intelligence-specific data and identity. It is not a second shared primary and does not define Daedalus.

### Tertiary

- **Warning Yellow:** Attention that requires review but does not block action.
- **Danger Red:** Destructive actions, blocking failures, and critical unsafe state only.

### Neutral

- **Graphite Canvas:** Dark application background for focused operational surfaces.
- **Graphite Surface:** Default dark work surface.
- **Graphite Raised:** Selected, interactive, or temporarily elevated dark surface.
- **Paper Canvas:** Light application background when the audience or content benefits from daylight reading.
- **Paper Surface:** Quiet grouping on light canvases.
- **Ink Primary / Ink Inverse:** High-contrast text pairs for light and dark surfaces.

**The Scarce Signal Rule.** Turquoise must stay below roughly ten percent of a screen. If the whole interface glows, nothing is a signal.

**The Semantic Color Rule.** Purple, yellow, and red never substitute for missing hierarchy. Each use must communicate a stable product meaning.

## Typography

**Display Font:** Nextide Display (Obviously Bold), loaded only through the optional `@nextide/ui/display-font.css`
**Body Font:** UI Sans, currently the metric-stable system stack
**Label/Mono Font:** UI Sans for labels; the platform monospace stack only for code and identifiers

**Character:** Clear, contemporary, and operational. One well-tuned family carries the interface; logos, composition, and data behavior provide the brand personality. A self-hosted variable face may replace the system stack only after it passes the metric gate below and this document is updated.

### Hierarchy

- **Brand** (700, `1.75rem`, `0.92`): Product name inside the primary navigation lockup; never navigation labels or body copy.
- **Display** (700, `2rem`, `1.1`): Rare product-intro and report-masthead use; never a routine dashboard title.
- **Headline** (500, `1.375rem`, `1.2`): Primary screen and major region headings.
- **Title** (500, `1.1875rem`, `1.3`): Panel, section, and focused task headings.
- **Body** (400, `1rem`, `1.5`): Product copy and prose, with a default maximum measure of `65ch` and a hard ceiling of `75ch`.
- **Label** (500, `0.875rem`, `1.4`): Controls, navigation, table headers, and compact metadata.
- **Caption** (500, `0.75rem`, `1.35`): Timestamps and secondary metadata only; never essential instructions or long text.
- **Micro** (500, `0.6875rem`, `1.2`): Short status badges and dense chart labels only; never controls, instructions, or prose.

Use only 400 and 500 in everyday product UI. Brand and Display are the sole 700 exceptions. Use tabular lining numerals for tables, timestamps, metrics, percentages, and changing counters. On dark long-form surfaces, use `1.55` line height and `0.01em` tracking.

**The Compact Number Rule.** Axes, counters, summary cards, and other dense number displays use compact notation with at most three significant digits (`1.32k`, `10.3k`, `100m`). Exact values belong in detail tooltips, drill-downs, exports, and tables when the precision changes a decision.

**The Metric Gate.** A UI font is rejected if ordinary controls require `top`, `translateY`, asymmetric padding, ascent/descent overrides, or per-component baseline fixes.

**The Display Boundary.** Nextide Display is opt-in and limited to the primary product lockup, static wordmarks, marketing/editorial mastheads, a single intro title at or above `2rem`, or a client-facing report masthead. It is forbidden in navigation items, controls, forms, tables, captions, metrics, and body copy.

## Elevation

The system uses tonal layers at rest and state lift in motion. Default surfaces are separated with spacing, background tone, and one quiet border only when the boundary is otherwise ambiguous. Shadows belong to overlays, dragged items, floating actions, and active focus—not every card.

### Shadow Vocabulary

- **Overlay:** A broad, low-opacity shadow for dialogs, menus, popovers, and drawers.
- **State lift:** A shallow shadow paired with a small transform for a hovered draggable or explicitly raised work item.
- **Focus:** A high-contrast opaque ring, not a glow cloud. Use Focus Teal on light surfaces and Signal Turquoise on dark surfaces.

**The Flat-at-Rest Rule.** If every panel appears to float, remove elevation until only the active layer moves forward.

## Motion

Motion is a shared interaction language, not component-by-component decoration. Entering state uses the out-quart curve; bounded layout movement uses the in-out-quart curve. Exits are shorter than entries. Reduced-motion mode collapses all four timings to `1ms` and removes nonessential transforms.

- **Instant** (`120ms`): Tooltips, lightweight overlays, and exits.
- **Control** (`160ms`): Hover, focus, switch, and button feedback.
- **State** (`220ms`): Selection, progressive disclosure, and local state change.
- **Layout** (`300ms`): Drawers, rails, and bounded reflow.

The slowly breathing turquoise brand-lockup glow is the shared signature animation. Repeating motion elsewhere must communicate live, processing, or time-sensitive state. Never use `transition-all`; name the properties that are allowed to move.

### State-change grammar

- **Numbers:** Keep tabular width stable. Crossfade or use a short vertical roll only for meaningful live updates; never scramble operational values.
- **Short labels and status:** Crossfade in `120-160ms` without changing layout.
- **Local view or panel:** Use a `180-220ms` directional slide plus fade; direction should follow navigation or spatial origin.
- **Expand and collapse:** Animate one measured region with the shared layout curve. Do not combine an independent child translation with the height transition.
- **Generated text:** Show streaming progress with a cursor or quiet shimmer, then settle to stable text. Scramble text is reserved for rare identity moments and is never the default for reports, evidence, controls, or accessibility-critical copy.

## Iconography

Lucide is the shared default: one restrained outline family, normally `16px` inside controls and `20px` for standalone navigation or status marks. Icons support a visible label unless the meaning is universal and an accessible name is supplied. Do not mix icon families inside one surface.

Font Awesome Pro may be used by a private product build that already owns the license and package access. Its assets are not published through the public `@nextide/ui` package; if products eventually need a Pro-only family, expose it through a private product boundary without changing the shared component contract.

## Components

Components are quiet at rest and decisive in action. Base UI owns interaction semantics; Nextide owns the public component API, visual behavior, states, and responsive contract.

### Buttons

- **Shape:** Gently squared control corners (`0.5rem`), not pills by default.
- **Primary:** Signal Turquoise with dark ink, medium label weight, and a minimum `2.5rem` desktop height; use `2.75rem` where touch is primary.
- **Hover / Focus:** Small tonal change and crisp focus ring. No permanent glow. Motion uses opacity, color, or transform and respects reduced motion.
- **Secondary / Ghost:** Neutral surfaces or transparent treatment. Destructive is visually quieter than primary until the decision is confirmed.

### Chips

- **Style:** Compact semantic labels with neutral fill or one-pixel border and an `0.5rem` corner. Text chips do not become pills.
- **State:** Selected state changes tone and iconography; color alone never carries selection.

### Cards / Containers

- **Corner Style:** Restrained surface corners (`0.625rem`).
- **Background:** One tonal step from the canvas.
- **Shadow Strategy:** Flat at rest; see Elevation.
- **Border:** At most one quiet one-pixel boundary. Nested cards require a demonstrated interaction or grouping need.
- **Internal Padding:** Compact (`0.75rem`) for dense data; standard (`1rem`) for forms; roomy (`1.5rem`) only for focused reading or empty states.

### Inputs / Fields

- **Style:** Solid neutral fill, one quiet boundary, readable body text, and aligned labels/errors.
- **Focus:** Crisp turquoise ring plus border shift; no layout movement.
- **Error / Disabled:** Error copy stays attached to the affected field. Disabled controls remain readable and never masquerade as unavailable data.

### Navigation

- **Style:** Strong route hierarchy, neutral default state, tonal hover, and one clear active state. Desktop navigation supports density; mobile becomes task-based primary destinations rather than a squeezed sidebar.
- **Brand lockup:** Product mark, product name, optional product subheading, and a small Nextide byline may use the bounded signature glow.

### Scrolling

- **Nested regions:** Consume the wheel only while the nested region can advance in that direction. At either boundary, release the same gesture to the page.
- **Scrollbars:** Show them when they communicate useful position; hide them only for compact rails that retain wheel, touch, and keyboard access.

### Typeset

`shadcn/typeset` is an opt-in semantic-content layer for rendered HTML and Markdown. Provide compact, reading, and streaming profiles for AI proposals, evidence narratives, help, and finished reports. It never styles the application shell, controls, or data-grid widgets, and layout owns the `65ch` measure.

## Do's and Don'ts

### Do:

- **Do** make the important state obvious before adding decoration.
- **Do** use real 400/500 weights for everyday product UI; keep Brand and Display restricted.
- **Do** use turquoise sparingly for current action, focus, selected progress, and confirmed active state.
- **Do** change composition for mobile around the user's immediate task.
- **Do** show loading, empty, partial, stale, success, warning, and failure states explicitly.
- **Do** use shadcn CLI dry-run and diff output as reviewed source intake; keep Base UI integration and public APIs owned by `@nextide/ui`.

### Don't:

- **Don't** produce generic shadcn dashboard output, card grids without information hierarchy, or interchangeable AI-generated admin screens.
- **Don't** use decorative neon, glow, gradient, glass, or motion as a substitute for product meaning.
- **Don't** enforce a rigid brandbook treatment that forces one product expression or one display face across every audience.
- **Don't** use Obviously or another display face as universal body, control, table, or navigation text, especially when it requires baseline offsets or metric hacks.
- **Don't** compress desktop navigation, tables, steppers, or inspector rails into a mobile viewport and call it responsive.
- **Don't** create product themes, local primitive forks, or direct Base UI ownership in consumers to work around a shared-system problem.
