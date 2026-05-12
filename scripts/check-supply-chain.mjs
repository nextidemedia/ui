import { execSync } from "node:child_process"

const blockedArtifacts = new Map([
  ["axios", new Set(["0.30.4", "1.14.1"])],
  ["plain-crypto-js", new Set(["4.2.1"])],
  ["@cap-js/db-service", new Set(["2.10.1"])],
  ["@cap-js/postgres", new Set(["2.2.2"])],
  ["@cap-js/sqlite", new Set(["2.2.2"])],
  ["mbt", new Set(["1.2.48"])],
  ["intercom-client", new Set(["7.0.4", "7.0.5"])],
  ["@mistralai/mistralai", new Set(["2.2.2", "2.2.3", "2.2.4"])],
  ["@mistralai/mistralai-azure", new Set(["1.7.1", "1.7.2", "1.7.3"])],
  ["@mistralai/mistralai-gcp", new Set(["1.7.1", "1.7.2", "1.7.3"])],
  [
    "@opensearch-project/opensearch",
    new Set(["3.5.3", "3.6.2", "3.7.0", "3.8.0"]),
  ],
])

const blockedPrefixes = [
  "@tanstack/",
  "@squawk/",
  "@tallyui/",
  "@draftauth/",
  "@draftlab/",
  "@ml-toolkit-ts/",
  "@supersurkhet/",
  "@uipath/",
]

const raw = execSync("pnpm list -r --depth Infinity --json", {
  encoding: "utf8",
  stdio: ["ignore", "pipe", "inherit"],
})

const projects = JSON.parse(raw)
const seen = new Map()

for (const project of projects) {
  collect(project.dependencies)
  collect(project.devDependencies)
  collect(project.optionalDependencies)
}

const matches = []

for (const [name, versions] of seen) {
  const blockedVersions = blockedArtifacts.get(name)
  if (blockedVersions) {
    for (const version of versions) {
      if (blockedVersions.has(version)) {
        matches.push(`${name}@${version}`)
      }
    }
  }

  if (blockedPrefixes.some((prefix) => name.startsWith(prefix))) {
    for (const version of versions) {
      matches.push(
        `${name}@${version} (blocked prefix during Mini Shai-Hulud review)`
      )
    }
  }
}

if (matches.length > 0) {
  console.error("Known supply-chain watchlist matches found:")
  for (const match of matches.sort()) {
    console.error(`- ${match}`)
  }
  process.exit(1)
}

console.log(
  `No known Mini Shai-Hulud/TanStack/SAP/Intercom/Axios watchlist matches in ${seen.size} installed packages.`
)

function collect(dependencies) {
  if (!dependencies) return

  for (const [name, dependency] of Object.entries(dependencies)) {
    if (!dependency || typeof dependency !== "object") continue
    if (
      typeof dependency.version === "string" &&
      !dependency.version.startsWith("link:")
    ) {
      const versions = seen.get(name) ?? new Set()
      versions.add(dependency.version)
      seen.set(name, versions)
    }

    collect(dependency.dependencies)
    collect(dependency.devDependencies)
    collect(dependency.optionalDependencies)
  }
}
