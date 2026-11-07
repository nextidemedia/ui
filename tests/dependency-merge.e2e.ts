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
  if (denial === "metadata-failed" || denial.startsWith("agent-owned"))
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
      has_any_findings: ["review-findings", "review-resolved"].includes(denial),
      has_unresolved_findings: denial === "review-findings",
    },
  }
  const reviews = [
    "no-review",
    "agent-owned-no-review",
    "shared-ordinary-status",
  ].includes(denial)
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
  merges: any[],
  protection: any
) {
  let reads = 0
  return async (query: string, input: any) => {
    if (query.startsWith("mutation")) {
      merges.push(input)
      return {}
    }
    if (query.includes("mergeStateStatus"))
      return {
        node: {
          headRefOid: head,
          baseRefOid: denial === "base-race" ? head : base,
          baseRefName: denial === "retargeted" ? "release" : "main",
          mergeStateStatus:
            denial === "native-blocked"
              ? "BLOCKED"
              : [
                    "settling",
                    "review-changed",
                    "qualification-changed",
                  ].includes(denial) && reads++ === 0
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
  "shared-ordinary-status",
  "forged",
  "unsigned",
  "forged-signer",
  "changed-head",
  "unenrolled",
  "major",
  "pre-minor",
  "unknown",
  "downgrade",
  "native-blocked",
  "base-race",
  "retargeted",
  "settling",
  "review-changed",
  "qualification-changed",
  "metadata-failed",
  "agent-owned",
  "agent-owned-no-review",
  "agent-owned-unenrolled",
  "multiple-bot-commits",
  "classification-base-race",
  "review-findings",
  "review-resolved",
  "forged-review",
]

async function assertOutcome(
  client: any,
  denial: string,
  merges: any[],
  statuses: any[],
  reviews: any[],
  head: string
) {
  const grants = merges
  assert.equal(
    grants.length,
    [
      "none",
      "settling",
      "classification-base-race",
      "review-resolved",
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
  }
  if (denial === "no-review") {
    await finish(client)
    assert.equal(
      reviews.filter((c: any) => c.body.includes("@codex review")).length,
      1
    )
  }
  if (grants.length) assert.equal(grants[0].head, head)
}

function seedStatuses(denial: string, head: string) {
  const statuses: any[] = []
  if (denial === "shared-ordinary-status")
    statuses.push({
      sha: head,
      context: "Dependency review",
      state: "success",
      description: "Ordinary review lane",
      creator: { login: "github-actions[bot]" },
    })
  return statuses
}

function pauseFor(
  denial: string,
  reviews: any[],
  head: string,
  base: string,
  runs: any[]
) {
  return async () => {
    if (denial === "qualification-changed") runs[0].conclusion = "cancelled"
    if (denial === "review-changed")
      reviews[0].body = evidence("review-findings", head, base).reviews[0].body
  }
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
        number: 113,
        node_id: "PR_test",
        state: "open",
        draft: false,
        head: { sha: head, repo: { full_name: "nextidemedia/ui" } },
        base: { ref: "main", sha: base },
        user: { login: "dependabot[bot]" },
      }
      const statuses: any[] = seedStatuses(denial, head),
        merges: any[] = []
      const metadata = updates(denial)
      if (denial === "forged") pr.user.login = "other[bot]"
      const commits = [
        {
          sha: head,
          author: { login: "dependabot[bot]" },
          committer: {
            login: denial === "forged-signer" ? "writer" : "web-flow",
          },
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
            data: {
              allow_auto_merge: ![
                "unenrolled",
                "agent-owned-unenrolled",
              ].includes(denial),
            },
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
        graphql: nativeAPI(denial, head, base, merges, protection),
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
      const client = {
        github,
        context,
        core: { info() {} },
        pause: pauseFor(denial, reviews, head, base, runs),
      }
      if (denial === "changed-head") {
        await classify(client, metadata)
        pr.head.sha = "c".repeat(40)
        await finish(client)
      } else if (denial === "native-blocked") {
        await assert.rejects(
          classifyAndFinish(client, metadata),
          /did not settle/
        )
      } else await classifyAndFinish(client, metadata)
      await assertOutcome(client, denial, merges, statuses, reviews, head)
    }
  }
)
