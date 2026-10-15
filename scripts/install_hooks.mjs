import { execFileSync, spawnSync } from "node:child_process"
import {
  chmodSync,
  existsSync,
  readdirSync,
  realpathSync,
  statSync,
} from "node:fs"
import { relative, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const git = (...args) =>
  execFileSync("git", args, { encoding: "utf8", windowsHide: true }).trim()

function main() {
  const root = realpathSync(git("rev-parse", "--show-toplevel"))
  const project = realpathSync(fileURLToPath(new URL("../", import.meta.url)))
  if (
    relative(root, project) ||
    relative(project, realpathSync(process.cwd()))
  ) {
    throw new Error(
      "Run git init in this project, then run hook setup from its root."
    )
  }
  const configured = spawnSync("git", ["config", "--get", "core.hooksPath"], {
    encoding: "utf8",
    windowsHide: true,
  })
  if (configured.error) throw configured.error
  if (![0, 1].includes(configured.status)) throw new Error(configured.stderr)
  if (configured.status === 0) {
    if (configured.stdout.trim() === ".githooks") return
    throw new Error(
      "Existing core.hooksPath preserved; integrate just pre-commit there explicitly."
    )
  }
  const defaultHooks = git("rev-parse", "--git-path", "hooks")
  const hookNames = new Set([
    "applypatch-msg",
    "pre-applypatch",
    "post-applypatch",
    "pre-commit",
    "pre-merge-commit",
    "prepare-commit-msg",
    "commit-msg",
    "post-commit",
    "pre-rebase",
    "post-checkout",
    "post-merge",
    "pre-push",
    "pre-receive",
    "update",
    "proc-receive",
    "post-receive",
    "post-update",
    "reference-transaction",
    "push-to-checkout",
    "pre-auto-gc",
    "post-rewrite",
    "sendemail-validate",
    "fsmonitor-watchman",
    "p4-changelist",
    "p4-prepare-changelist",
    "p4-post-changelist",
    "p4-pre-submit",
    "post-index-change",
  ])
  if (
    existsSync(defaultHooks) &&
    readdirSync(defaultHooks).some((name) => hookNames.has(name))
  ) {
    throw new Error(
      "Existing Git hooks preserved; integrate just pre-commit there explicitly."
    )
  }
  const hook = resolve(root, ".githooks/pre-commit")
  if (!existsSync(hook) || !statSync(hook).isFile()) {
    throw new Error("Missing tracked .githooks/pre-commit.")
  }
  chmodSync(hook, statSync(hook).mode | 0o111)
  git("config", "--local", "core.hooksPath", ".githooks")
}

try {
  main()
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
}
