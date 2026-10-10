import lintConfig from "./.oxlintrc.json" with { type: "json" }
import sharedOxlint from "./.nextide/oxlint.json" with { type: "json" }
import { defineConfig } from "vite-plus"
import type { OxlintConfig } from "vite-plus/lint"

export default defineConfig({
  lint: {
    ...(lintConfig as unknown as OxlintConfig),
    extends: [sharedOxlint as OxlintConfig],
    options: { typeAware: false },
  },
})
