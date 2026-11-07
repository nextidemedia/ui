const ELIGIBILITY = "Dependency eligibility"
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

async function classify({ github, context }, metadata) {
  const number = context.payload.pull_request.number
  const { data: pr } = await github.rest.pulls.get({
    ...context.repo,
    pull_number: number,
  })
  const event = context.payload.pull_request
  if (pr.head.sha !== event.head.sha || pr.base.sha !== event.base.sha)
    throw new Error("Candidate changed")
  const commits = await github.paginate(github.rest.pulls.listCommits, {
    ...context.repo,
    pull_number: number,
  })
  const bot = pr.user.login === "dependabot[bot]"
  const verified = bot && verifiedCommits(commits, pr.head.sha)
  const allowed = verified && eligible(metadata)
  // Agent-edited heads use ordinary review, never unattended merge.
  const ordinary = !bot || commits.at(-1)?.author?.login !== "dependabot[bot]"
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
        refUpdateRule { requiredApprovingReviewCount requiredStatusCheckContexts }
      }}
    }`,
    repo
  )
  const rule = repository.ref.refUpdateRule
  if (
    !rule ||
    rule.requiredApprovingReviewCount < 1 ||
    ![ELIGIBILITY, QUALIFICATION].every((name) =>
      rule.requiredStatusCheckContexts.includes(name)
    )
  ) {
    throw new Error("Native merge gates are not enrolled")
  }
}

async function mergeQualified(github, pr, pause) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const { node } = await github.graphql(
      `query($id:ID!) {
    node(id:$id) { ... on PullRequest { mergeStateStatus headRefOid baseRefOid } }
  }`,
      { id: pr.node_id }
    )
    if (node.headRefOid !== pr.head.sha || node.baseRefOid !== pr.base.sha)
      return false
    if (node.mergeStateStatus !== "CLEAN") {
      if (attempt < 2) await pause()
      continue
    }
    // Like gh pr merge --auto, merge an already CLEAN PR instead of arming it.
    // GitHub enforces native protections; the expected head makes synchronize races fail.
    await github.graphql(
      `mutation($id:ID!, $head:GitObjectID!) {
    mergePullRequest(input:{pullRequestId:$id,expectedHeadOid:$head,mergeMethod:SQUASH}) {
      pullRequest { number }
    }
  }`,
      { id: pr.node_id, head: pr.head.sha }
    )
    return true
  }
  return false
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

function reviewed(submitted, head) {
  const latest = new Map()
  for (const review of submitted) {
    if (["APPROVED", "CHANGES_REQUESTED", "DISMISSED"].includes(review.state))
      latest.set(review.user.login, review)
  }
  return (
    ![...latest.values()].some((r) => r.state === "CHANGES_REQUESTED") &&
    [...latest.values()].some(
      (r) => r.state === "APPROVED" && r.commit_id === head
    )
  )
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

async function finish({
  github,
  context,
  core,
  pause = () => new Promise((resolve) => setTimeout(resolve, 2000)),
}) {
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
      wait("no eligible current-head classification")
      continue
    }
    if (!(await qualified(github, context, pr))) {
      wait("qualification missing or unsuccessful")
      continue
    }
    const submitted = await github.paginate(github.rest.pulls.listReviews, args)
    if (!reviewed(submitted, head)) {
      wait("current-head review required")
      continue
    }
    const merged = await mergeQualified(github, pr, pause)
    wait(
      merged
        ? "qualified dependency update merged"
        : "native merge requirements pending"
    )
  }
}

async function classifyAndFinish(client, metadata) {
  await classify(client, metadata)
  await finish(client)
}

module.exports = { eligible, classify, finish, classifyAndFinish }
