import * as React from "react"
import { Layers3, Plus, Sparkles, X } from "lucide-react"

import { Button } from "@nextide/ui/components/button"
import { useContainedScroll } from "@nextide/ui/hooks/use-contained-scroll"
import { cn } from "@nextide/ui/lib/utils"

type ReportContextBucket = {
  id: string
  label: React.ReactNode
  required?: boolean
  selected: string[]
  suggestions: string[]
}

function ReportContextBuilder({
  buckets,
  onBucketsChange,
  className,
  ...props
}: React.ComponentProps<"section"> & {
  buckets: ReportContextBucket[]
  onBucketsChange: (buckets: ReportContextBucket[]) => void
}) {
  const moveToSelected = (bucketId: string, value: string) => {
    onBucketsChange(
      buckets.map((bucket) =>
        bucket.id === bucketId
          ? {
              ...bucket,
              selected: [...bucket.selected, value],
              suggestions: bucket.suggestions.filter((item) => item !== value),
            }
          : bucket
      )
    )
  }

  const moveToSuggestions = (bucketId: string, value: string) => {
    onBucketsChange(
      buckets.map((bucket) => {
        if (bucket.id !== bucketId) return bucket
        if (bucket.required && bucket.selected.length <= 1) return bucket
        return {
          ...bucket,
          selected: bucket.selected.filter((item) => item !== value),
          suggestions: [value, ...bucket.suggestions],
        }
      })
    )
  }

  return (
    <section
      data-slot="report-context-builder"
      className={cn("grid gap-2", className)}
      {...props}
    >
      {buckets.map((bucket) => (
        <ContextBucketRow
          key={bucket.id}
          bucket={bucket}
          onSelect={(value) => moveToSelected(bucket.id, value)}
          onRemove={(value) => moveToSuggestions(bucket.id, value)}
        />
      ))}
    </section>
  )
}

function ContextBucketRow({
  bucket,
  onSelect,
  onRemove,
}: {
  bucket: ReportContextBucket
  onSelect: (value: string) => void
  onRemove: (value: string) => void
}) {
  const { ref: suggestionRef, onWheel: onSuggestionWheel } =
    useContainedScroll<HTMLDivElement>({ axis: "x" })
  const { ref: selectedRef, onWheel: onSelectedWheel } =
    useContainedScroll<HTMLDivElement>({ axis: "x" })

  return (
    <section className="grid gap-3 rounded-lg border border-nextide-line bg-background/20 p-3 md:grid-cols-[10rem_minmax(0,1fr)]">
      <div className="flex items-center gap-2">
        <Layers3 className="size-4 text-nextide-tide" />
        <span className="grid min-w-0 gap-0.5">
          <strong className="truncate text-sm">{bucket.label}</strong>
          <small className="text-xs text-muted-foreground">
            {bucket.required ? "Required" : "Optional"}
          </small>
        </span>
      </div>
      <div className="grid min-w-0 gap-2">
        <div className="relative min-w-0 overflow-hidden">
          <div
            ref={selectedRef}
            onWheel={onSelectedWheel}
            className="nextide-contained-scroll nextide-scrollbar-none flex gap-1.5 overflow-x-auto pb-0.5"
          >
            {bucket.selected.map((item) => (
              <Button
                key={item}
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0 border-nextide-tide/35 bg-nextide-tide/10 text-nextide-tide"
                onClick={() => onRemove(item)}
              >
                {item}
                <X className="size-3.5" />
              </Button>
            ))}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="shrink-0 text-muted-foreground"
            >
              <Plus className="size-3.5" />
              Add
            </Button>
          </div>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-linear-to-r from-transparent to-background/90" />
        </div>
        <div className="relative min-w-0 overflow-hidden">
          <div
            ref={suggestionRef}
            onWheel={onSuggestionWheel}
            className="nextide-contained-scroll nextide-scrollbar-none flex gap-1.5 overflow-x-auto pb-0.5"
          >
            <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-bold text-nextide-purple">
              <Sparkles className="size-3.5" />
              AI suggestions
            </span>
            {bucket.suggestions.map((item) => (
              <Button
                key={item}
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0"
                onClick={() => onSelect(item)}
              >
                {item}
                <Plus className="size-3.5" />
              </Button>
            ))}
          </div>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-14 bg-linear-to-r from-transparent via-background/65 to-background/95" />
        </div>
      </div>
    </section>
  )
}

export { ReportContextBuilder, type ReportContextBucket }
