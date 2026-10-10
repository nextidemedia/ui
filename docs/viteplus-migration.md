# Vite+ migration evidence — 2026-10-11

This migration starts at `2e4939c` and adopts the approved Meta PR #47 toolchain:
Node 26.9.0, npm 12.0.2, Vite+ 1.1.0, its Vite-core 1.1.0 alias and Vitest 5.0.3,
and TypeScript 7.0.2. The maintainer waived the seven-day release age for these
aligned pins. npm generated the lock; `npm ci` remains the frozen installation
command. Prettier 3.9.7, its Tailwind plugin and native TesterArmy stay unchanged.
No product source, recordings or package version changes are needed.

## Lint policy

The previous pipeline ran root Oxlint 1.83.0 and two syntax-only ESLint scopes
with ESLint 10.10.0, typescript-eslint 8.70.0, Hooks 7.1.1 and Refresh 0.5.7.
The scopes did not select typed unsafe-assignment, argument, call, member-access,
return or promise rules. They did not restrict imports. The migration does not
introduce those new policies: enabling type-aware defaults exposed ReactNode
stringification findings outside this tooling change. TypeScript 7 still checks
the library, playground, native tests and tool configuration explicitly.

The root Vite+ config imports the existing shared Oxlint policy as an object.
`.oxlintrc.json` preserves both workspace TypeScript scopes, including tool
configuration, and root Oxlint continues to cover maintained tests and scripts.
The two baseline ESLint scans enumerated 119 package files and 29 playground
files, with zero real-code diagnostics. Two retired ESLint configuration files
are replaced by Vite+ configuration files. Generated `dist` and test output
remain excluded.

The native rule mapping retains the enabled ESLint recommended and TypeScript
recommended checks and their options. Legacy octal syntax is rejected by the
module parser/compiler. `preserve-caught-error` retains its false
`requireCatchParameter` default; ESLint's empty `errorClassNames` option adds no
custom classes. Native Refresh keeps `allowConstantExport` and
`allowCompoundComponents`: mixed utility/component exports are allowed in the
library and rejected in playground Quality. Correctness still omits Refresh.

Thirteen React compiler/Hooks rules use native implementations. The official
Hooks plugin supplies `config`, `gating` and `purity`. Native purity newly rejects
`todayDate ?? new Date()` in `date-range-picker.tsx`, while the previous pipeline
accepts it. Keeping the official implementation preserves the existing policy
without modifying the component or disabling impurity checks. A deliberate
`Date.now()` render is rejected in both profiles. ESLint remains only to satisfy
the official plugin's peer dependency; its runner, typescript-eslint and
TypeScript 6 are removed.

The custom `Input` label association and all existing accessibility exceptions
remain unchanged. Correctness inherits the same safety, Hooks and accessibility
checks while omitting the previous explicit cosmetic rules. CI now invokes the
same `just lint-correctness` recipe as local qualification.

## Process acceptance

The existing native tooling journey uses 16 fixtures in each workspace and both
profiles: unused declarations, unsafe optional chaining, conditional Hooks,
missing dependencies, render impurity, ref access, prop mutation, synchronous
state in effects, explicit any, accessible labels, valid Hooks/purity, mixed
exports, constant exports and compound components. The fixture expectations
come from the old pipeline. They run through two real lint processes with zero
model calls. The native tooling suite keeps its two logical cases and expands
its existing lint case; no standalone unit suite or starter tests were added.

The first sequential implementation took 123.44 seconds for lint probes. Batching
the same fixtures reduced this to 3.44 seconds locally, with the complete tooling
suite at 7.86 seconds. This is warm Windows execution, not a cross-platform or
cold-start benchmark.

## Package and release boundaries

`vp pack` uses unbundled ESM with explicit `.js` and `.d.ts` extensions, preserving
the existing public subpaths. The existing preparation script cleans output and
copies styles/fonts before packing. All 19 source client directives remain in
the emitted modules; native packed-consumer acceptance additionally checks three
client entrypoints. The existing isolated consumer installs the actual tarball,
checks TypeScript resolution and runtime exports, then checks chart, scroll and
typography regressions. The playground still builds against package exports.

The E2E preview process now starts the Vite+ CLI explicitly; recorded goals,
strict read-only replay, zero retries and unavailable model credentials are
unchanged. Native package and desktop/mobile browser qualification remain the
required integration surface. Vite+ bundles Vitest but no Vitest tests replace
or duplicate native acceptance.

Node pins change in qualification, advisory dead-code and publication setup.
Publication remains manual and requires an existing matching release tag plus
successful deploy qualification. This PR neither tags nor publishes a package.

## References and retained limitations

The migration follows the official [migration rules](https://viteplus.dev/guide/migrate-rules)
and [pack guide](https://viteplus.dev/guide/pack). The migrator attempted to
replace Prettier and emitted a string-based lint extension; those changes were
corrected to preserve the formatter and use the required imported object.
Its nested npm installation hit npm 12's `EALLOWSCRIPTS` environment restriction;
a direct npm installation generated the committed lock without bypassing script
approval or strict peer checks.

TypeScript 7 declaration generation currently prints its experimental-API notice.
Rolldown emits conservative client-directive warnings in unbundled mode, despite
preserving the directives; acceptance checks the emitted package. The playground's
existing large-chunk warning remains visible. No application splitting or other
product cleanup is included.
