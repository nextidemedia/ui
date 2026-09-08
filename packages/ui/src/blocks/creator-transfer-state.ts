import * as React from "react"
import {
  captureRows,
  useTransferMotion,
  useTransferMotionEffects,
  type TransferMotion,
} from "./creator-transfer-motion.js"
import {
  transferMoveMs,
  transferReflowMs,
  transferSpaceMs,
  type CreatorTransferFlyer,
  type CreatorTransferItem,
  type CreatorTransferProps,
  type CreatorTransferRequest,
  type CreatorTransferSide,
  type CreatorTransferTarget,
} from "./creator-transfer-types.js"
function useCreatorTransfer({
  creators,
  selectedIds,
  onSelectedIdsChange,
}: CreatorTransferProps) {
  const state = useTransferState(creators, selectedIds)
  const queue = useTransferQueue()
  const motion = useTransferMotion()
  const transferCreator = createTransferCreator(
    creators,
    onSelectedIdsChange,
    state,
    motion,
    queue
  )
  useQueuedTransfers(queue, state.motionLocked, transferCreator)
  useSelectedCreatorsSync(state, creators, selectedIds)
  useTransferMotionEffects(
    motion,
    state.visibleAvailableIds,
    state.visibleAddedIds,
    state.transferFlyer
  )
  return { ...state, ...motion, transferCreator }
}
function useTransferState(
  creators: CreatorTransferItem[],
  selectedIds: string[]
) {
  const [availableQuery, setAvailableQuery] = React.useState("")
  const [selectedQuery, setSelectedQuery] = React.useState("")
  const [availableIds, setAvailableIds] = React.useReducer(
    creatorIdsReducer,
    { creators, selectedIds },
    ({ creators, selectedIds }) =>
      sortCreatorIds(availableIdsFor(creators, selectedIds), creators)
  )
  const [addedIds, setAddedIds] = React.useReducer(
    creatorIdsReducer,
    selectedIds
  )
  const [motionLocked, setMotionLocked] = React.useState(false)
  const [transferTarget, setTransferTarget] =
    React.useState<CreatorTransferTarget | null>(null)
  const [transferFlyer, setTransferFlyer] =
    React.useState<CreatorTransferFlyer | null>(null)
  const creatorIds = React.useMemo(
    () => new Set(creators.map((creator) => creator.id)),
    [creators]
  )
  const creatorById = React.useMemo(
    () => new Map(creators.map((creator) => [creator.id, creator])),
    [creators]
  )
  const visibleAvailableIds = React.useMemo(
    () => filterCreatorIds(availableIds, creatorById, availableQuery),
    [availableIds, availableQuery, creatorById]
  )
  const visibleAddedIds = React.useMemo(
    () => filterCreatorIds(addedIds, creatorById, selectedQuery),
    [addedIds, creatorById, selectedQuery]
  )

  return {
    availableQuery,
    setAvailableQuery,
    selectedQuery,
    setSelectedQuery,
    availableIds,
    setAvailableIds,
    addedIds,
    setAddedIds,
    motionLocked,
    setMotionLocked,
    transferTarget,
    setTransferTarget,
    transferFlyer,
    setTransferFlyer,
    creatorIds,
    creatorById,
    visibleAvailableIds,
    visibleAddedIds,
  }
}
type TransferState = ReturnType<typeof useTransferState>
function useSelectedCreatorsSync(
  state: TransferState,
  creators: CreatorTransferItem[],
  selectedIds: string[]
) {
  const { motionLocked, creatorIds, setAddedIds, setAvailableIds } = state
  React.useEffect(() => {
    if (motionLocked) return

    const syncTimer = window.setTimeout(() => {
      setAddedIds(selectedIds.filter((id) => creatorIds.has(id)))
      setAvailableIds(
        sortCreatorIds(availableIdsFor(creators, selectedIds), creators)
      )
    }, 0)

    return () => window.clearTimeout(syncTimer)
  }, [
    creatorIds,
    creators,
    motionLocked,
    selectedIds,
    setAddedIds,
    setAvailableIds,
  ])
}
function useTransferQueue() {
  const queuedTransfersRef = React.useRef<CreatorTransferRequest[]>([])
  const [queueVersion, setQueueVersion] = React.useState(0)
  const transferCreatorRef = React.useRef<
    (id: string, direction: "add" | "remove") => void
  >(() => undefined)
  return {
    queuedTransfersRef,
    queueVersion,
    setQueueVersion,
    transferCreatorRef,
  }
}
type TransferQueue = ReturnType<typeof useTransferQueue>
function useQueuedTransfers(
  queue: TransferQueue,
  motionLocked: boolean,
  transferCreator: (id: string, direction: "add" | "remove") => void
) {
  const { queuedTransfersRef, queueVersion, transferCreatorRef } = queue
  React.useEffect(() => {
    transferCreatorRef.current = transferCreator
  })

  React.useEffect(() => {
    if (motionLocked || queuedTransfersRef.current.length === 0) return

    const nextTransfer = queuedTransfersRef.current.shift()
    if (!nextTransfer) return

    const frame = window.requestAnimationFrame(() => {
      transferCreatorRef.current(nextTransfer.id, nextTransfer.direction)
    })

    return () => window.cancelAnimationFrame(frame)
  }, [motionLocked, queueVersion, queuedTransfersRef, transferCreatorRef])
}
function createTransferCreator(
  creators: CreatorTransferItem[],
  onSelectedIdsChange: CreatorTransferProps["onSelectedIdsChange"],
  state: TransferState,
  motion: TransferMotion,
  queue: TransferQueue
) {
  const {
    motionLocked,
    availableIds,
    addedIds,
    setMotionLocked,
    setTransferTarget,
    visibleAddedIds,
    setAddedIds,
    visibleAvailableIds,
    setAvailableIds,
  } = state
  const {
    capturePanelResize,
    addedReflowRef,
    addedRefs,
    availableReflowRef,
    availableRefs,
    queueTransferTimer,
  } = motion
  return (id: string, direction: "add" | "remove") => {
    if (motionLocked) {
      enqueueTransfer(queue, id, direction)
      return
    }

    if (
      (direction === "add" && !availableIds.includes(id)) ||
      (direction === "remove" && !addedIds.includes(id))
    ) {
      return
    }

    const source: CreatorTransferSide =
      direction === "add" ? "available" : "selected"
    const target: CreatorTransferSide =
      direction === "add" ? "selected" : "available"
    const nextAddedIds: string[] =
      direction === "add"
        ? [...addedIds, id]
        : addedIds.filter((creatorId) => creatorId !== id)
    const nextAvailableIds: string[] =
      direction === "add"
        ? availableIds.filter((creatorId) => creatorId !== id)
        : sortCreatorIds([...availableIds, id], creators)

    setMotionLocked(true)
    setTransferTarget({ id, side: target })
    capturePanelResize(
      target,
      target === "available" ? transferReflowMs : transferSpaceMs
    )

    if (target === "selected") {
      addedReflowRef.current = captureRows(visibleAddedIds, addedRefs)
      setAddedIds(nextAddedIds)
    } else {
      availableReflowRef.current = captureRows(
        visibleAvailableIds,
        availableRefs
      )
      setAvailableIds(nextAvailableIds)
    }

    queueTransferTimer(() => {
      const didStart = startFlyer(id, source, target, state, motion)
      queueTransferTimer(
        () => {
          completeTransfer(
            nextAvailableIds,
            nextAddedIds,
            source,
            state,
            motion,
            onSelectedIdsChange
          )
        },
        didStart ? transferMoveMs : 0
      )
    }, transferSpaceMs)
  }
}
function startFlyer(
  id: string,
  source: CreatorTransferSide,
  target: CreatorTransferSide,
  state: TransferState,
  motion: TransferMotion
) {
  const { availableRefs, addedRefs } = motion
  const { setTransferFlyer } = state
  const sourceRow = (source === "available" ? availableRefs : addedRefs)
    .current[id]
  const targetRow = (target === "available" ? availableRefs : addedRefs)
    .current[id]
  if (!sourceRow || !targetRow) return false

  setTransferFlyer({
    id,
    source,
    side: target,
    from: sourceRow.getBoundingClientRect(),
    to: targetRow.getBoundingClientRect(),
  })
  return true
}

