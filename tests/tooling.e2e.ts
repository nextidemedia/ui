import { test } from "e2e"
import assert from "node:assert/strict"
import { execFileSync, spawnSync } from "node:child_process"
import { existsSync } from "node:fs"
import {
  copyFile,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises"
import { tmpdir } from "node:os"
import { delimiter, dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
import probes from "./fixtures/lint-probes.json" with { type: "json" }

test(
  "native file budgets count comments, skip blanks and retain source/test discovery",
  { platforms: ["api"] },
  async () => {
    const directory = await mkdtemp(join(root, "scripts/lint-size-"))
    const cases = [
      ["source.mjs", 600, false],
      ["over.cjs", 601, true],
      ["vite.config.ts", 601, true],
      ["tests/limit.ts", 900, false],
      ["tests/over.ts", 901, true],
      ["__tests__/limit.js", 900, false],
      ["__tests__/over.js", 901, true],
      ["test_limit.ts", 900, false],
      ["test_over.ts", 901, true],
      ["limit.test.ts", 900, false],
      ["over.test.ts", 901, true],
      ["limit.spec.tsx", 900, false],
      ["over.spec.tsx", 901, true],
    ] as const
    try {
      for (const [name, count] of cases) {
        await mkdir(dirname(join(directory, name)), { recursive: true })
        await writeFile(
          join(directory, name),
          "// counted comment\n\n".repeat(count - 1) +
            'console.log("budget probe")\n'
        )
      }
      for (const correctness of [false, true]) {
        const result = spawnSync(
          process.execPath,
          [
            join(root, "node_modules/vite-plus/bin/vp"),
            "lint",
            "--format",
            "json",
            ...(correctness ? ["--config", ".oxlintrc.correctness.json"] : []),
          ],
          { cwd: root, encoding: "utf8" }
        )
        assert.equal(
          result.status,
          correctness ? 0 : 1,
          result.stdout + result.stderr
        )
        const { diagnostics } = JSON.parse(result.stdout) as {
          diagnostics: { filename: string; code: string }[]
        }
        for (const [name, , over] of cases) {
          assert.equal(
            diagnostics.some(
              (d) =>
                resolve(root, d.filename) === join(directory, name) &&
                d.code.includes("max-lines")
            ),
            over && !correctness,
            name
          )
        }
      }
    } finally {
      await rm(directory, { recursive: true, force: true })
    }
  }
)

test(
  "hook setup preserves existing hooks and activates check-only commits from a root with spaces",
  { platforms: ["api"] },
  async () => {
    const fixture = await mkdtemp(join(tmpdir(), "nextide ui hooks "))
    const git = (...args: string[]) =>
      spawnSync("git", args, { cwd: fixture, encoding: "utf8" })
    const install = (cwd = fixture) =>
      spawnSync(
        process.execPath,
        [join(fixture, "scripts/install_hooks.mjs")],
        { cwd, encoding: "utf8" }
      )
    try {
      assert.equal(git("init").status, 0)
      await mkdir(join(fixture, "scripts"))
      await mkdir(join(fixture, ".githooks"))
      await copyFile(
        join(root, "scripts/install_hooks.mjs"),
        join(fixture, "scripts/install_hooks.mjs")
      )
      await copyFile(
        join(root, ".githooks/pre-commit"),
        join(fixture, ".githooks/pre-commit")
      )
      await writeFile(
        join(fixture, "justfile"),
        'pre-commit:\n    node -e "process.exit(23)"\n'
      )
      assert.equal(install(join(fixture, "scripts")).status, 1)
      assert.equal(git("config", "--get", "core.hooksPath").status, 1)
      assert.equal(
        git("config", "--local", "core.hooksPath", "custom hooks").status,
        0
      )
      assert.equal(install().status, 1)
      assert.equal(
        git("config", "--get", "core.hooksPath").stdout.trim(),
        "custom hooks"
      )
      git("config", "--local", "--unset", "core.hooksPath")
      const defaultHook = join(fixture, ".git/hooks/pre-push")
      await writeFile(defaultHook, "#!/bin/sh\nexit 0\n")
      assert.equal(install().status, 1)
      assert.equal(await readFile(defaultHook, "utf8"), "#!/bin/sh\nexit 0\n")
      await rm(defaultHook)
      assert.equal(install().status, 0)
      assert.equal(install().status, 0)
      assert.equal(
        git("config", "--get", "core.hooksPath").stdout.trim(),
        ".githooks"
      )
      await writeFile(join(fixture, "staged.txt"), "staged\n")
      git("add", "staged.txt")
      await writeFile(join(fixture, "staged.txt"), "unstaged\n")
      const index = git("show", ":staged.txt").stdout
      const committed = git(
        "-c",
        "user.name=Tooling",
        "-c",
        "user.email=tooling@example.invalid",
        "commit",
        "-m",
        "must fail"
      )
      assert.notEqual(committed.status, 0)
      assert.match(committed.stdout + committed.stderr, /exit code 23/)
      assert.equal(
        await readFile(join(fixture, "staged.txt"), "utf8"),
        "unstaged\n"
      )
      assert.equal(git("show", ":staged.txt").stdout, index)
    } finally {
      await rm(fixture, { recursive: true, force: true })
    }
  }
)

test(
  "dead-code reporting keeps advisory findings and fails on tool execution errors",
  { platforms: ["api"] },
  async () => {
    const fixture = await mkdtemp(join(tmpdir(), "nextide-ui-deadcode-"))
    try {
      await mkdir(join(fixture, "scripts"))
      await copyFile(
        join(root, "scripts/deadcode.mjs"),
        join(fixture, "scripts/deadcode.mjs")
      )
      await writeFile(
        join(fixture, "package.json"),
        '{"name":"deadcode-probe","version":"1.0.0"}'
      )
      await writeFile(
        join(fixture, "knip.json"),
        '{"entry":["entry.js"],"project":["*.js"]}'
      )
      await writeFile(join(fixture, "entry.js"), 'console.log("entry")\n')
      await writeFile(join(fixture, "unused.js"), 'console.log("unused")\n')
      await symlink(
        join(root, "node_modules"),
        join(fixture, "node_modules"),
        "junction"
      )
      const reported = spawnSync(
        process.execPath,
        [join(fixture, "scripts/deadcode.mjs")],
        { cwd: fixture, encoding: "utf8" }
      )
      assert.equal(reported.status, 0, reported.stdout + reported.stderr)
      assert.match(
        await readFile(join(fixture, ".artifacts/deadcode/knip.txt"), "utf8"),
        /unused\.js/
      )
      await rm(join(fixture, "node_modules"))
      const failed = spawnSync(
        process.execPath,
        [join(fixture, "scripts/deadcode.mjs")],
        { cwd: fixture, encoding: "utf8" }
      )
      assert.notEqual(failed.status, 0)
      assert.match(
        await readFile(join(fixture, ".artifacts/deadcode/knip.txt"), "utf8"),
        /MODULE_NOT_FOUND/
      )
    } finally {
      await rm(fixture, { recursive: true, force: true })
    }
  }
)

test(
  "hook setup fails without Node before changing Git configuration",
  { platforms: ["api"] },
  async () => {
    const fixture = await mkdtemp(join(tmpdir(), "nextide-ui-no-node-"))
    try {
      await mkdir(join(fixture, "scripts"))
      await copyFile(
        join(root, "scripts/install_hooks.mjs"),
        join(fixture, "scripts/install_hooks.mjs")
      )
      await copyFile(join(root, "justfile"), join(fixture, "justfile"))
      execFileSync("git", ["init"], { cwd: fixture })
      const executable = process.platform === "win32" ? "node.exe" : "node"
      const entries = (process.env.PATH ?? "").split(delimiter)
      const just = entries
        .map((entry) =>
          join(entry, process.platform === "win32" ? "just.exe" : "just")
        )
        .find(existsSync)
      assert(just, "just is required for hook acceptance")
      const path = entries
        .filter((entry) => !existsSync(join(entry, executable)))
        .join(delimiter)
      const result = spawnSync(
        just,
        [
          ...(process.platform === "win32" ? [] : ["--shell", "/bin/sh"]),
          "hooks-install",
        ],
        {
          cwd: fixture,
          encoding: "utf8",
          env: { ...process.env, PATH: path },
        }
      )
      assert.notEqual(result.status, 0)
      assert.match(result.stdout + result.stderr, /node/)
      assert.equal(
        spawnSync("git", ["config", "--get", "core.hooksPath"], {
          cwd: fixture,
        }).status,
        1
      )
    } finally {
      await rm(fixture, { recursive: true, force: true })
    }
  }
)

test(
  "supply-chain watchlist rejects blocked transitive packages in npm workspaces",
  { platforms: ["api"] },
  async () => {
    const fixture = await mkdtemp(join(tmpdir(), "nextide-ui-watchlist-"))
    const dependency = join(fixture, "packages/app/node_modules/axios")
    try {
      await mkdir(dependency, { recursive: true })
      await writeFile(
        join(fixture, "package.json"),
        JSON.stringify({ private: true, workspaces: ["packages/app"] })
      )
      await writeFile(
        join(fixture, "packages/app/package.json"),
        JSON.stringify({
          name: "watchlist-app",
          version: "1.0.0",
          devDependencies: { axios: "*" },
        })
      )
      await mkdir(join(fixture, "node_modules"))
      await symlink(
        join(fixture, "packages/app"),
        join(fixture, "node_modules/watchlist-app"),
        "junction"
      )
      for (const [version, expected] of [
        ["1.14.0", 0],
        ["1.14.1", 1],
      ] as const) {
        await writeFile(
          join(dependency, "package.json"),
          JSON.stringify({ name: "axios", version })
        )
        const result = spawnSync(
          process.execPath,
          [join(root, "scripts/check-supply-chain.mjs")],
          { cwd: fixture, encoding: "utf8" }
        )
        assert.equal(result.status, expected, result.stdout + result.stderr)
        if (expected === 1) assert.match(result.stderr, /axios@1\.14\.1/)
      }
    } finally {
      await rm(fixture, { recursive: true, force: true })
    }
  }
)

test(
  "lint profiles preserve safety, Hooks, accessibility and workspace export policy",
  { platforms: ["api"] },
  async () => {
    const directories: string[] = []
    try {
      for (const workspace of ["packages/ui", "apps/playground"]) {
        await mkdir(join(root, workspace, ".artifacts"), { recursive: true })
        const directory = await mkdtemp(
          join(root, workspace, ".artifacts/lint-probe-")
        )
        directories.push(directory)
        for (const probe of probes) {
          await writeFile(join(directory, `${probe.name}.tsx`), probe.source)
        }
      }
      for (const profile of ["quality", "correctness"] as const) {
        const args =
          profile === "correctness"
            ? ["--config", ".oxlintrc.correctness.json"]
            : []
        const result = spawnSync(
          process.execPath,
          [
            join(root, "node_modules/vite-plus/bin/vp"),
            "lint",
            ...args,
            "--no-ignore",
            "--deny-warnings",
            "--format",
            "json",
            ...directories.flatMap((directory) =>
              probes.map((probe) => join(directory, `${probe.name}.tsx`))
            ),
          ],
          { cwd: root, encoding: "utf8" }
        )
        assert.equal(result.status, 1, result.stdout + result.stderr)
        const { diagnostics } = JSON.parse(result.stdout) as {
          diagnostics: { filename: string; code: string }[]
        }
        for (const directory of directories) {
          for (const probe of probes) {
            const file = join(directory, `${probe.name}.tsx`)
            const findings = diagnostics.filter(
              (d) => resolve(root, d.filename) === file
            )
            const expected =
              probe.name === "refresh" &&
              directory.includes("playground") &&
              profile === "quality"
                ? 1
                : probe[profile]
            assert.equal(
              findings.length > 0,
              expected === 1,
              `${profile}/${file}: ${JSON.stringify(findings)}`
            )
            if (expected === 1)
              assert(
                findings.some((d) => d.code.includes(probe.rule)),
                JSON.stringify(findings)
              )
          }
        }
      }
    } finally {
      for (const directory of directories) {
        await rm(directory, { recursive: true, force: true })
      }
    }
  }
)
