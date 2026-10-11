import { test } from "e2e"
import assert from "node:assert/strict"
import { spawnSync } from "node:child_process"
import { mkdir, mkdtemp, rm, symlink, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
import probes from "./fixtures/lint-probes.json" with { type: "json" }

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