function completeTransfer(
  nextAvailableIds: string[],
  nextAddedIds: string[],
  collapseSide: CreatorTransferSide,
  state: TransferState,
  motion: TransferMotion,
  onSelectedIdsChange: CreatorTransferProps["onSelectedIdsChange"]
) {
  const {
    capturePanelResize,
    availableReflowRef,
    availableRefs,
    addedReflowRef,
    addedRefs,
  } = motion
  const {
    visibleAvailableIds,
    setAvailableIds,
    visibleAddedIds,
    setAddedIds,
    setTransferTarget,
    setTransferFlyer,
    setMotionLocked,
  } = state
  capturePanelResize(collapseSide, transferReflowMs)

  if (collapseSide === "available") {
    availableReflowRef.current = captureRows(visibleAvailableIds, availableRefs)
    setAvailableIds(nextAvailableIds)
  } else {
    addedReflowRef.current = captureRows(visibleAddedIds, addedRefs)
    setAddedIds(nextAddedIds)
  }

  setTransferTarget(null)
  setTransferFlyer(null)
  setMotionLocked(false)
  onSelectedIdsChange(nextAddedIds)
}

function filterCreatorIds(
  ids: string[],
  creators: Map<string, CreatorTransferItem>,
  query: string
) {
  const normalizedQuery = query.trim().toLowerCase()
  if (!normalizedQuery) return ids
  return ids.filter((id) =>
    creators.get(id)?.name.toLowerCase().includes(normalizedQuery)
  )
}

function sortCreatorIds(ids: string[], creators: CreatorTransferItem[]) {
  const order = new Map(creators.map((creator, index) => [creator.id, index]))
  const sortedIds = [...ids]
  sortedIds.sort((a, b) => (order.get(a) ?? 0) - (order.get(b) ?? 0))
  return sortedIds
}

function creatorIdsReducer(current: string[], next: string[]) {
  return sameStringArray(current, next) ? current : next
}

function sameStringArray(left: string[], right: string[]) {
  if (left.length !== right.length) return false

  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) return false
  }

  return true
}

function availableIdsFor(
  creators: CreatorTransferItem[],
  selectedIds: string[]
) {
  const selected = new Set(selectedIds)
  const ids: string[] = []

  creators.forEach((creator) => {
    if (!selected.has(creator.id)) {
      ids.push(creator.id)
    }
  })

  return ids
}

export { useCreatorTransfer }

function enqueueTransfer(
  { queuedTransfersRef, setQueueVersion }: TransferQueue,
  id: string,
  direction: "add" | "remove"
) {
  const alreadyQueued = queuedTransfersRef.current.some(
    (request) => request.id === id && request.direction === direction
  )
  if (!alreadyQueued) {
    queuedTransfersRef.current.push({ id, direction })
    setQueueVersion((version) => version + 1)
  }
}
