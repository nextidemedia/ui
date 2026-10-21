# Coding guidance

Use the shared [TypeScript and JavaScript tooling note](coding-guidance/typescript-application.md)
for the `@nextide/ui` library and its playground consumer.

Local exceptions:

- Keep Prettier as the formatter and the separate TypeScript compiler checks in
  the [existing recipes](../justfile).
- Preserve the existing untyped Vite+ lint policy, React Hooks and accessibility
  rules in [vite.config.ts](../vite.config.ts) and [.oxlintrc.json](../.oxlintrc.json).
  Typed lint adoption is a separate tooling change.
