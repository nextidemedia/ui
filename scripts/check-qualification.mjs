import assert from "node:assert/strict"
import { execFileSync, spawnSync } from "node:child_process"
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { createRequire } from "node:module"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { runInNewContext } from "node:vm"
import test from "node:test"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const workflow = await readFile(join(root, ".github/workflows/ci.yml"), "utf8")
const publish = await readFile(
  join(root, ".github/workflows/publish.yml"),
  "utf8"
)
const recipes = JSON.parse(
  execFileSync("just", ["--dump", "--dump-format", "json"], {
    cwd: root,
    encoding: "utf8",
  })
).recipes
const lintCommands = recipes["lint-correctness"].body.map((line) =>
  line.join("")
)

test("selected groups and release caller fail closed on actual job results", () => {
  const qualityIf = workflow.match(/if: \$\{\{ (.+) \}\}/)[1]
  const releaseIf = publish.match(/if: \$\{\{ (.+) \}\}/)[1]
  const gate = workflow.match(/node <<'NODE'\r?\n([\s\S]+?)\r?\n\s+NODE/)[1]
  for (const profile of ["full", "deploy", "invalid"]) {
    assert.equal(
      runInNewContext(qualityIf, { inputs: { profile } }),
      profile === "full"
    )
    for (const quality of ["success", "failure", "cancelled", "skipped", ""]) {
      for (const correctness of [
        "success",
        "failure",
        "cancelled",
        "skipped",
        "",
      ]) {
        const result = spawnSync(process.execPath, ["-e", gate], {
          env: {
            ...process.env,
            PROFILE: profile,
            SOURCE_SHA: "a".repeat(40),
            QUALITY: quality,
            CORRECTNESS: correctness,
          },
        })
        const passes =
          correctness === "success" &&
          ((profile === "full" && quality === "success") ||
            (profile === "deploy" && quality === "skipped"))
        assert.equal(
          result.status === 0,
          passes,
          `${profile}/${quality}/${correctness}`
        )
      }
    }
  }
  assert.equal(runInNewContext(qualityIf, { inputs: {} }), true)
  for (const qualification of [
    "success",
    "failure",
    "cancelled",
    "skipped",
    "",
  ]) {
    for (const cancelled of [true, false]) {
      assert.equal(
        runInNewContext(releaseIf, {
          cancelled: () => cancelled,
          needs: {
            safety: { result: "success" },
            qualification: { result: qualification },
          },
        }),
        qualification === "success" && !cancelled
      )
    }
  }
})

test("local profiles select existing checks without applying a release", () => {
  for (const profile of ["qualify", "qualify-deploy"]) {
    const result = spawnSync("just", ["--dry-run", profile], {
      cwd: root,
      encoding: "utf8",
    })
    assert.equal(result.status, 0, result.stderr)
    const commands = result.stdout + result.stderr
    assert.equal(
      commands.includes("pnpm run format:check"),
      profile === "qualify"
    )
    assert(commands.includes("pnpm run qualify"))
    assert(commands.includes("pnpm run typecheck"))
    assert(!/npm publish|workflow run|git tag/.test(commands))
  }
  for (const command of lintCommands.slice(0, 2)) {
    assert(workflow.includes(command), "Local and selected-tag lint must agree")
  }
})

test("deploy lint permits cosmetic debt but retains unsafe operations and hooks", async () => {
  const packageRoot = join(root, "packages/ui")
  const require = createRequire(join(packageRoot, "package.json"))
  const eslint = join(
    dirname(require.resolve("eslint/package.json")),
    "bin/eslint.js"
  )
  const oxlint = join(root, "node_modules/oxlint/bin/oxlint")
  const probeRoot = await mkdtemp(join(packageRoot, "src/qualification-probe-"))
  const file = join(probeRoot, "probe.tsx")
  const probes = [
    ["cosmetic", "const unused = 1\nexport const ready = true\n", 0],
    ["unsafe", "export const broken = (globalThis.value?.foo).bar\n", 1],
    [
      "hooks",
      'import { useState } from "react"\nexport function Probe({ enabled }) { if (enabled) useState(0); return null }\n',
      1,
    ],
  ]
  try {
    for (const [name, source, expected] of probes) {
      await writeFile(file, source)
      for (const [binary, command, cwd] of [
        [oxlint, lintCommands[0].replace("pnpm exec oxlint ", ""), root],
        [
          eslint,
          lintCommands[1].replace("pnpm -r exec eslint ", ""),
          packageRoot,
        ],
      ]) {
        const result = spawnSync(
          process.execPath,
          [binary, ...command.split(" "), file],
          {
            cwd,
            encoding: "utf8",
          }
        )
        assert.equal(
          result.status,
          expected,
          `${name}: ${result.stdout}${result.stderr}`
        )
        if (name === "cosmetic") {
          const quality = spawnSync(process.execPath, [binary, file], { cwd })
          assert.equal(
            quality.status,
            1,
            "Full lint must retain unused-variable checks"
          )
        }
      }
    }
  } finally {
    await rm(probeRoot, { recursive: true, force: true })
  }
})
