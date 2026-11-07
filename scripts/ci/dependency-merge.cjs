const ELIGIBILITY = "Dependency eligibility"
const REVIEW = "Dependency review"
const REVIEW_BOT = "chatgpt-codex-connector[bot]"
const QUALIFICATION = "Correctness / Package and browser"

function eligible(dependencies) {
  return (
    Array.isArray(dependencies) &&
    dependencies.length > 0 &&
    dependencies.every((d) => {
      const parse = (v) =>
        /^v?(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/
          .exec(v || "")
          ?.slice(1)
          .map(Number)
      const old = parse(d.prevVersion),
        next = parse(d.newVersion)
      if (!old || !next || !d.dependencyName) return false
      const patch = next[0] === old[0] && next[1] === old[1] && next[2] > old[2]
      const minor = old[0] > 0 && next[0] === old[0] && next[1] > old[1]
      return (
        (patch && d.updateType === "version-update:semver-patch") ||
        (minor && d.updateType === "version-update:semver-minor")
      )
    })
  )
}

function updaterAuthor(commit) {
  // GitHub signs genuine Dependabot updates as web-flow. A different committing
  // account is an agent-owned edit even if it preserves Dependabot's author.
  return (
    commit?.author?.login === "dependabot[bot]" &&
    ["dependabot[bot]", "web-flow"].includes(commit?.committer?.login)
  )
}

function verifiedCommits(commits, head) {
  // fetch-metadata v3.1.0 reads the first commit, so it must also be the head.
  return (
    commits.length === 1 &&
    commits[0].sha === head &&
    commits[0].parents?.length === 1 &&
    updaterAuthor(commits[0]) &&
    commits[0].commit.verification?.verified
  )
}

async function classify({ github, context }, metadata) {
  const number = context.payload.pull_request.number
  const { data: pr } = await github.rest.pulls.get({
    ...context.repo,
    pull_number: number,
  })
  if (pr.state !== "open" || pr.base.ref !== "main")
    return { head: pr.head.sha, allowed: false }
  const event = context.payload.pull_request
  if (pr.head.sha !== event.head.sha) throw new Error("Candidate changed")
  const commits = await github.paginate(github.rest.pulls.listCommits, {
    ...context.repo,
    pull_number: number,
  })
  const bot = pr.user.login === "dependabot[bot]"
  const verified = bot && verifiedCommits(commits, pr.head.sha)
  const allowed = verified && eligible(metadata)
  // Agent-edited heads use ordinary review, never unattended merge.
  const ordinary = !bot || !updaterAuthor(commits.at(-1))
  await github.rest.repos.createCommitStatus({
    ...context.repo,
    sha: pr.head.sha,
    context: ELIGIBILITY,
    state: "success",
    description: allowed
      ? "Eligible verified patch/minor group"
      : ordinary
        ? "Agent-owned review lane"
        : "Agent compatibility upgrade lane",
  })
  return {
    head: pr.head.sha,
    allowed,
    base: allowed ? commits[0].parents[0].sha : null,
  }
}

async function requireProtection(github, repo) {
  // Effective rules are readable without an administration credential.
  const { repository } = await github.graphql(
    `query($owner:String!, $repo:String!) {
      repository(owner:$owner,name:$repo) { ref(qualifiedName:"refs/heads/main") {
        refUpdateRule { requiredStatusCheckContexts }
      }}
    }`,
    repo
  )
  const rule = repository.ref.refUpdateRule
  if (
    !rule ||
    ![ELIGIBILITY, QUALIFICATION].every((name) =>
      rule.requiredStatusCheckContexts.includes(name)
    )
  ) {
    throw new Error("Native merge gates are not enrolled")
  }
}

function pauseNative() {
  return new Promise((resolve) => setTimeout(resolve, 2000))
}

async function readNative(github, pr) {
  const { node } = await github.graphql(
    `query($id:ID!) {
    node(id:$id) { ... on PullRequest { mergeStateStatus headRefOid baseRefName baseRef { target { oid } } } }
  }`,
    { id: pr.node_id }
  )
  return node
}

function sameCandidate(node, pr) {
  return (
    node.headRefOid === pr.head.sha &&
    node.baseRef?.target.oid === pr.qualificationBase &&
    node.baseRefName === "main"
  )
}

async function mergeQualified(github, pr, confirm, pause = pauseNative) {
  for (let attempt = 0; attempt < 30; attempt++) {
    const node = await readNative(github, pr)
    if (!sameCandidate(node, pr)) return false
    if (node.mergeStateStatus === "CLEAN") {
      if (!(await confirm())) return false
      const latest = await readNative(github, pr)
      if (!sameCandidate(latest, pr)) return false
      if (latest.mergeStateStatus === "CLEAN") {
        const { mergePullRequest } = await github.graphql(
          `mutation($id:ID!, $head:GitObjectID!) {
          mergePullRequest(input:{pullRequestId:$id,expectedHeadOid:$head,mergeMethod:SQUASH}) {
            pullRequest { mergeCommit { oid } }
          }
        }`,
          { id: pr.node_id, head: pr.head.sha }
        )
        return mergePullRequest.pullRequest.mergeCommit.oid
      }
    } else if (
      !["UNKNOWN", "BLOCKED", "UNSTABLE"].includes(node.mergeStateStatus)
    ) {
      throw new Error("Native merge requirements are not satisfied")
    }
    if (attempt < 29) await pause()
  }
  throw new Error(
    "Native mergeability did not settle; retry this workflow after checking GitHub merge requirements"
  )
}

async function confirmEvidence(github, context, pr) {
  const { data: repo } = await github.rest.repos.get(context.repo)
  if (!repo.allow_auto_merge) return false
  await requireProtection(github, context.repo)
  if (!(await qualified(github, context, pr))) return false
  return checkReview(github, context, pr)
}

async function qualified(github, context, pr) {
  // CI verifies that its tested merge tree equals the exact dependency head's
  // tree. Its verified single parent must still be live main at merge.
  // PR base.sha and workflow association base.sha are historical, not authority.
  const runs = await github.paginate(github.rest.actions.listWorkflowRuns, {
    ...context.repo,
    workflow_id: "ci.yml",
    event: "pull_request",
    head_sha: pr.head.sha,
  })
  const run = runs.find((r) =>
    r.pull_requests?.some(
      (p) => p.number === pr.number && p.head.sha === pr.head.sha
    )
  )
  if (!run || run.conclusion !== "success") {
    return false
  }
  const jobs = await github.paginate(
    github.rest.actions.listJobsForWorkflowRun,
    { ...context.repo, run_id: run.id }
  )
  const job = jobs.find((j) => j.name === QUALIFICATION)
  const required = [
    "Verify dependency qualification source",
    "Quality",
    "Run npm run typecheck",
    "Qualify packed package and browser",
  ]
  if (
    job?.conclusion !== "success" ||
    !required.every((name) =>
      job.steps?.some((s) => s.name === name && s.conclusion === "success")
    )
  ) {
    return false
  }
  return true
}

function reviewSummary(comments) {
  return comments
    .filter((c) => c.user.login === REVIEW_BOT && c.user.type === "Bot")
    .findLast((c) =>
      c.body.startsWith("<!-- codex-pull-request-review-summary -->")
    )
}

function reviewResult(comments, head) {
  const raw = reviewSummary(comments)?.body.match(
    /<!-- codex-review-state:v1 (.*?) -->/s
  )?.[1]
  if (!raw) return "pending"
  let review
  try {
    review = JSON.parse(raw).code_review
  } catch {
    return "pending"
  }
  if (review?.commit_sha !== head || review.status !== "completed")
    return "pending"
  if (review.has_unresolved_findings === false) return "success"
  return "failure"
}

async function liveReviewState(github, pr, comment, cached) {
  if (cached === "pending") return cached
  if (!comment.user.node_id) return "failure"
  const resolved = await resolvedFindingIds(github, pr, comment.user.node_id)
  if (!resolved) return "failure"
  if (cached === "success") return cached
  const expected = await currentFindingIds(github, pr, comment.user.node_id)
  // Only all findings from the latest completed current-head review can
  // reconcile its lagging summary; older resolved findings are insufficient.
  return expected.size && [...expected].every((id) => resolved.has(id))
    ? "success"
    : "failure"
}

async function resolvedFindingIds(github, pr, actor) {
  const resolved = new Set()
  let after = null
  do {
    const { node } = await github.graphql(
      `query($id:ID!, $after:String) {
        node(id:$id) { ... on PullRequest {
          reviewThreads(first:100, after:$after) {
            nodes { isResolved comments(first:1) { nodes {
              databaseId author { ... on Bot { id } } body
            } } }
            pageInfo { hasNextPage endCursor }
          }
        } }
      }`,
      { id: pr.node_id, after }
    )
    const page = node.reviewThreads
    for (const thread of page.nodes) {
      const first = thread.comments.nodes[0]
      if (
        first?.author?.id !== actor ||
        !first.body.includes("<!-- codex-code-review-finding:v1 -->")
      )
        continue
      if (!thread.isResolved) return null
      resolved.add(first.databaseId)
    }
    after = page.pageInfo.hasNextPage ? page.pageInfo.endCursor : null
  } while (after)
  return resolved
}

async function currentFindingIds(github, pr, actor) {
  const args = { owner: "nextidemedia", repo: "ui", pull_number: pr.number }
  const reviews = await github.paginate(github.rest.pulls.listReviews, args)
  const current = reviews.findLast(
    (r) =>
      r.user?.node_id === actor &&
      r.commit_id === pr.head.sha &&
      r.state === "COMMENTED" &&
      r.body?.startsWith("<!-- codex-review-receipt:v1 -->")
  )
  if (!current) return new Set()
  const comments = await github.paginate(
    github.rest.pulls.listCommentsForReview,
    { ...args, review_id: current.id }
  )
  return new Set(
    comments
      .filter(
        (c) =>
          c.user?.node_id === actor &&
          c.body?.includes("<!-- codex-code-review-finding:v1 -->")
      )
      .map((c) => c.id)
  )
}

async function publishReview(github, context, pr, state) {
  const description =
    state === "success"
      ? "Current-head automated review clean"
      : "Automated review incomplete or findings"
  const statuses = await github.paginate(
    github.rest.repos.listCommitStatusesForRef,
    { ...context.repo, ref: pr.head.sha }
  )
  const current = statuses.find((s) => s.context === REVIEW)
  if (
    current?.state === state &&
    current.description === description &&
    current.creator?.login === "github-actions[bot]"
  )
    return
  await github.rest.repos.createCommitStatus({
    ...context.repo,
    sha: pr.head.sha,
    context: REVIEW,
    state,
    description,
  })
}

async function checkReview(github, context, pr) {
  const args = { ...context.repo, issue_number: pr.number }
  const comments = await github.paginate(github.rest.issues.listComments, args)
  const state = await liveReviewState(
    github,
    pr,
    reviewSummary(comments),
    reviewResult(comments, pr.head.sha)
  )
  await publishReview(github, context, pr, state)
  const marker = `<!-- dependency-review-request:${pr.head.sha} -->`
  if (
    state === "pending" &&
    !comments.some(
      (c) => c.user.login === "github-actions[bot]" && c.body.includes(marker)
    )
  ) {
    await github.rest.issues.createComment({
      ...args,
      body: `@codex review\n\n${marker}`,
    })
  }
  return state === "success"
}

function candidate(pr) {
  return (
    pr.state === "open" &&
    !pr.draft &&
    pr.base.ref === "main" &&
    pr.head.repo.full_name === "nextidemedia/ui" &&
    pr.user.login === "dependabot[bot]"
  )
}

function candidateNumbers(payload) {
  if (payload.inputs?.pull_number) return [Number(payload.inputs.pull_number)]
  return payload.pull_request
    ? [payload.pull_request.number]
    : payload.issue?.pull_request
      ? [payload.issue.number]
      : (payload.workflow_run?.pull_requests || []).map((pr) => pr.number)
}

async function finish({ github, context, core, pause }, classification) {
  const number = context.payload.pull_request.number
  const { data: current } = await github.rest.pulls.get({
    ...context.repo,
    pull_number: number,
  })
  const pr = { ...current, qualificationBase: classification.base }
  const wait = (reason) => core.info(`PR ${number}: ${reason}`)
  if (!candidate(pr) || pr.head.sha !== classification.head) return
  // Authorization comes from this invocation's authenticated metadata, never
  // from a commit status another workflow using the same Actions App can write.
  if (!classification.allowed) {
    await checkReview(github, context, pr)
    wait("no eligible current-head classification")
    return
  }
  const reviewClean = await checkReview(github, context, pr)
  if (!(await qualified(github, context, pr))) {
    wait("qualification missing or unsuccessful")
    return
  }
  if (!reviewClean) {
    wait("current-head automated review required")
    return
  }
  const { data: repo } = await github.rest.repos.get(context.repo)
  if (!repo.allow_auto_merge) {
    wait("dependency automation not enrolled")
    return
  }
  await requireProtection(github, context.repo)
  if (context.eventName === "pull_request_target") {
    // Finish the PR-attached job before observing mergeability. The native
    // dispatch is queued behind it by the existing per-PR concurrency group.
    await github.rest.actions.createWorkflowDispatch({
      ...context.repo,
      workflow_id: "dependency-merge.yml",
      ref: "main",
      inputs: { pull_number: String(number) },
    })
    wait("ready; fresh finalization dispatched")
    return
  }
  const merged = await mergeQualified(
    github,
    pr,
    () => confirmEvidence(github, context, pr),
    pause
  )
  if (merged) {
    core.info(`merged_source: ${merged}`)
    // GITHUB_TOKEN merges suppress push workflows. Dispatch is an explicit
    // supported exception and preserves full main qualification/evidence.
    await github.rest.actions.createWorkflowDispatch({
      ...context.repo,
      workflow_id: "ci.yml",
      ref: "main",
      inputs: { profile: "full", source_sha: merged },
    })
  }
  wait(
    merged
      ? "native merge and exact-commit qualification requested"
      : "current evidence no longer qualifies"
  )
}

async function classifyAndFinish(client, metadata) {
  const classification = await classify(client, metadata)
  await finish(client, classification)
}

module.exports = {
  eligible,
  classify,
  finish,
  classifyAndFinish,
  reviewResult,
  candidateNumbers,
}
