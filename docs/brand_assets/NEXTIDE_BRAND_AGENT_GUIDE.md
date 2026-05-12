# Nextide Brand Implementation Guide for Design Agents

This file translates the Nextide brandbook into practical implementation rules for agents building product UI, marketing pages, dashboards, decks, social assets, and design-system components.

Use this as the design brief that accompanies the visual brandbook. The goal is not to recreate the PDF page-by-page. The goal is to make every implemented surface feel unmistakably Nextide.

---

## 1. Brand Essence

Nextide should feel:

- **Bold** - large type, strong contrast, confident layouts.
- **Modern** - clean product surfaces, crisp spacing, no clutter.
- **Fun** - expressive accents, organic motion/pattern language, not sterile enterprise SaaS.
- **Creator-native** - energetic, live, fluid, social, high-recognition.
- **Trustworthy** - contrast and clarity always beat decoration.

The brand lives in the tension between **pure black/white authority** and **Tide Turquoise energy**.

Do not make Nextide look like a generic B2B SaaS dashboard. It should be clean enough for operators, but visually closer to a confident creator/media technology brand than a gray admin panel.

---

## 2. Color System

### Primary colors

| Token | Name | Hex | Usage |
|---|---:|---:|---|
| `--nx-black` | Pure Black | `#000000` | Main dark background, text on light surfaces, heavy outlines |
| `--nx-white` | Pure White | `#FFFFFF` | Main light background, text on dark surfaces, logo fill |
| `--nx-turquoise` | Tide Turquoise | `#1EE4BC` | Signature accent, active states, primary CTA, key highlights |

### Secondary colors

| Token | Name | Hex | Usage |
|---|---:|---:|---|
| `--nx-purple` | Next Purple | `#AF2EFF` | Experimental, AI, insight, premium, future-facing moments |
| `--nx-yellow` | Beach Yellow | `#FFDA53` | Warmth, warnings, campaign moments, creator/community highlights |
| `--nx-red` | Sunset Red | `#FF3355` | Errors, destructive actions, urgent alerts, live risk states |

### Color balance rule

Approximate visual balance across a full interface:

- **50% Pure Black + Pure White** for clarity and structure.
- **30% Tide Turquoise** as the unmistakable brand voice.
- **20% secondary palette total** across purple, yellow, and red.

This is not a strict pixel-counting rule. It is a taste rule. Turquoise should be common and recognizable; purple/yellow/red should be strategic bursts, not competing brand colors.

### Practical UI color guidance

- Default to **dark-first** product UI: black background, white content, turquoise focus/active states.
- Use white pages or white cards when they create useful contrast, but avoid gray-on-gray SaaS monotony.
- Use turquoise for primary buttons, active navigation, selected filters, progress, outlines, chart focus series, and important metrics.
- Use secondary colors only when they encode meaning or create an intentional moment.
- Avoid random blues, greens, oranges, corporate grays, or gradients that are not built from the brand palette.
- Preserve high contrast. The brandbook explicitly relies on contrast and clarity.

### Suggested CSS variables

```css
:root {
  --nx-black: #000000;
  --nx-white: #ffffff;
  --nx-turquoise: #1ee4bc;
  --nx-purple: #af2eff;
  --nx-yellow: #ffda53;
  --nx-red: #ff3355;

  /* Product UI support tokens derived from the brand palette. */
  --nx-panel: #070707;
  --nx-panel-raised: #101010;
  --nx-border-subtle: rgba(255, 255, 255, 0.14);
  --nx-border-strong: rgba(255, 255, 255, 0.28);
  --nx-muted: rgba(255, 255, 255, 0.68);
  --nx-faint: rgba(255, 255, 255, 0.42);
  --nx-turquoise-soft: rgba(30, 228, 188, 0.16);
  --nx-purple-soft: rgba(175, 46, 255, 0.16);
  --nx-yellow-soft: rgba(255, 218, 83, 0.18);
  --nx-red-soft: rgba(255, 51, 85, 0.16);
}
```

---

## 3. Typography

### Primary typeface

Use **Obviously** as the primary brand typeface.

The brandbook uses the following core hierarchy:

| Role | Typeface | Size in brandbook | Product/UI translation |
|---|---|---:|---|
| Main Header | Obviously Bold | 72pt | `clamp(48px, 7vw, 96px)` |
| Subheader | Obviously Bold | 32pt | `28px - 44px` |
| Body | Obviously Regular | 18pt | `16px - 20px` for product UI, larger for marketing |

