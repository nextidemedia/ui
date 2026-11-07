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

function verifiedCommits(commits, head) {
  return (
    // fetch-metadata v3.1.0 reads the first commit, so it must also be the head.
    commits.length === 1 &&
    commits.at(-1).sha === head &&
    commits.every(
      (c) =>
        c.author?.login === "dependabot[bot]" && c.commit.verification?.verified
    )
  )
}

async function enterOrdinaryLane(github, context, pr, ordinary) {
  if (!ordinary) return
  if (pr.user.login === "dependabot[bot]" && pr.auto_merge) {
    await github.graphql(
      `mutation($id:ID!) {
      disablePullRequestAutoMerge(input:{pullRequestId:$id}) { pullRequest { number } }
    }`,
      { id: pr.node_id }
    )
  }
  if (pr.user.login === "dependabot[bot]") return
  await github.rest.repos.createCommitStatus({
    ...context.repo,
    sha: pr.head.sha,
    context: REVIEW,
    state: "success",
    description: "Ordinary review lane",
  })
}

async function classify({ github, context }, metadata) {
  const number = context.payload.pull_request.number
  const { data: pr } = await github.rest.pulls.get({
    ...context.repo,
    pull_number: number,
  })
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
  const ordinary = !bot || commits.at(-1)?.author?.login !== "dependabot[bot]"
  await enterOrdinaryLane(github, context, pr, ordinary)
  await github.rest.repos.createCommitStatus({
    ...context.repo,
    sha: pr.head.sha,
    context: ELIGIBILITY,
    state: allowed || ordinary ? "success" : "failure",
    description: allowed
      ? "Eligible verified patch/minor group"
      : ordinary
        ? "Agent-owned review lane"
        : "Agent compatibility upgrade required",
  })
  return allowed
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
    ![ELIGIBILITY, REVIEW, QUALIFICATION].every((name) =>
      rule.requiredStatusCheckContexts.includes(name)
    )
  ) {
    throw new Error("Native merge gates are not enrolled")
  }
}

async function nativeMerge(github, pr, operation) {
  await github.graphql(
    `mutation($id:ID!, $head:GitObjectID!) {
    ${operation}(input:{pullRequestId:$id,expectedHeadOid:$head,mergeMethod:SQUASH}) {
      pullRequest { number }
    }
  }`,
    { id: pr.node_id, head: pr.head.sha }
  )
}

async function mergeQualified(github, pr) {
  const { node } = await github.graphql(
    `query($id:ID!) {
    node(id:$id) { ... on PullRequest { mergeStateStatus headRefOid baseRefOid } }
  }`,
    { id: pr.node_id }
  )
  if (node.headRefOid !== pr.head.sha || node.baseRefOid !== pr.base.sha)
    return false
  // Use native auto-merge to observe pending mergeability, without a scheduler or polling.
  const operation =
    node.mergeStateStatus === "CLEAN"
      ? "mergePullRequest"
      : "enablePullRequestAutoMerge"
  try {
    await nativeMerge(github, pr, operation)
    return operation
  } catch (error) {
    // GitHub can become CLEAN between the read and auto-merge mutation.
    if (
      operation !== "enablePullRequestAutoMerge" ||
      !/clean status/i.test(error.message)
    )
      throw error
    await nativeMerge(github, pr, "mergePullRequest")
    return "mergePullRequest"
  }
}

async function qualified(github, context, pr) {
  // Accept only PR qualification for this head and current base, never dispatch/push green.
  const runs = await github.paginate(github.rest.actions.listWorkflowRuns, {
    ...context.repo,
    workflow_id: "ci.yml",
    event: "pull_request",
    head_sha: pr.head.sha,
  })
  const run = runs.find((r) =>
    r.pull_requests?.some(
      (p) =>
        p.number === pr.number &&
        p.head.sha === pr.head.sha &&
        p.base.sha === pr.base.sha
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

function reviewResult(comments, head) {
  const comment = comments
    .filter((c) => c.user.login === REVIEW_BOT && c.user.type === "Bot")
    .findLast((c) =>
      c.body.startsWith("<!-- codex-pull-request-review-summary -->")
    )
  const raw = comment?.body.match(/<!-- codex-review-state:v1 (.*?) -->/s)?.[1]
  if (!raw) return "pending"
  let review
  try {
    review = JSON.parse(raw).code_review
  } catch {
    return "pending"
  }
  if (review?.commit_sha !== head || review.status !== "completed")
    return "pending"
  if (
    review.has_any_findings === false &&
    review.has_unresolved_findings === false
  )
    return "success"
  return "failure"
}

async function checkReview(github, context, pr) {
  const args = { ...context.repo, issue_number: pr.number }
  const comments = await github.paginate(github.rest.issues.listComments, args)
  const state = reviewResult(comments, pr.head.sha)
  await github.rest.repos.createCommitStatus({
    ...context.repo,
    sha: pr.head.sha,
    context: REVIEW,
    state,
    description:
      state === "success"
        ? "Current-head automated review clean"
        : "Automated review incomplete or findings",
  })
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

function eligibleStatus(status) {
  return (
    status?.state === "success" &&
    status.description === "Eligible verified patch/minor group" &&
    status.creator?.login === "github-actions[bot]"
  )
}

function candidateNumbers(payload) {
  return payload.pull_request
    ? [payload.pull_request.number]
    : payload.issue?.pull_request
      ? [payload.issue.number]
      : (payload.workflow_run?.pull_requests || []).map((pr) => pr.number)
}

async function finish({ github, context, core }) {
  const numbers = candidateNumbers(context.payload)
  for (const number of numbers) {
    const args = { ...context.repo, pull_number: number }
    const { data: pr } = await github.rest.pulls.get(args)
    const wait = (reason) => core.info(`PR ${number}: ${reason}`)
    if (!candidate(pr)) continue
    const head = pr.head.sha
    const { data: repo } = await github.rest.repos.get(context.repo)
    if (!repo.allow_auto_merge) {
      wait("native auto-merge not enrolled")
      continue
    }
    await requireProtection(github, context.repo)
    const statuses = await github.paginate(
      github.rest.repos.listCommitStatusesForRef,
      { ...context.repo, ref: head }
    )
    const status = statuses.find((s) => s.context === ELIGIBILITY)
    if (!eligibleStatus(status)) {
      if (
        status?.description === "Agent-owned review lane" &&
        status.creator?.login === "github-actions[bot]"
      )
        await checkReview(github, context, pr)
      wait("no eligible current-head classification")
      continue
    }
    const reviewClean = await checkReview(github, context, pr)
    if (!(await qualified(github, context, pr))) {
      wait("qualification missing or unsuccessful")
      continue
    }
    if (!reviewClean) {
      wait("current-head automated review required")
      continue
    }
    const result = await mergeQualified(github, pr)
    wait(result ? "qualified native merge requested" : "candidate changed")
  }
}

async function classifyAndFinish(client, metadata) {
  await classify(client, metadata)
  await finish(client)
}

module.exports = { eligible, classify, finish, classifyAndFinish, reviewResult }
