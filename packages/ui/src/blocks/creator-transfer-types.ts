import type * as React from "react"
type CreatorTransferItem = {
  id: string
  name: string
  meta?: React.ReactNode
  avatar?: React.ReactNode
}

type CreatorTransferSide = "available" | "selected"

type CreatorTransferTarget = {
  id: string
  side: CreatorTransferSide
}

type CreatorTransferFlyer = CreatorTransferTarget & {
  source: CreatorTransferSide
  from: DOMRect
  to: DOMRect
}

type CreatorPanelResize = {
  height: number
  duration: number
}

type CreatorTransferRequest = {
  id: string
  direction: "add" | "remove"
}

const transferSpaceMs = 120
const transferMoveMs = 360
const transferReflowMs = 312
const transferEase = "cubic-bezier(0.76, 0, 0.24, 1)"

type CreatorTransferProps = React.ComponentProps<"section"> & {
  creators: CreatorTransferItem[]
  selectedIds: string[]
  onSelectedIdsChange: (ids: string[]) => void
  availableTitle?: React.ReactNode
  selectedTitle?: React.ReactNode
}
export { transferEase, transferMoveMs, transferReflowMs, transferSpaceMs }
export type {
  CreatorPanelResize,
  CreatorTransferFlyer,
  CreatorTransferItem,
  CreatorTransferProps,
  CreatorTransferRequest,
  CreatorTransferSide,
  CreatorTransferTarget,
}
