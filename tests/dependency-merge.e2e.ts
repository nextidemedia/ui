import { test } from "e2e"
import assert from "node:assert/strict"
import { createRequire } from "node:module"

const require = createRequire(import.meta.url)
const {
  classify,
  finish,
  classifyAndFinish,
  candidateNumbers,
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
      has_unresolved_findings: [
        "review-findings",
        "cached-resolved",
        "cached-empty",
        "cached-forged",
        "cached-new-finding",
      ].includes(denial),
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
            node_id: "BOT_review",
          },
          body: `<!-- codex-pull-request-review-summary -->\n<!-- codex-review-state:v1 ${JSON.stringify(state)} -->`,
        },
      ]
  const jobs = [
    {
      name: "Correctness / Package and browser",
      conclusion: "success",
      steps: [
        "Verify dependency qualification source",
        "Quality",
        "Run npm run typecheck",
        "Qualify packed package and browser",
      ].map((name) => ({
        name,
        conclusion:
          denial === "skip" ||
          (denial === "source-skip" &&
            name === "Verify dependency qualification source")
            ? "skipped"
            : "success",
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
  protection: any,
  reviews: any[]
) {
  let reads = 0
  return async (query: string, input: any) => {
    if (query.includes("reviewThreads"))
      return {
        node: { reviewThreads: reviewPage(denial, reviews, input.after) },
      }
    if (query.startsWith("mutation")) {
      merges.push(input)
      return {
        mergePullRequest: {
          pullRequest: { mergeCommit: { oid: "d".repeat(40) } },
        },
      }
    }
    if (query.includes("mergeStateStatus"))
      return {
        node: {
          headRefOid: head,
          baseRefOid: base,
          baseRef: { target: { oid: denial === "base-race" ? head : base } },
          baseRefName: denial === "retargeted" ? "release" : "main",
          mergeStateStatus: denial.startsWith("native-")
            ? denial === "native-unstable"
              ? "UNSTABLE"
              : "BLOCKED"
            : [
                  "settling",
                  "unstable",
                  "review-changed",
                  "qualification-changed",
                ].includes(denial) && reads++ === 0
              ? denial === "unstable"
                ? "UNSTABLE"
                : "UNKNOWN"
              : "CLEAN",
        },
      }
    return { repository: { ref: { refUpdateRule: protection } } }
  }
}

const scenarios = [
  "none",
  "cached-resolved",
  "cached-empty",
  "cached-forged",
  "cached-new-finding",
  "thread-reopened",
  "thread-last-page",
  "historical-base",
  "stale-parent",
  "source-skip",
  "pr-attached",
  "deferred-changed",
  "red",
  "missing",
  "cancelled",
  "skip",
  "stale-run",
  "dispatch",
  "dispatch-failed",
  "stale-review",
  "no-review",
  "shared-ordinary-status",
  "forged",
  "unsigned",
  "forged-signer",
  "changed-head",
  "unenrolled",
  "major",
  "closed",
  "pre-minor",
  "unknown",
  "downgrade",
  "native-blocked",
  "native-unstable",
  "unstable",
  "base-race",
  "retargeted",
  "settling",
  "review-changed",
  "qualification-changed",
  "metadata-failed",
  "metadata-version-conflict",
  "metadata-missing-target",
  "metadata-extra-target",
  "metadata-single",
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
  if (["major", "pre-minor", "unknown", "metadata-failed"].includes(denial)) {
    assert.equal(
      statuses.find((s) => s.context === "Dependency eligibility").state,
      "success"
    )
    assert.equal(
      statuses.find((s) => s.context === "Dependency review").state,
      "success"
    )
  }
  if (denial === "closed") assert.equal(statuses.length, 1)
  assert.equal(
    grants.length,
    [
      "none",
      "cached-resolved",
      "historical-base",
      "pr-attached",
      "settling",
      "unstable",
      "classification-base-race",
      "review-resolved",
      "dispatch-failed",
      "metadata-single",
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
    await classifyAndFinish(client, updates(denial))
    assert.equal(
      reviews.filter((c: any) => c.body.includes("@codex review")).length,
      1
    )
  }
  if (grants.length) assert.equal(grants[0].head, head)
}

function seedStatuses(denial: string, head: string) {
  // Another Actions workflow can forge this status on the same SHA. It must
  // never substitute for this invocation's verified per-target classification.
  const statuses: any[] = [
    {
      sha: head,
      context: "Dependency eligibility",
      state: "success",
      description: "Eligible verified patch/minor group",
      creator: { login: "github-actions[bot]" },
    },
  ]
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

function updaterCommits(
  denial: string,
  metadata: any[],
  head: string,
  base: string
) {
  let message = metadata
    .map(
      (d: any) =>
        `Updates \`${d.dependencyName}\` from ${d.prevVersion} to ${d.newVersion}`
    )
    .join("\n")
  if (denial === "metadata-version-conflict")
    message = message.replace("from 0.1.0 to 0.1.1", "from 0.1.0 to 0.2.0")
  if (denial === "metadata-missing-target") message = message.split("\n")[0]
  if (denial === "metadata-extra-target")
    message += "\nUpdates `extra` from 0.1.0 to 0.2.0"
  if (denial === "metadata-single") {
    metadata.splice(1)
    message = "Bumps example from v1.2.3 to v1.2.4."
  }
  const commits = [
    {
      sha: head,
      parents: [{ sha: denial === "stale-parent" ? head : base }],
      author: {
        login: denial.startsWith("agent-owned")
          ? "review-owner"
          : "dependabot[bot]",
      },
      committer: { login: denial === "forged-signer" ? "writer" : "web-flow" },
      commit: { verification: { verified: denial !== "unsigned" }, message },
    },
  ]
  if (denial === "multiple-bot-commits")
    commits.unshift({ ...commits[0], sha: base })
  return commits
}

function restAPI(
  denial: string,
  pr: any,
  commits: any[],
  statuses: any[],
  reviews: any[],
  dispatches: any[],
  runs: any[],
  jobs: any[]
) {
  return {
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
      listReviews: async () => [
        {
          id: 2,
          user: { node_id: "BOT_review" },
          commit_id: pr.head.sha,
          state: "COMMENTED",
          body: "<!-- codex-review-receipt:v1 -->",
        },
      ],
      listCommentsForReview: async () => [
        {
          id: denial === "cached-new-finding" ? 2 : 1,
          user: { node_id: "BOT_review" },
          body: "<!-- codex-code-review-finding:v1 -->",
        },
      ],
    },
    repos: {
      get: async () => ({
        data: {
          allow_auto_merge: !["unenrolled", "agent-owned-unenrolled"].includes(
            denial
          ),
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
      createWorkflowDispatch: async (input: any) => {
        dispatches.push(input)
        if (denial === "dispatch-failed")
          throw new Error("Dispatch unavailable")
      },
      listWorkflowRuns: async () => runs,
      listJobsForWorkflowRun: async () => jobs,
    },
  }
}

function reviewPage(denial: string, reviews: any[], after: string | null) {
  const cachedFailure = reviews.some((c) =>
    c.body.includes('"has_unresolved_findings":true')
  )
  const present =
    cachedFailure || ["thread-reopened", "thread-last-page"].includes(denial)
  const resolved =
    ["cached-resolved", "cached-forged", "cached-new-finding"].includes(
      denial
    ) ||
    (denial === "thread-last-page" && !after)
  const nodes =
    present && denial !== "cached-empty"
      ? [
          {
            isResolved: resolved,
            comments: {
              nodes: [
                {
                  databaseId: 1,
                  author: {
                    id: denial === "cached-forged" ? "other" : "BOT_review",
                  },
                  body: "<!-- codex-code-review-finding:v1 -->",
                },
              ],
            },
          },
        ]
      : []
  return {
    nodes,
    pageInfo: {
      hasNextPage: denial === "thread-last-page" && !after,
      endCursor: "next",
    },
  }
}

async function exerciseController(
  client: any,
  denial: string,
  metadata: any[],
  pr: any,
  commits: any[],
  merges: any[],
  dispatches: any[]
) {
  if (["pr-attached", "deferred-changed"].includes(denial)) {
    client.context.eventName = "pull_request_target"
    await classifyAndFinish(client, metadata)
    assert.equal(merges.length, 0)
    assert.deepEqual(dispatches.shift(), {
      owner: "nextidemedia",
      repo: "ui",
      workflow_id: "dependency-merge.yml",
      ref: "main",
      inputs: { pull_number: "113" },
    })
    client.context.eventName = "workflow_dispatch"
    if (denial === "deferred-changed") {
      pr.head.sha = "c".repeat(40)
      commits[0].sha = pr.head.sha
      client.context.payload.pull_request = structuredClone(pr)
    }
    await classifyAndFinish(client, metadata)
    return
  }
  if (denial === "changed-head") {
    const classification = await classify(client, metadata)
    pr.head.sha = "c".repeat(40)
    await finish(client, classification)
  } else if (denial === "dispatch-failed") {
    await assert.rejects(
      classifyAndFinish(client, metadata),
      /Dispatch unavailable/
    )
  } else if (["native-blocked", "native-unstable"].includes(denial)) {
    await assert.rejects(classifyAndFinish(client, metadata), /did not settle/)
  } else await classifyAndFinish(client, metadata)
}

// This API boundary owns the decision to grant native merge permission. No live mutations.
test(
  "dependency groups merge only after verified exact-source qualification and review",
  { platforms: ["api"] },
  async () => {
    assert.deepEqual(
      candidateNumbers({ inputs: { pull_number: "113" } }),
      [113]
    )
    assert.deepEqual(
      candidateNumbers({
        workflow_run: { pull_requests: [{ number: 113 }, { number: 114 }] },
      }),
      [113, 114]
    )
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
        merges: any[] = [],
        dispatches: any[] = []
      const metadata = updates(denial)
      if (denial === "forged") pr.user.login = "other[bot]"
      if (denial === "closed") pr.state = "closed"
      if (denial === "historical-base") pr.base.sha = "c".repeat(40)
      const commits = updaterCommits(denial, metadata, head, base)
      const { reviews, jobs, runs, protection } = evidence(denial, head, base)
      const rest = restAPI(
        denial,
        pr,
        commits,
        statuses,
        reviews,
        dispatches,
        runs,
        jobs
      )
      const github = {
        rest,
        paginate: async (method: any) => method(),
        graphql: nativeAPI(denial, head, base, merges, protection, reviews),
      }
      const context = {
        eventName: "workflow_run",
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
      await exerciseController(
        client,
        denial,
        metadata,
        pr,
        commits,
        merges,
        dispatches
      )
      await assertOutcome(client, denial, merges, statuses, reviews, head)
      assert.equal(dispatches.length, merges.length, denial)
      if (dispatches.length)
        assert.deepEqual(dispatches[0], {
          owner: "nextidemedia",
          repo: "ui",
          workflow_id: "ci.yml",
          ref: "main",
          inputs: { profile: "full", source_sha: "d".repeat(40) },
        })
    }
  }
)
