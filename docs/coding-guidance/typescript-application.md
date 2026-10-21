# TypeScript and JavaScript project tooling

- New TS, web and library repos use npm and project-local Vite+ for formatting,
  lint and type checking.
- Upgrade Vite+ with the target version's `vp migrate` from the workspace root;
  inspect aliases, overrides and the lockfile, then requalify.
- Keep compiler checks and explicit lint rules for unsafe typed operations and
  promises; type awareness alone does not select those rules.
- Retire existing ESLint checks or replace the formatter only after verifying
  equivalent behavior and file coverage, including applicable UI hooks and
  accessibility checks.