Available brand weights shown in the brandbook: **Thin, Regular, Bold, Super**.

### Typography personality

- Headlines should be **large, direct, and punchy**.
- Use tight, confident display type for hero headers and section titles.
- Body copy should stay readable and calm.
- Prefer short labels and high-signal UI copy.
- Avoid delicate, overly formal, luxury, serif, or corporate-neutral typography.

### Font loading guidance

Use local font files when available in the repo. Do not pull remote font CDNs unless the project explicitly allows that.

Example:

```css
@font-face {
  font-family: "Obviously";
  src: url("/fonts/Obviously-Regular.woff2") format("woff2");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: "Obviously";
  src: url("/fonts/Obviously-Bold.woff2") format("woff2");
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}

:root {
  --nx-font: "Obviously", "Arial Black", "Inter", system-ui, sans-serif;
}
```

Fallbacks should preserve the chunky, bold, modern feel. Avoid thin default system typography for key brand moments.

---

## 4. Logo Usage

Use the official Nextide logo assets. Do not redraw the logo from scratch unless explicitly asked to create a concept mock.

### Logo variants from the brandbook

- Primary logotype.
- Primary logomark.
- Alternative logotype.
- Alternative logomark.

### Required logo behavior

- Maintain clear space around all logo variants.
- Keep the logo legible and high-contrast.
- Place the logo on clean black, white, or controlled brand-pattern surfaces.
- Use the primary logotype where recognition matters most.
- Use the logomark for compact UI, avatars, favicon-style moments, loading states, and icon-like placements.

### Never do these things

- Do not rotate the logo.
- Do not stretch, squash, or skew the logo.
- Do not recolor the logo with off-brand colors.
- Do not remove the logo fill.
- Do not add shadows to the logo.
- Do not place the logo on busy, low-contrast, or uncontrolled photographic backgrounds.
- Do not move parts of the logo into different orientations.
- Do not edit or replace individual parts of the logo.

Important distinction: the brandbook forbids shadows on the **logo**. UI surfaces may use carefully controlled depth if it does not make the product feel generic or muddy.

---

## 5. Brand Pattern

The signature pattern is an organic, fluid, interconnected shape system inspired by live media flow and rippling water.

### Pattern usage

Use the brand pattern for:

- Hero backgrounds.
- Social headers.
- Empty states.
- Campaign moments.
- Branded dividers or panels.
- Login/onboarding pages.
- High-impact product states where Nextide identity should be obvious.

### Pattern colorways

The brandbook shows two major pattern modes:

1. **Turquoise shapes on white** - energetic, social, bright.
2. **Turquoise shapes on black** - dark, premium, product-native.

You may also use subtle black-on-black patterning for depth, but ensure the pattern does not become visual noise.

### Pattern implementation rules

- Keep text on top of pattern highly legible.
- Use overlays, masks, or large empty zones when putting copy over the pattern.
- Do not place important dense tables or small body text directly on a busy pattern.
- Do not replace the organic pattern with generic dots, grids, waves, glass blobs, or stock geometric backgrounds.
- If the exact pattern asset exists, use it. If not, approximate the spirit with organic fluid shapes, not tech-grid decoration.

---

## 6. Icon System

The brandbook builds icon housing from the turquoise circle in the logo.

### Icon housing rule

Icons should generally live inside a **circle**, especially in brand-heavy surfaces.

Recommended treatment:

- Turquoise circular housing.
- Black or white simple glyph inside.
- Strong outline when needed.
- Consistent sizing across a given UI region.
- Use circular icon chips for status, nav, feature cards, empty states, and quick actions.

Avoid:

- Random square icon containers.
- Generic SaaS outline-icon-only cards with no brand color.
- Mixing many icon container shapes in one section.

---

## 7. Product UI Translation

### Overall product feel

Build a high-contrast, dark-first interface that feels like a creator intelligence cockpit.

A good Nextide UI should have:

- Pure black or near-black base.
- White typography.
- Large, bold section headers.
- Turquoise active states and primary actions.
- Organic pattern used as a brand layer, not as decoration everywhere.
- Rounded or circular details that echo the logo dot and icon system.
- Clean operator-friendly data layouts.
- Strategic accent colors for meaning.

### Layout principles

- Use bold hierarchy: big page title, clear subheading, direct action.
- Keep whitespace generous.
- Use dense data only inside controlled panels.
- Favor modular cards, status strips, and strong section blocks.
- Use thick, confident dividers when it helps structure the screen.
- Avoid timid low-contrast gray dividers and generic enterprise dashboards.

