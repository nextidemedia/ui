"use client"

import * as React from "react"
import { Users } from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@nextide/ui/components/avatar"
import {
  ScoreRing,
  type ScoreRingTone,
} from "@nextide/ui/components/score-ring"
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
  mentions?: number
}

const compactNumber = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
})

function FitLeaderboard({
  items,
  title = "Best fitting creators",
  identityLabel = "Creator",
  maxScore = 5,
  className,
  ...props
}: Omit<React.ComponentProps<"section">, "title"> & {
  items: FitLeaderboardItem[]
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
        "grid min-w-0 gap-3 rounded-xl border border-nextide-line bg-nextide-panel p-3 shadow-[inset_0_1px_0_rgb(255_255_255/0.04)]",
        className
      )}
      {...props}
    >
      <header className="flex min-w-0 items-center gap-2 px-1">
        <Users className="size-4 shrink-0 text-nextide-tide" />
        <strong className="truncate text-base leading-tight">{title}</strong>
      </header>
      <div
        className="hidden grid-cols-[minmax(12rem,1fr)_4rem_4rem_minmax(9rem,0.8fr)] items-center gap-3 px-3 text-[0.65rem] font-bold text-muted-foreground uppercase sm:grid"
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
            className="grid min-w-0 grid-cols-2 items-center gap-3 rounded-lg border border-nextide-line bg-background/25 p-3 sm:grid-cols-[minmax(12rem,1fr)_4rem_4rem_minmax(9rem,0.8fr)]"
          >
            <span className="col-span-2 flex min-w-0 items-center gap-3 sm:col-span-1">
              <Avatar size="lg" className="ring-1 ring-nextide-tide/20">
                {item.avatarSrc ? (
                  <AvatarImage src={item.avatarSrc} alt="" />
                ) : null}
                <AvatarFallback className="bg-nextide-tide/10 font-bold text-nextide-tide">
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
            <ScoreRing
              className="justify-self-center"
              size="sm"
              label="Fit"
              value={item.fit}
              max={maxScore}
              tone={scoreTone(item.fit, maxScore)}
            />
            <ScoreRing
              className="justify-self-center"
              size="sm"
              label="Safety"
              value={item.safety}
              max={maxScore}
              tone={scoreTone(item.safety, maxScore)}
            />
            <SentimentMeter
              className="col-span-2 sm:col-span-1"
              value={item.sentiment}
              detail={
                item.mentions === undefined
                  ? undefined
                  : `${compactNumber.format(item.mentions)} mentions`
              }
            />
          </li>
        ))}
      </ol>
    </section>
  )
}

function scoreTone(value: number | undefined, max: number): ScoreRingTone {
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
