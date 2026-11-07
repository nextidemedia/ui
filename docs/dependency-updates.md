# Dependency updates

Dependabot checks npm locks and immutable Action pins weekly, with a seven-day
routine cooldown. Stable patch/minor updates and pre-1.0 patches can merge after
required qualification and genuine automated review of the current revision.
No formal GitHub approval is required.

Majors, pre-1.0 minors, unknown versions and agent-adopted updates use the
agent-owned compatibility lane. Owners qualify and review those updates before
finalizing them. Compatible upgrades need no cosmetic commit. A completed owner
classification does not authorize automatic merging.

When an update is blocked:

- Diagnose failed, cancelled or skipped qualification and fix the cause.
- Complete the configured review for the current revision and address or
  explicitly adjudicate its findings. An old review does not qualify a new revision.
- Refresh a stale branch through Dependabot or the owning agent, then qualify it.
  Unconflicted stale updates can wait for the next weekly check; conflicts refresh
  earlier.
- If post-merge qualification dispatch fails, inspect existing runs before
  retrying. Use the logged `merged_source` or the PR's recorded merge commit:
  `gh workflow run ci.yml --repo nextidemedia/ui --ref main -f profile=full -f source_sha=<merged_source>`.
  Do not rerun passing qualification blindly.

The repository owner enrolls the pilot after integration and live verification. Require strict
`Dependency eligibility` and `Correctness / Package and browser` checks from
GitHub Actions, with administrator enforcement and zero approving reviews.
`Dependency review` is informational; every automatic finalization still requires
the genuine review result. Owners retain their configured Review Suite/GitHub
process. Package publication remains manual and qualifies its exact tag.

Unattended operation is **not yet qualified**. The repository owner must verify the existing
Codex App reviews every Dependabot revision automatically or accepts workflow-bot
review requests. Missing review keeps the update waiting. No unattended local
Review Suite runner has been established; do not silently waive configured review.

Run the focused tools-only journey with installed locked dependencies:

```sh
npx e2e run tests/dependency-merge.e2e.ts --target package
```

It takes seconds without browser or provider credentials. Full CI remains required.
