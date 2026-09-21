import * as React from "react"
import { ScheduleCreatorRow } from "./campaign-schedule-matrix-views.js"
import type { CampaignScheduleCreator } from "./campaign-schedule-matrix-model.js"

type RowProps = Omit<React.ComponentProps<typeof ScheduleCreatorRow>, "creator">
type Row = {
  creator: CampaignScheduleCreator
  props: RowProps
  exiting: boolean
  top?: number
}
function ScheduleRows({
  creators,
  minimumRows,
  ...rowProps
}: RowProps & { creators: CampaignScheduleCreator[]; minimumRows: number }) {
  const [previous, setPrevious] = React.useState(creators)
  const [rows, setRows] = React.useState<Row[]>(() =>
    creators.map((creator) => ({ creator, props: rowProps, exiting: false }))
  )
  if (previous !== creators) {
    setPrevious(creators)
    setRows((current) => [
      ...creators.map((creator) => ({
        creator,
        props: rowProps,
        exiting: false,
      })),
      ...current
        .filter(
          (row) => !creators.some((creator) => creator.id === row.creator.id)
        )
        .map((row) => ({
          ...row,
          exiting: true,
          top: current.indexOf(row) * 64,
        })),
    ])
  }
  const refs = React.useRef(new Map<string, HTMLDivElement>())
  const rootRef = React.useRef<HTMLDivElement>(null)
  useRowMotion(rows, refs, setRows, rootRef, minimumRows)
  return (
    <div
      ref={rootRef}
      className="relative col-span-2 grid grid-cols-subgrid content-start"
      style={{ minHeight: minimumRows * 64 }}
    >
      {rows.map((row) => (
        <div
          key={row.creator.id}
          ref={(node) => {
            if (node) refs.current.set(row.creator.id, node)
            else refs.current.delete(row.creator.id)
          }}
          inert={row.exiting || undefined}
          aria-hidden={row.exiting || undefined}
          data-slot="campaign-schedule-creator-row"
          data-exiting={row.exiting || undefined}
          className="relative z-10 col-span-2 grid h-16 grid-cols-subgrid"
          style={
            row.exiting
              ? {
                  overflow: "hidden",
                  position: "absolute",
                  top: row.top,
                  left: 0,
                  right: 0,
                }
              : undefined
          }
        >
          <ScheduleCreatorRow
            creator={row.creator}
            {...(row.exiting ? row.props : rowProps)}
          />
        </div>
      ))}
      {Array.from(
        { length: Math.max(0, minimumRows - creators.length) },
        (_, index) => (
          <div
            key={index}
            data-placeholder="true"
            data-slot="campaign-schedule-board-row"
            aria-hidden="true"
            className="absolute right-0 left-0 grid h-16 cursor-grab grid-cols-[160px_minmax(0,1fr)] border-b border-nextide-line/70"
            style={{ top: (creators.length + index) * 64 }}
          >
            <div className="border-r border-nextide-line bg-nextide-panel" />
          </div>
        )
      )}
    </div>
  )
}
function useRowMotion(
  rows: Row[],
  refs: React.RefObject<Map<string, HTMLDivElement>>,
  setRows: React.Dispatch<React.SetStateAction<Row[]>>,
  rootRef: React.RefObject<HTMLDivElement | null>,
  minimumRows: number
) {
  const positions = React.useRef(new Map<string, number>())
  const mounted = React.useRef(false)
  const height = React.useRef<number | null>(null)
  React.useLayoutEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
    const animations: Animation[] = []
    const next = new Map<string, number>()
    for (const row of rows) {
      const node = refs.current.get(row.creator.id)
      if (!node) continue
      const top = node.offsetTop
      const prior = positions.current.get(row.creator.id)
      next.set(row.creator.id, top)
      if (reduced || !mounted.current) continue
      const frames = rowFrames(row, prior, top)
      animations.push(
        node.animate(frames, {
          duration: 240,
          easing: "cubic-bezier(0.22,1,0.36,1)",
          fill: "both",
        })
      )
    }
    const nextHeight =
      Math.max(minimumRows, rows.filter((row) => !row.exiting).length) * 64
    if (
      !reduced &&
      height.current !== null &&
      height.current !== nextHeight &&
      rootRef.current
    ) {
      animations.push(
        rootRef.current.animate(
          [{ height: `${height.current}px` }, { height: `${nextHeight}px` }],
          { duration: 240, easing: "ease-out" }
        )
      )
    }
    height.current = nextHeight
    positions.current = next
    mounted.current = true
    const timer = rows.some((row) => row.exiting)
      ? window.setTimeout(
          () => setRows((current) => current.filter((row) => !row.exiting)),
          reduced ? 0 : 240
        )
      : undefined
    return () => {
      animations.forEach((animation) => animation.cancel())
      window.clearTimeout(timer)
    }
  }, [rows, refs, setRows, rootRef, minimumRows])
}
function rowFrames(row: Row, prior: number | undefined, top: number) {
  return row.exiting
    ? [
        { height: "64px", opacity: 1 },
        { height: "0px", opacity: 0 },
      ]
    : prior === undefined
      ? [
          { height: "0px", opacity: 0 },
          { height: "64px", opacity: 1 },
        ]
      : [
          { transform: `translateY(${prior - top}px)` },
          { transform: "translateY(0)" },
        ]
}
export { ScheduleRows }
