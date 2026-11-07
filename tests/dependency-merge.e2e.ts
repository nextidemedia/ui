import { test } from "e2e"
import assert from "node:assert/strict"
import { createRequire } from "node:module"

const require = createRequire(import.meta.url)
const {
  classify,
  finish,
  classifyAndFinish,
} = require("../scripts/ci/dependency-merge.cjs")

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
  if (
    ["metadata-failed", "agent-owned", "agent-owned-no-review"].includes(denial)
  )
    return []
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
  const state = {
    code_review: {
      commit_sha: denial === "stale-review" ? base : head,
      status: "completed",
      has_any_findings: denial === "review-findings",
      has_unresolved_findings: denial === "review-findings",
    },
  }
  const reviews = ["no-review", "agent-owned-no-review"].includes(denial)
    ? []
    : [
        {
          user: {
            login:
              denial === "forged-review"
                ? "other[bot]"
                : "chatgpt-codex-connector[bot]",
            type: "Bot",
          },
          body: `<!-- codex-pull-request-review-summary -->\n<!-- codex-review-state:v1 ${JSON.stringify(state)} -->`,
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
    requiredStatusCheckContexts: [
      "Dependency eligibility",
      "Dependency review",
      "Correctness / Package and browser",
    ],
  }
  return { reviews, jobs, runs, protection }
}

function nativeAPI(
  denial: string,
  head: string,
  base: string,
  armed: any[],
  protection: any
) {
  return async (query: string, input: any) => {
    if (query.startsWith("mutation")) {
      if (
        denial === "clean-race" &&
        query.includes("enablePullRequestAutoMerge")
      )
        throw new Error("Pull request is in clean status")
      armed.push({
        ...input,
        mode: query.includes("disablePullRequestAutoMerge")
          ? "disable"
          : query.includes("enablePullRequestAutoMerge")
            ? "arm"
            : "merge",
      })
      return {}
    }
    if (query.includes("mergeStateStatus"))
      return {
        node: {
          headRefOid: head,
          baseRefOid: denial === "base-race" ? head : base,
          mergeStateStatus:
            denial === "native-blocked"
              ? "BLOCKED"
              : ["settling", "clean-race"].includes(denial)
                ? "UNKNOWN"
                : "CLEAN",
        },
      }
    return { repository: { ref: { refUpdateRule: protection } } }
  }
}

const scenarios = [
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
  "native-blocked",
  "base-race",
  "settling",
  "metadata-failed",
  "agent-owned",
  "agent-owned-no-review",
  "multiple-bot-commits",
  "classification-base-race",
  "clean-race",
  "review-findings",
  "forged-review",
]

async function assertOutcome(
  client: any,
  denial: string,
  armed: any[],
  statuses: any[],
  reviews: any[],
  head: string
) {
  const grants = armed.filter((a) => a.mode !== "disable")
  assert.equal(
    grants.length,
    [
      "none",
      "settling",
      "native-blocked",
      "classification-base-race",
      "clean-race",
    ].includes(denial)
      ? 1
      : 0,
    denial
  )
  if (denial.startsWith("agent-owned")) {
    assert.equal(
      statuses[0].state,
      denial === "agent-owned-no-review" ? "pending" : "success"
    )
    assert.equal(armed[0].mode, "disable")
  }
  if (["settling", "native-blocked"].includes(denial))
    assert.equal(armed[0].mode, "arm")
  if (denial === "clean-race") assert.equal(armed[0].mode, "merge")
  if (denial === "no-review") {
    await finish(client)
    assert.equal(
      reviews.filter((c: any) => c.body.includes("@codex review")).length,
      1
    )
  }
  if (grants.length) assert.equal(grants[0].head, head)
}

// This API boundary owns the decision to grant native merge permission. No live mutations.
test(
  "dependency groups merge only after verified exact-source qualification and review",
  { platforms: ["api"] },
  async () => {
    for (const denial of scenarios) {
      const head = "a".repeat(40),
        base = "b".repeat(40)
      const pr = {
        auto_merge: denial.startsWith("agent-owned") ? {} : null,
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
      if (denial.startsWith("agent-owned"))
        commits[0].author.login = "review-owner"
      if (denial === "multiple-bot-commits")
        commits.unshift({ ...commits[0], sha: base })
      const { reviews, jobs, runs, protection } = evidence(denial, head, base)
      const rest = {
        issues: {
          listComments: async () => reviews,
          createComment: async (comment: any) =>
            reviews.push({
              ...comment,
              user: { login: "github-actions[bot]", type: "Bot" },
            }),
        },
        pulls: {
          get: async () => ({ data: pr }),
          listCommits: async () => commits,
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
        graphql: nativeAPI(denial, head, base, armed, protection),
      }
      const context = {
        repo: { owner: "nextidemedia", repo: "ui" },
        payload: {
          pull_request: structuredClone(pr),
          issue: { number: 113, pull_request: {} },
        },
      }
      if (denial === "classification-base-race")
        context.payload.pull_request.base.sha = head
      const client = { github, context, core: { info() {} } }
      if (denial === "changed-head") {
        await classify(client, metadata)
        pr.head.sha = "c".repeat(40)
        await finish(client)
      } else await classifyAndFinish(client, metadata)
      await assertOutcome(client, denial, armed, statuses, reviews, head)
    }
  }
)
