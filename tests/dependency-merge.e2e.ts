import { test } from "e2e"
import assert from "node:assert/strict"
import { createRequire } from "node:module"

const require = createRequire(import.meta.url)
const { classify, finish } = require("../scripts/ci/dependency-merge.cjs")

function updates(denial: string) {
  const dependency = (
    prevVersion: string,
    newVersion: string,
    kind = "patch"
  ) => ({
    dependencyName: "example",
    prevVersion,
    newVersion,
    updateType: `version-update:semver-${kind}`,
  })
  const metadata = [
    dependency("1.2.3", "1.2.4"),
    dependency("2.1.0", "2.2.0", "minor"),
    dependency("0.1.0", "0.1.1"),
  ]
  if (denial === "major") metadata.push(dependency("1.0.0", "2.0.0", "major"))
  if (denial === "pre-minor")
    metadata.push(dependency("0.1.0", "0.2.0", "minor"))
  if (denial === "unknown") metadata.push(dependency("sha1", "sha2"))
  if (denial === "downgrade") metadata.push(dependency("1.2.4", "1.2.3"))
  return metadata
}

function evidence(denial: string, head: string, base: string) {
  const reviews =
    denial === "no-review"
      ? []
      : [
          {
            user: { login: "review-owner" },
            state: "APPROVED",
            commit_id: denial === "stale-review" ? base : head,
          },
        ]
  const jobs = [
    {
      name: "Correctness / Package and browser",
      conclusion: "success",
      steps: [
        "Quality",
        "Run npm run typecheck",
        "Qualify packed package and browser",
      ].map((name) => ({
        name,
        conclusion: denial === "skip" ? "skipped" : "success",
      })),
    },
  ]
  const runs =
    denial === "missing" || denial === "dispatch"
      ? []
      : [
          {
            id: 123,
            conclusion:
              denial === "red"
                ? "failure"
                : denial === "cancelled"
                  ? "cancelled"
                  : "success",
            pull_requests: [
              {
                number: 113,
                head: { sha: denial === "stale-run" ? base : head },
                base: { sha: base },
              },
            ],
          },
        ]
  const protection = {
    requiresStatusChecks: true,
    requiresStrictStatusChecks: true,
    requiresApprovingReviews: true,
    isAdminEnforced: true,
    dismissesStaleReviews: true,
    requiredApprovingReviewCount: 1,
    requiredStatusChecks: [
      "Dependency eligibility",
      "Correctness / Package and browser",
    ].map((context) => ({ context, app: { databaseId: 15368 } })),
  }
  return { reviews, jobs, runs, protection }
}

// This API boundary owns the decision to grant native merge permission. No live mutations.
test(
  "dependency groups arm only after verified exact-source qualification and review",
  { platforms: ["api"] },
  async () => {
    for (const denial of [
      "none",
      "red",
      "missing",
      "cancelled",
      "skip",
      "stale-run",
      "dispatch",
      "stale-review",
      "no-review",
      "forged",
      "unsigned",
      "changed-head",
      "unenrolled",
      "major",
      "pre-minor",
      "unknown",
      "downgrade",
    ]) {
      const head = "a".repeat(40),
        base = "b".repeat(40)
      const pr = {
        number: 113,
        node_id: "PR_test",
        state: "open",
        draft: false,
        head: { sha: head, repo: { full_name: "nextidemedia/ui" } },
        base: { ref: "main", sha: base },
        user: { login: "dependabot[bot]" },
      }
      const statuses: any[] = [],
        armed: any[] = []
      const metadata = updates(denial)
      if (denial === "forged") pr.user.login = "other[bot]"
      const commits = [
        {
          sha: head,
          author: { login: "dependabot[bot]" },
          commit: { verification: { verified: denial !== "unsigned" } },
        },
      ]
      const { reviews, jobs, runs, protection } = evidence(denial, head, base)
      const rest = {
        pulls: {
          get: async () => ({ data: pr }),
          listCommits: async () => commits,
          listReviews: async () => reviews,
        },
        repos: {
          get: async () => ({
            data: { allow_auto_merge: denial !== "unenrolled" },
          }),
          createCommitStatus: async (s: any) =>
            statuses.unshift({
              ...s,
              creator: { login: "github-actions[bot]" },
            }),
          listCommitStatusesForRef: async () =>
            statuses.filter((s) => s.sha === pr.head.sha),
        },
        actions: {
          listWorkflowRuns: async () => runs,
          listJobsForWorkflowRun: async () => jobs,
        },
      }
      const github = {
        rest,
        paginate: async (method: any) => method(),
        graphql: async (query: string, input: any) => {
          if (query.startsWith("mutation")) {
            armed.push(input)
            return {}
          }
          return { repository: { ref: { branchProtectionRule: protection } } }
        },
      }
      const context = {
        repo: { owner: "nextidemedia", repo: "ui" },
        payload: {
          pull_request: structuredClone(pr),
          issue: { number: 113, pull_request: {} },
        },
      }
      await classify({ github, context }, metadata)
      if (denial === "changed-head") pr.head.sha = "c".repeat(40)
      await finish({ github, context, core: { info() {} } })
      assert.equal(armed.length, denial === "none" ? 1 : 0, denial)
      if (armed.length) assert.equal(armed[0].head, head)
    }
  }
)
