import { spawnSync } from "node:child_process"
import { appendFileSync, closeSync, mkdirSync, openSync } from "node:fs"
import { fileURLToPath } from "node:url"

const root = fileURLToPath(new URL("../", import.meta.url))
const report = new URL("../.artifacts/deadcode/knip.txt", import.meta.url)
mkdirSync(new URL(".", report), { recursive: true })
const output = openSync(report, "w")
const result = spawnSync(
  process.execPath,
  [
    fileURLToPath(new URL("../node_modules/knip/bin/knip.js", import.meta.url)),
    "--no-exit-code",
  ],
  { cwd: root, stdio: ["ignore", output, output], windowsHide: true }
)
closeSync(output)
if (result.error) appendFileSync(report, `${result.error.message}\n`)
const code = result.status ?? 1
console.log(
  `knip: ${code === 0 ? "reported" : "error"}; .artifacts/deadcode/knip.txt`
)
process.exitCode = code
