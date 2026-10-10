import { test } from "e2e"
import assert from "node:assert/strict"
import { execFileSync } from "node:child_process"
import {
  access,
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises"
import { tmpdir } from "node:os"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const packageRoot = join(repoRoot, "packages", "ui")
const npm = process.platform === "win32" ? process.execPath : "npm"
const npmArgs =
  process.platform === "win32"
    ? [
        process.env.npm_execpath ??
          join(
            dirname(process.execPath),
            "node_modules",
            "npm",
            "bin",
            "npm-cli.js"
          ),
      ]
    : []
function run(command: string, args: string[], options: { cwd?: string } = {}) {
  const env = { ...process.env }
  // npm exports user approvals as an environment flag that nested installs reject.
  delete env.npm_config_allow_scripts
  delete env.NPM_CONFIG_ALLOW_SCRIPTS
  execFileSync(command, args, {
    env,
    stdio: "inherit",
    timeout: 120_000,
    ...options,
  })
}

async function prepareConsumer(tempRoot: string, consumerRoot: string) {
  run(
    npm,
    [
      ...npmArgs,
      "pack",
      "--loglevel=error",
      "--access",
      "public",
      "--pack-destination",
      tempRoot,
    ],
    { cwd: packageRoot }
  )
  const tarball = join(
    tempRoot,
    (await readdir(tempRoot)).find((file) => file.endsWith(".tgz")) ?? ""
  )
  await access(tarball)

  const uiPackage = JSON.parse(
    await readFile(join(packageRoot, "package.json"), "utf8")
  )
  await mkdir(consumerRoot)
  await writeFile(
    join(consumerRoot, "package.json"),
    JSON.stringify({
      name: "nextide-ui-isolated-consumer",
      private: true,
      type: "module",
      dependencies: {
        "@nextide/ui": `file:${tarball}`,
        react: uiPackage.devDependencies.react,
        "react-dom": uiPackage.devDependencies["react-dom"],
        tailwindcss: uiPackage.devDependencies.tailwindcss,
      },
      devDependencies: {
        "@types/react": uiPackage.devDependencies["@types/react"],
        "@types/react-dom": uiPackage.devDependencies["@types/react-dom"],
      },
    })
  )
  run(
    npm,
    [
      ...npmArgs,
      "install",
      "--loglevel=error",
      "--ignore-scripts",
      "--no-audit",
      "--no-fund",
      "--package-lock=false",
    ],
    { cwd: consumerRoot }
  )

  const installedRoot = join(consumerRoot, "node_modules", "@nextide", "ui")
  assert.equal((await lstat(installedRoot)).isSymbolicLink(), false)
  const installedPackage = JSON.parse(
    await readFile(join(installedRoot, "package.json"), "utf8")
  )
  assert.equal(JSON.stringify(installedPackage).includes("workspace:"), false)
}

test(
  "packed package installs, resolves public exports and preserves chart and typography regressions",
  { platforms: ["api"], timeout: 180_000 },
  async () => {
    const tempRoot = await mkdtemp(join(tmpdir(), "nextide-ui-consumer-"))
    const consumerRoot = join(tempRoot, "consumer")

    const qualifiedExports = [
      ["@nextide/ui/components/creator-flow-chart", "CreatorFlowChart"],
      ["@nextide/ui/blocks/app-shell", "AppShell"],
      ["@nextide/ui/blocks/navigation-panel", "NavigationPanel"],
      ["@nextide/ui/blocks/campaign-schedule-matrix", "CampaignScheduleMatrix"],
      ["@nextide/ui/blocks/creator-transfer", "CreatorTransfer"],
      ["@nextide/ui/blocks/stream-selector", "StreamSelector"],
      ["@nextide/ui/components/button", "Button"],
      ["@nextide/ui/components/toast", "Toaster"],
      ["@nextide/ui/components/toast", "toast"],
      ["@nextide/ui/components/currency-input", "CurrencyInput"],
      ["@nextide/ui/components/segmented-control", "SegmentedControl"],
      ["@nextide/ui/components/signal-ridge-chart", "SignalRidgeChart"],
      ["@nextide/ui/components/line-item-graph", "LineItemGraph"],
      ["@nextide/ui/components/duration-picker", "DurationPicker"],
      ["@nextide/ui/hooks/use-contained-scroll", "useContainedScroll"],
      ["@nextide/ui/lib/format-number", "formatCompactNumber"],
      ["@nextide/ui/lib/utils", "cn"],
    ]

    try {
      await prepareConsumer(tempRoot, consumerRoot)
      await writeFile(
        join(consumerRoot, "consumer.ts"),
        [
          ...qualifiedExports.map(
            ([path, name]) => `import { ${name} } from "${path}"`
          ),
          `void [${qualifiedExports.map(([, name]) => name).join(", ")}]`,
        ].join("\n")
      )
      run(
        process.execPath,
        [
          join(repoRoot, "node_modules", "typescript", "bin", "tsc"),
          "--noEmit",
          "--module",
          "NodeNext",
          "--moduleResolution",
          "NodeNext",
          "--target",
          "ES2022",
          "--skipLibCheck",
          "consumer.ts",
        ],
        { cwd: consumerRoot }
      )

      await writeFile(
        join(consumerRoot, "consumer.mjs"),
        await readFile(
          join(repoRoot, "tests/fixtures/packed-regressions.mjs"),
          "utf8"
        )
      )
      run(
        process.execPath,
        ["consumer.mjs", JSON.stringify(qualifiedExports)],
        { cwd: consumerRoot }
      )
    } finally {
      await rm(tempRoot, { recursive: true, force: true })
    }
  }
)