### Surfaces

| Surface | Guidance |
|---|---|
| App background | Pure black or near-black, optionally with subtle black-on-black pattern |
| Panels/cards | Black/near-black with white border, turquoise accent, or white cards with black text |
| Hero surfaces | Large type, logo/pattern presence, turquoise CTA |
| Data panels | High contrast, calm body text, branded metric highlights |
| Empty states | Use circular icon housing plus pattern fragment or turquoise accent |
| Alerts | Use secondary palette with semantic intent |

---

## 8. Component Guidance

### Buttons

Primary button:

- Tide Turquoise fill.
- Black text.
- Bold type.
- Rounded pill or large radius.
- Clear hover/focus state.

Secondary button:

- Black or transparent background.
- White border/text.
- Turquoise hover/focus ring.

Danger button:

- Sunset Red fill or red outline.
- Use only for destructive/urgent actions.

Example:

```css
.nx-button-primary {
  background: var(--nx-turquoise);
  color: var(--nx-black);
  border: 2px solid var(--nx-turquoise);
  border-radius: 999px;
  font-family: var(--nx-font);
  font-weight: 700;
  letter-spacing: -0.02em;
}

.nx-button-secondary {
  background: transparent;
  color: var(--nx-white);
  border: 2px solid var(--nx-border-strong);
  border-radius: 999px;
}

.nx-button-secondary:hover,
.nx-button-secondary:focus-visible {
  border-color: var(--nx-turquoise);
  box-shadow: 0 0 0 4px var(--nx-turquoise-soft);
}
```

### Cards

Cards should feel sturdy and branded, not fragile.

Recommended:

- Large radius: `20px - 32px`.
- Strong internal spacing.
- White/turquoise borders on dark backgrounds.
- Optional top stripe or corner accent in turquoise.
- Clear label, metric, state, action.

Avoid:

- Generic white cards on gray backgrounds.
- Tiny 12px muted labels everywhere.
- Excessive soft shadows that make the UI feel like a template.

### Inputs

- Dark input background on dark UI.
- White text.
- Clear turquoise focus ring.
- Rounded corners.
- Labels should be bold and legible.
- Error states use Sunset Red.

### Badges and chips

Use badges as small brand moments.

- Active / running: Tide Turquoise.
- Warning / pending: Beach Yellow.
- Error / failed / risky: Sunset Red.
- AI / experimental / premium: Next Purple.
- Neutral: black/white with border.

### Tables

Tables are allowed, but do not let them become gray enterprise sludge.

- Keep headers bold.
- Use black/near-black rows with subtle white dividers.
- Highlight selected rows or important rows with turquoise edge treatment.
- Use circular status indicators or chips.
- For dense operational screens, prioritize readability over decoration.

### Charts and metrics

- Use Tide Turquoise as the primary data series.
- Use secondary colors only for additional series or semantic meaning.
- Avoid default chart palettes.
- Use high-contrast labels.
- Large numbers should use Obviously Bold/Super where practical.

---

## 9. Tailwind Token Example

When using Tailwind, map the brand into tokens instead of hardcoding hex values across components.

```js
// tailwind.config.js / tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        nextide: {
          black: "#000000",
          white: "#FFFFFF",
          turquoise: "#1EE4BC",
          purple: "#AF2EFF",
          yellow: "#FFDA53",
          red: "#FF3355",
          panel: "#070707",
          raised: "#101010"
        }
      },
      fontFamily: {
        obviously: ["Obviously", "Arial Black", "Inter", "system-ui", "sans-serif"]
      },
      borderRadius: {
        nextide: "24px",
        "nextide-lg": "32px"
      },
      boxShadow: {
        "nextide-ring": "0 0 0 4px rgba(30, 228, 188, 0.16)"
      }
    }
  }
};
```

Example classes:

```html
<section class="min-h-screen bg-nextide-black text-nextide-white font-obviously">
  <div class="rounded-nextide-lg border border-white/15 bg-nextide-panel p-8">
    <p class="text-nextide-turquoise font-bold uppercase tracking-wide">Live creator intelligence</p>
    <h1 class="mt-4 text-6xl font-bold tracking-tight">Make live media measurable.</h1>
    <button class="mt-8 rounded-full bg-nextide-turquoise px-6 py-3 font-bold text-nextide-black">
      Launch campaign
    </button>
  </div>
</section>
```

---

## 10. Agent Implementation Checklist

Before implementing:

