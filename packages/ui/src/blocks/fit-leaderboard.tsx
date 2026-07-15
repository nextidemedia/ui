import * as React from "react"
import { Users } from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@nextide/ui/components/avatar"
import { SentimentMeter } from "@nextide/ui/components/sentiment-meter"
import { cn } from "@nextide/ui/lib/utils"

type FitLeaderboardItem = {
  id: string
  name: string
  meta?: React.ReactNode
  avatarSrc?: string
  avatarFallback?: React.ReactNode
  fit?: number
  safety?: number
  sentiment?: number
  sentimentDetail?: React.ReactNode
}

function FitLeaderboard({
  items,
  title = "Best fitting creators",
  identityLabel = "Creator",
  maxScore = 5,
  className,
  ...props
}: Omit<React.ComponentProps<"section">, "title"> & {
  items: readonly FitLeaderboardItem[]
  title?: React.ReactNode
  identityLabel?: React.ReactNode
  maxScore?: number
}) {
  if (items.length === 0) {
    return null
  }

  return (
    <section
      data-slot="fit-leaderboard"
      className={cn(
        "@container grid min-w-0 gap-3 rounded-xl border border-nextide-line bg-nextide-panel p-3 shadow-[inset_0_1px_0_rgb(255_255_255/0.04)]",
        className
      )}
      {...props}
    >
      <header className="flex min-w-0 items-center gap-2 px-1">
        <Users className="size-4 shrink-0 text-nextide-tide" />
        <h3 className="truncate text-base leading-tight font-medium">
          {title}
        </h3>
      </header>
      <div
        className="hidden grid-cols-[minmax(12rem,1fr)_5rem_5rem_minmax(9rem,0.8fr)] items-center gap-3 px-3 text-ui-caption font-medium text-muted-foreground uppercase @xl:grid"
        aria-hidden="true"
      >
        <span>{identityLabel}</span>
        <span className="text-center">Fit</span>
        <span className="text-center">Safety</span>
        <span>Sentiment</span>
      </div>
      <ol className="grid gap-2">
        {items.map((item) => (
          <li
            key={item.id}
            className="grid min-w-0 grid-cols-2 items-center gap-3 rounded-lg border border-nextide-line bg-background/25 p-3 @xl:grid-cols-[minmax(12rem,1fr)_5rem_5rem_minmax(9rem,0.8fr)]"
          >
            <span className="col-span-2 flex min-w-0 items-center gap-3 @xl:col-span-1">
              <Avatar size="lg" className="ring-1 ring-nextide-tide/20">
                {item.avatarSrc ? (
                  <AvatarImage src={item.avatarSrc} alt="" />
                ) : null}
                <AvatarFallback className="bg-nextide-tide/10 font-medium text-nextide-tide">
                  {item.avatarFallback ?? initials(item.name)}
                </AvatarFallback>
              </Avatar>
              <span className="grid min-w-0 gap-0.5">
                <strong className="truncate text-sm leading-tight">
                  {item.name}
                </strong>
                {item.meta ? (
                  <small className="truncate text-xs text-muted-foreground">
                    {item.meta}
                  </small>
                ) : null}
              </span>
            </span>
            <ScorePlate
              label="Fit"
              value={item.fit}
              max={maxScore}
            />
            <ScorePlate
              label="Safety"
              value={item.safety}
              max={maxScore}
            />
            <SentimentMeter
              className="col-span-2 @xl:col-span-1"
              value={item.sentiment}
              detail={item.sentimentDetail}
            />
          </li>
        ))}
      </ol>
    </section>
  )
}

type ScorePlateTone = "success" | "processing" | "warning" | "danger" | "neutral"

const scorePlateClasses: Record<ScorePlateTone, string> = {
  success: "border-nextide-tide/35 [--score-plate:var(--nextide-tide)]",
  processing:
    "border-nextide-purple/35 [--score-plate:var(--nextide-purple)]",
  warning: "border-nextide-yellow/35 [--score-plate:var(--nextide-yellow)]",
  danger: "border-nextide-red/35 [--score-plate:var(--nextide-red)]",
  neutral: "border-nextide-line [--score-plate:var(--muted-foreground)]",
}

function ScorePlate({
  label,
  value,
  max,
}: {
  label: string
  value?: number
  max: number
}) {
  const valid =
    typeof value === "number" && Number.isFinite(value) && max > 0
  const boundedValue = valid ? Math.max(0, Math.min(max, value)) : 0
  const progress = max > 0 ? (boundedValue / max) * 100 : 0
  const tone = scoreTone(value, max)

  return (
    <span
      className={cn(
        "grid min-h-14 w-full min-w-0 content-between gap-2 rounded-lg border bg-background/35 px-2 py-2 text-center shadow-[inset_0_1px_0_rgb(255_255_255/0.04)]",
        scorePlateClasses[tone]
      )}
    >
      <meter
        className="sr-only"
        min={0}
        max={Math.max(max, 1)}
        value={boundedValue}
        aria-label={label}
      />
      <span className="grid gap-0.5 leading-none" aria-hidden="true">
        <strong className="text-sm font-medium tabular-nums">
          {valid ? value : "--"}
        </strong>
        <small className="text-ui-caption font-medium tracking-wide text-muted-foreground uppercase">
          {label}
        </small>
      </span>
      <span className="h-1 overflow-hidden rounded-sm bg-nextide-line">
        <span
          className="block h-full rounded-sm bg-[var(--score-plate)] transition-[width] duration-[var(--nextide-motion-state)]"
          style={{ width: `${progress}%` }}
        />
      </span>
    </span>
  )
}

function scoreTone(value: number | undefined, max: number): ScorePlateTone {
  if (typeof value !== "number" || !Number.isFinite(value) || max <= 0) {
    return "neutral"
  }

  const ratio = (value ?? 0) / max
  if (ratio >= 0.8) return "success"
  if (ratio >= 0.6) return "processing"
  if (ratio >= 0.4) return "warning"
  return "danger"
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

export { FitLeaderboard, type FitLeaderboardItem }
