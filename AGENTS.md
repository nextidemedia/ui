# Repository Guidance

This repo is the shared `@nextide/ui` package. The playground exists only as a local harness for exercising package exports.

- Put reusable UI, motion, tokens, and behavior in `packages/ui`.
- Keep `apps/playground` as a consumer of `@nextide/ui` public exports.
- Do not treat the playground as a first-class product surface or build bespoke playground-only components when the change belongs in the package.
- Playground code may own demo state, sample data, and layout wiring, but package components should remain the source of truth for shared behavior.
- Preserve the primitive/block separation: primitives belong under `packages/ui/src/components`, composed product patterns belong under `packages/ui/src/blocks`.
- Keep React Doctor healthy from time to time with `npx react-doctor@latest`; treat warnings as cleanup candidates before they pile up.
- Do not assume backwards compatibility. If compatibility expectations are unclear, ask before locking the direction.
- Never write product decisions, implementation details, API routing, fallback mechanics, or other internal plumbing into user-facing or agent-facing text. UI copy, notices, docs, prompts, labels, and tool messages should describe the user goal, required action, or visible state, not how the system is internally wired.