- Locate official logo assets in the repo.
- Locate the Obviously font files, or confirm available fallback strategy.
- Locate brand pattern assets. If they do not exist, ask for them or implement a restrained approximation only if a mock is needed.
- Create or reuse centralized brand tokens.
- Confirm whether the surface is product UI, marketing, social, or internal tooling.

During implementation:

- Use brand tokens instead of raw repeated colors.
- Use large, bold hierarchy.
- Ensure CTAs and active states use Tide Turquoise.
- Use circular icon housing where icons are featured.
- Make pattern usage intentional and legible.
- Keep logos unmodified.
- Build responsive states, hover states, focus states, loading states, empty states, and error states.

Before final handoff:

- Check that the screen is not generic SaaS.
- Check that color balance roughly follows the brandbook.
- Check that all text over pattern/background passes contrast expectations.
- Check that all logo usages follow the brandbook restrictions.
- Check that secondary colors are not overused.
- Check that font sizes and weights preserve the brand hierarchy.
- Check that dense operational UI remains readable.

---

## 11. Copy-Paste Prompt for Design/Build Agents

Use this prompt when assigning an agent to implement a Nextide UI:

```md
Implement this UI using the Nextide brand system.

Brand source of truth:
- Primary colors: Pure Black #000000, Pure White #FFFFFF, Tide Turquoise #1EE4BC.
- Secondary accents: Next Purple #AF2EFF, Beach Yellow #FFDA53, Sunset Red #FF3355.
- Approximate balance: 50% black/white, 30% turquoise, 20% secondary accents total.
- Typeface: Obviously. Use local font files if available. Fallbacks must preserve the bold, chunky, modern feel.
- Visual language: bold, modern, fun, creator-native, high-contrast, fluid/live-media energy.
- Pattern: organic fluid/tide pattern. Use as a controlled brand layer, not behind dense text or data.
- Icons: prefer circular icon housings inspired by the turquoise circle in the logo.
- Logo: use official assets only. Do not rotate, stretch, recolor, add shadows, remove fill, place on busy/low-contrast backgrounds, or modify parts.

Design expectations:
- Do not create a generic gray SaaS dashboard.
- Use dark-first surfaces unless the task clearly calls for a light/social treatment.
- Use Tide Turquoise for primary actions, active states, focus rings, and key metrics.
- Use secondary colors only for semantic states or deliberate accent moments.
- Use large confident headings, clear spacing, strong contrast, and operator-friendly layouts.
- Include polished responsive, hover, focus, loading, empty, and error states.
- Centralize brand values in tokens/classes instead of scattering hardcoded hex values.
```

---

## 12. Common Failure Modes

Reject or revise designs that:

- Look like a generic enterprise SaaS template.
- Use mostly gray, blue, or pastel palettes.
- Use turquoise as a tiny accent only.
- Overuse purple/yellow/red until they compete with turquoise.
- Put dense UI content directly on busy pattern backgrounds.
- Use default system fonts for major brand moments.
- Distort, recolor, rotate, shadow, or edit the logo.
- Use icon shapes inconsistently.
- Make typography too timid.
- Sacrifice readability for decorative pattern use.

---

## 13. Useful Recipes

### Dark product dashboard

- Background: Pure Black.
- Header: official logo on black, nav active state in Tide Turquoise.
- Page title: Obviously Bold/Super, white.
- Main CTA: turquoise pill, black text.
- Cards: near-black, white border at low opacity, turquoise top edge or active ring.
- Status chips: turquoise/yellow/red/purple by meaning.
- Optional background: very subtle black-on-black organic pattern.

### Marketing hero

- Background: turquoise/white pattern or black/turquoise pattern.
- Logo: official logotype, high contrast.
- Headline: oversized Obviously Bold/Super.
- Subcopy: readable, generous line-height.
- CTA: turquoise on black or black on turquoise depending on surface.
- Keep the composition loud, simple, and recognizable.

### Empty state

- Circular icon housing in Tide Turquoise.
- Short bold headline.
- One sentence of body copy.
- Primary action in turquoise.
- Optional pattern crop behind or beside the card.

### Critical alert

- Use Sunset Red intentionally.
- Keep the rest of the surface black/white so the red has weight.
- Use a clear title, concise explanation, and direct action.
- Do not mix multiple secondary accents in the same alert.

---

## 14. One-Sentence North Star

A Nextide interface should feel like a bold black-and-turquoise live-media control room: clean enough to operate, loud enough to remember, and never generic.
