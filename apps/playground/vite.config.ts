import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig, type Alias } from "vite"

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  const aliases: Alias[] = [
    { find: "@", replacement: path.resolve(__dirname, "./src") },
  ]

  if (command === "serve") {
    aliases.push(
      {
        find: "@nextide/ui/globals.css",
        replacement: path.resolve(
          __dirname,
          "../../packages/ui/src/styles/globals.css"
        ),
      },
      {
        find: /^@nextide\/ui\/(.*)$/,
        replacement: `${path.resolve(__dirname, "../../packages/ui/src")}/$1`,
      }
    )
  }

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: aliases,
    },
  }
})
