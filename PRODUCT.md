# Product

## Register

product

## Platform

web

## Users

The foundation serves three related product experiences:

- Daedalus Console for Nextide operators and capability-scoped partner seats planning, approving, launching, and operating campaigns.
- Daedalus Creator Portal for creators and creator agents reviewing offers, completing setup, and understanding delivery and earnings, primarily through focused mobile workflows.
- Kraken Intelligence for analysts and commercial teams exploring evidence and reading intelligence reports.

The direct consumers of this repository are the product teams building those experiences. They need reusable primitives and patterns without losing ownership of product-specific composition.

## Product Purpose

`@nextide/ui` is the common interface foundation for Nextide products. It makes complex operational state legible, keeps interaction and accessibility behavior consistent, and shortens design iteration without forcing Daedalus and Kraken into one visual template.

Success means each product feels unmistakably related, purpose-built for its users, fast to iterate, and dependable across desktop and task-focused mobile workflows.

## Positioning

One precise, expressive operating language for campaign delivery and intelligence, flexible enough for distinct products without duplicated primitives or generic dashboard output.

## Brand Personality

Precise, confident, alive. The foundation should retain familiar SaaS dashboard ergonomics while using hierarchy, typography, motion, and selective brand energy to feel unmistakably Nextide.

## Anti-references

- Generic shadcn dashboard output, card grids without information hierarchy, and interchangeable AI-generated admin screens.
- Decorative neon, glow, gradient, glass, or motion used as a substitute for product meaning.
- A rigid brandbook interpretation that forces one product treatment or one display face across every audience and workflow.
- Obviously or another display face used as universal body, control, table, or navigation text, especially when it requires baseline offsets or metric hacks.
- Desktop information architecture merely compressed into a mobile viewport.

## Design Principles

1. Make the important state obvious before adding decoration.
2. Share interaction truth, not product composition.
3. Use density deliberately: operationally efficient in Daedalus Console, guided in Creator Portal, and evidence-led in Kraken.
4. Show proposals, uncertainty, readiness, and consequences clearly enough for an informed human decision.
5. Earn distinctiveness through typography, rhythm, hierarchy, and product behavior rather than visual effects.

## Accessibility & Inclusion

Meet WCAG 2.2 AA. Every changed workflow must remain complete at 320, 390, 768, and 1440 CSS pixels; support keyboard operation, visible and restored focus, 200% zoom and reflow, touch-usable targets, reduced motion, correctly associated errors, non-disruptive status announcements, and textual or tabular alternatives for visual data.
