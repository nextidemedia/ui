# Dependency updates

Dependabot maintains npm locks and immutable Action pins weekly with a seven-day
routine cooldown. Stable patch/minor groups and pre-1.0 patches can merge after
full qualification and genuine current-source automated review. Majors, pre-1.0
minors and unknown versions go to the agent-owned compatibility upgrade lane.
No formal GitHub approval is required, including on ordinary agent-authored PRs.

The trusted base/default workflow authenticates the updater's single verified
current commit and checks every targeted dependency. The pinned metadata action
reads the first commit; multiple commits or failed metadata cannot grant unattended
eligibility. Agent-edited heads receive ordinary review-lane status even when
metadata extraction fails. Classification depends on the head; qualification
separately binds the current head and base. No privileged PR code is executed.

For eligible updates the workflow posts `@codex review` once per head, using the
existing App trigger. It requires an authentic `chatgpt-codex-connector[bot]`
structured summary with the full current commit, completed code review, and no
findings. Missing, stale, malformed or finding-bearing results keep `Dependency
review` pending or failed. Comments cannot manufacture approval; only the App's
current-source result qualifies. Summary creation and edits re-evaluate readiness.

Full PR package/browser qualification and successful mandatory quality, typecheck
and package/browser steps remain required. CLEAN candidates merge through GitHub's
expected-head mutation; pending native state uses expected-head native auto-merge,
including a CLEAN-state race fallback. GitHub observes pending mergeability; no
scheduler or polling is added. A changed head/base aborts finalization.

Before enrollment, root must apply and verify strict required checks `Dependency
eligibility`, `Dependency review` and `Correctness / Package and browser`, bound to
GitHub Actions App 15368, and administrator enforcement. Required approving-review
count stays zero. The workflow token reads effective check names without requesting
administration credentials. Publishing remains manual and requalifies its exact tag.

Unattended operation is **not yet qualified**: the existing App responds to the
agent's authenticated review request, but acceptance of a `github-actions[bot]`
request and automatic review of Dependabot revisions must be verified during root's
integration/enrollment. Public documentation supports automatic repository reviews
and `@codex review`; it does not establish this installation's bot-trigger
permission. Missing response fails closed. No unattended local Review Suite CLI
runner was found; root must establish the configured review route before claiming
no-human operation, without silently dropping required review.

Run the tools-only boundary journey with installed locked dependencies:

```sh
npx e2e run tests/dependency-merge.e2e.ts --target package
```

It takes seconds with no browser or provider credentials. Full CI remains required.
