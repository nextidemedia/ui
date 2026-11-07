# Dependency updates

Dependabot maintains npm locks and immutable Action pins weekly with a seven-day
routine cooldown. Stable patch/minor groups and pre-1.0 patches can merge after
full qualification and the configured agent-owned Review Suite review. Majors,
pre-1.0 minors and unknown versions need an agent compatibility upgrade. Keep
those PRs open and upgrade them; they are not blanket exclusions.

The review owner runs Review Suite and its GitHub review on the current head,
resolves findings, then submits a formal GitHub approval for that head. A review
completion PR conversation comment wakes the merge workflow if qualification
already finished. No human approval is required. The comment itself grants no
permission; the workflow reads current reviews and qualification from GitHub.
This repository has no unattended Review Suite dispatcher: an agent still owns
review initiation. Do not substitute an unconditional approval workflow.

`Dependency eligibility` authenticates Dependabot commits and checks every target
in a group. An agent-edited head takes the ordinary reviewed lane. The native
merge workflow uses trusted main/base code only, checks current-head full PR
qualification against the current base, requires successful quality, typecheck
and package/browser steps, and requires a current-head approval. It uses an
atomic expected-head precondition. Missing or unsuccessful evidence leaves the
PR open. Qualification for a different candidate or a dispatch does not count.

Before enrollment, the integrating owner must protect `main` with strict required
checks `Dependency eligibility` and `Correctness / Package and browser`, both
bound to GitHub Actions (App ID 15368), enforce rules for administrators, require
one approval, and dismiss stale approvals. Enable repository native auto-merge
only after the implementation and qualification are accepted. The workflow
checks these protection settings before arming; changing only the auto-merge
setting is insufficient. Settings are intentionally applied by the integrating
owner, not by this PR.

Publishing remains a separate manual tag dispatch. A token-based merge may
suppress the ordinary main-push workflow; the candidate has already passed full
PR qualification, and release dispatch independently qualifies the exact tag.
Do not use this pilot as evidence that push-triggered deployments work elsewhere.

Run the deterministic merge-boundary check with:

```sh
npx e2e run tests/dependency-merge.e2e.ts --target package
```

It needs installed locked npm dependencies, no browser/provider credentials, and
takes seconds. Full PR Qualification remains required in CI.
