import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "@nextide/ui/globals.css"
import "@nextide/ui/display-font.css"
import { App } from "./App.tsx"
import { ThemeProvider } from "@/components/theme-provider.tsx"
import { QualificationPage } from "./qualification-page.tsx"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="nextide-ui-theme">
      {window.location.pathname === "/qualification" ? (
        <QualificationPage />
      ) : (
        <App />
      )}
    </ThemeProvider>
  </StrictMode>
)
