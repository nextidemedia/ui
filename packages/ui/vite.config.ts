import { defineConfig } from "vite-plus"

export default defineConfig({
  pack: {
    entry: ["src/**/*.ts", "src/**/*.tsx"],
    format: ["esm"],
    unbundle: true,
    outExtensions: () => ({ js: ".js", dts: ".d.ts" }),
    report: false,
    dts: true,
    clean: false,
    tsconfig: "tsconfig.build.json",
  },
})
