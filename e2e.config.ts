import { createRequire } from "node:module"
import { dirname, join } from "node:path"
import type { E2EConfig } from "e2e"
import { web } from "@e2e-dev/web"
import { chatgpt } from "e2e/oauth/chatgpt"

const require = createRequire(
  new URL("./apps/playground/package.json", import.meta.url)
)
const record = process.env.UI_E2E_RECORD === "1"
if (!record) process.env.E2E_OAUTH_CREDENTIALS = "{}"
const app = {
  url: "http://127.0.0.1:0",
  identity: "nextide-ui-packed-playground",
  command: {
    executable: process.execPath,
    args: [
      join(dirname(require.resolve("vite/package.json")), "bin/vite.js"),
      "preview",
      "--host",
      "127.0.0.1",
      "--port",
      "{port}",
      "--strictPort",
    ],
    cwd: "apps/playground",
    log: "output/e2e/playground.log",
  },
}

export default {
  tests: "tests/**/*.e2e.ts",
  workers: 1,
  retries: 0,
  cache: { mode: record ? "read-write" : "read-only", strict: !record },
  output: "output/e2e",
  agents: {
    default: {
      model: chatgpt("gpt-6-luna"),
      providerOptions: { openai: { reasoningEffort: "low" } },
    },
  },
  targets: [
    {
      name: "desktop",
      engine: web({ viewport: { width: 1440, height: 900 } }),
      app,
    },
    {
      name: "mobile",
      engine: web({ viewport: { width: 390, height: 844 } }),
      app,
    },
    { name: "package", platform: "api" },
  ],
} satisfies E2EConfig
