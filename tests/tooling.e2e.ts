import { test } from "e2e"
import assert from "node:assert/strict"
import { execFileSync, spawnSync } from "node:child_process"
import { mkdtemp, rm, writeFile } from "node:fs/promises"
import { createRequire } from "node:module"
import { tmpdir } from "node:os"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const recipes = JSON.parse(
  execFileSync("just", ["--dump", "--dump-format", "json"], {
    cwd: root,
    encoding: "utf8",
  })
).recipes
const lintCommands: string[] = recipes["lint-correctness"].body.map(
  (line: string[]) => line.join("")
)
test(
  "deploy lint permits cosmetic debt but rejects unsafe operations and broken hooks",
  { platforms: ["api"] },
  async () => {
    const packageRoot = join(root, "packages/ui")
    const require = createRequire(join(packageRoot, "package.json"))
    const eslint = join(
      dirname(require.resolve("eslint/package.json")),
      "bin/eslint.js"
    )
    const oxlint = join(root, "node_modules/oxlint/bin/oxlint")
    const probeRoot = await mkdtemp(join(tmpdir(), "nextide-ui-qualification-"))
    const file = join(probeRoot, "probe.tsx")
    const probes: [string, string, number][] = [
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
          const inputArgs =
            binary === eslint
              ? [
                  "--stdin",
                  "--stdin-filename",
                  join(packageRoot, "src/probe.tsx"),
                ]
              : ["--config", join(root, ".oxlintrc.json"), file]
          const result = spawnSync(
            process.execPath,
            [binary, ...command.split(" "), ...inputArgs],
            {
              cwd,
              input: source,
              encoding: "utf8",
            }
          )
          assert.equal(
            result.status,
            expected,
            `${name}: ${result.stdout}${result.stderr}`
          )
          if (name === "cosmetic") {
            const quality = spawnSync(
              process.execPath,
              [binary, ...inputArgs],
              {
                cwd,
                input: source,
              }
            )
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
  }
)
