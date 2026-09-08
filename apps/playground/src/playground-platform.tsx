import { Button } from "@nextide/ui/components/button"
import { Input } from "@nextide/ui/components/input"
import { Notice } from "@nextide/ui/components/notice"
import {
  Surface,
  SurfaceDescription,
  SurfaceHeader,
  SurfaceTitle,
} from "@nextide/ui/components/surface"
import { ArrowRight, FileText, PanelRightClose, Search } from "lucide-react"
import { useState } from "react"
import {
  type PlaygroundViewMode,
  krakenNavigationSections,
} from "./playground-navigation-data"

function KrakenDiscoveryPreview({ activeItemId }: { activeItemId: string }) {
  const [query, setQuery] = useState("")
  const [submittedQuery, setSubmittedQuery] = useState("")
  const activeLabel = krakenNavigationSections
    .flatMap((section) => section.items)
    .find((item) => item.id === activeItemId)?.label

  return (
    <section className="grid min-h-full place-items-center bg-background px-4 py-12 sm:px-10">
      <div className="grid w-full max-w-3xl gap-6">
        <header className="grid gap-3">
          <h1 className="text-4xl font-medium tracking-[-0.035em] text-balance sm:text-6xl">
            {activeLabel ?? "Discovery"}
          </h1>
          <p className="max-w-[65ch] text-ui-body text-muted-foreground">
            Search creators, brands, products, and categories across the Kraken
            intelligence workspace.
          </p>
        </header>

        <form
          className="grid grid-cols-[minmax(0,1fr)_3.5rem] overflow-hidden rounded-lg border border-nextide-line bg-nextide-panel transition-colors focus-within:border-nextide-tide/60"
          onSubmit={(event) => {
            event.preventDefault()
            setSubmittedQuery(query.trim())
          }}
        >
          <label className="grid min-w-0 grid-cols-[3.5rem_minmax(0,1fr)] items-center">
            <span className="grid size-14 place-items-center text-nextide-tide">
              <Search aria-hidden="true" className="size-5" />
            </span>
            <span className="sr-only">Search Kraken</span>
            <Input
              className="h-14 rounded-none border-0 bg-transparent px-0 text-lg focus-visible:ring-0 dark:bg-transparent"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search..."
              value={query}
            />
          </label>
          <Button
            type="submit"
            size="icon-lg"
            className="size-14 rounded-none border-l border-primary-foreground/20"
            aria-label="Search"
          >
            <ArrowRight data-icon="inline-start" />
          </Button>
        </form>

        <div className="flex flex-wrap items-center gap-2 border-t border-nextide-line pt-4">
          {["Applebee's", "Monster", "Starforge"].map((suggestion) => (
            <Button
              key={suggestion}
              type="button"
              variant="ghost"
              size="xs"
              className="border border-nextide-line"
              onClick={() => setQuery(suggestion)}
            >
              {suggestion}
            </Button>
          ))}
          {submittedQuery ? (
            <span
              aria-live="polite"
              className="ml-auto text-ui-caption text-muted-foreground"
            >
              Searching for {submittedQuery}
            </span>
          ) : null}
        </div>
      </div>
    </section>
  )
}

function Inspector({
  density,
  confidence,
  viewMode,
  onHide,
}: {
  density: string
  confidence: number
  viewMode: PlaygroundViewMode
  onHide: () => void
}) {
  return (
    <Surface className="grid gap-4">
      <SurfaceHeader className="grid-cols-[minmax(0,1fr)_auto] items-start">
        <div className="grid gap-1">
          <SurfaceTitle>Inspector</SurfaceTitle>
          <SurfaceDescription>Live playground state.</SurfaceDescription>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Hide inspector"
          title="Hide inspector"
          onClick={onHide}
        >
          <PanelRightClose />
        </Button>
      </SurfaceHeader>
      <div className="grid gap-3 text-sm">
        <InspectorRow label="Package" value="@nextide/ui" />
        <InspectorRow label="View" value={viewMode} />
        <InspectorRow label="Density" value={density} />
        <InspectorRow label="Confidence" value={`${confidence}%`} />
        <InspectorRow label="Consumer" value="apps/playground" />
      </div>
      <Notice title="Import boundary" tone="warning" icon={<FileText />}>
        The playground imports from package exports, not internal relative
        paths.
      </Notice>
    </Surface>
  )
}

function InspectorRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-nextide-line bg-nextide-panel px-3 py-2">
      <span className="text-muted-foreground">{label}</span>
      <strong className="truncate text-right font-medium">{value}</strong>
    </div>
  )
}

export { Inspector, KrakenDiscoveryPreview }
