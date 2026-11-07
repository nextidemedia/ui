// Node preloads this before the pinned metadata action reads its event context.
// This process uses the trusted API snapshot, with editable title excluded.
process.env.GITHUB_EVENT_PATH = `${process.env.RUNNER_TEMP}/dependency-pr.json`
