import * as React from "react"
import {
  captureRows,
  useTransferMotion,
  useTransferMotionEffects,
  type TransferMotion,
} from "./creator-transfer-motion.js"
import {
  transferMoveMs,
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
  const intendedSelectedIdsRef = React.useRef(selectedIds)
  React.useLayoutEffect(() => {
    if (sameStringArray(intendedSelectedIdsRef.current, selectedIds)) return
    intendedSelectedIdsRef.current = selectedIds
    queue.clearQueuedTransfers()
    motion.clearTransferTimers()
    state.setTransferTarget(null)
    state.setTransferFlyer(null)
    state.setMotionLocked(false)
  })
  const animateTransfer = createTransferCreator(creators, state, motion)
  const transferCreator = (id: string, direction: "add" | "remove") => {
    const creator = state.creatorById.get(id)
    if (!creator || transferDisabled(direction, creator)) return
    const intendedIds = intendedSelectedIdsRef.current
    if (
      direction === "add" ? intendedIds.includes(id) : !intendedIds.includes(id)
    )
      return
    const nextIds =
      direction === "add"
        ? [...intendedIds, id]
        : intendedIds.filter((creatorId) => creatorId !== id)
    intendedSelectedIdsRef.current = nextIds
    if (state.motionLocked) enqueueTransfer(queue, id, direction)
    else animateTransfer(id, direction)
    onSelectedIdsChange(nextIds)
  }
  useQueuedTransfers(queue, state.motionLocked, animateTransfer)
  useSelectedCreatorsSync(state, queue, creators, selectedIds)
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
  queue: TransferQueue,
  creators: CreatorTransferItem[],
  selectedIds: string[]
) {
  const { motionLocked, creatorIds, setAddedIds, setAvailableIds } = state
  React.useEffect(() => {
    if (motionLocked || queue.queuedTransfersRef.current.length) return

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
    queue.queueVersion,
    queue.queuedTransfersRef,
    selectedIds,
    setAddedIds,
    setAvailableIds,
  ])
}
function useTransferQueue() {
  const queuedTransfersRef = React.useRef<CreatorTransferRequest[]>([])
  const clearQueuedTransfers = React.useCallback(() => {
    queuedTransfersRef.current.length = 0
  }, [])
  const [queueVersion, setQueueVersion] = React.useState(0)
  const transferCreatorRef = React.useRef<
    (id: string, direction: "add" | "remove") => void
  >(() => undefined)
  return {
    queuedTransfersRef,
    clearQueuedTransfers,
    queueVersion,
    setQueueVersion,
    transferCreatorRef,
  }
}
type TransferQueue = ReturnType<typeof useTransferQueue>
function useQueuedTransfers(
  queue: TransferQueue,
  motionLocked: boolean,
  animateTransfer: (id: string, direction: "add" | "remove") => void
) {
  const {
    queuedTransfersRef,
    queueVersion,
    setQueueVersion,
    transferCreatorRef,
  } = queue
  React.useEffect(() => {
    transferCreatorRef.current = animateTransfer
  })

  React.useEffect(() => {
    if (motionLocked || queuedTransfersRef.current.length === 0) return

    const nextTransfer = queuedTransfersRef.current[0]
    if (!nextTransfer) return

    const frame = window.requestAnimationFrame(() => {
      if (queuedTransfersRef.current[0] !== nextTransfer) return
      queuedTransfersRef.current.shift()
      transferCreatorRef.current(nextTransfer.id, nextTransfer.direction)
      setQueueVersion((version) => version + 1)
    })

    return () => window.cancelAnimationFrame(frame)
  }, [
    motionLocked,
    queueVersion,
    queuedTransfersRef,
    setQueueVersion,
    transferCreatorRef,
  ])
}
function createTransferCreator(
  creators: CreatorTransferItem[],
  state: TransferState,
  motion: TransferMotion
) {
  const {
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
    addedReflowRef,
    addedRefs,
    availableReflowRef,
    availableRefs,
    queueTransferTimer,
  } = motion
  return (id: string, direction: "add" | "remove") => {
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
            id,
            nextAvailableIds,
            nextAddedIds,
            source,
            state,
            motion
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

  if (document.activeElement === sourceRow)
    sourceRow
      .closest("section")
      ?.querySelector("input")
      ?.focus({ preventScroll: true })
  revealTransferRow(sourceRow)
  revealTransferRow(targetRow)
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
  id: string,
  nextAvailableIds: string[],
  nextAddedIds: string[],
  collapseSide: CreatorTransferSide,
  state: TransferState,
  motion: TransferMotion
) {
  const { availableReflowRef, availableRefs, addedReflowRef, addedRefs } =
    motion
  const {
    visibleAvailableIds,
    setAvailableIds,
    visibleAddedIds,
    setAddedIds,
    setTransferTarget,
    setTransferFlyer,
    setMotionLocked,
  } = state

  if (collapseSide === "available") {
    availableReflowRef.current = captureRows(visibleAvailableIds, availableRefs)
    setAvailableIds(nextAvailableIds)
  } else {
    addedReflowRef.current = captureRows(visibleAddedIds, addedRefs)
    setAddedIds(nextAddedIds)
  }

  const sourceRefs = collapseSide === "available" ? availableRefs : addedRefs
  const activeRow = document.activeElement
  if (sourceRefs.current[id] === activeRow) {
    activeRow
      ?.closest("section")
      ?.querySelector("input")
      ?.focus({ preventScroll: true })
  }
  setTransferTarget(null)
  setTransferFlyer(null)
  setMotionLocked(false)
}

function filterCreatorIds(
  ids: string[],
  creators: Map<string, CreatorTransferItem>,
  query: string
) {
  const terms = searchWords(query)
  if (!terms.length) return ids
  return ids.filter((id) => {
    const creator = creators.get(id)
    if (!creator) return false
    const text = searchWords(`${creator.name} ${creator.searchText ?? ""}`)
    return terms.every((term) =>
      text.some(
        (word) =>
          word.includes(term) || (term.length >= 4 && oneSearchTypo(term, word))
      )
    )
  })
}

function searchWords(value: string) {
  return (
    value
      .normalize("NFKD")
      .replace(/\p{M}/gu, "")
      .toLowerCase()
      .match(/[\p{L}\p{N}]+/gu) ?? []
  )
}

function oneSearchTypo(left: string, right: string) {
  if (Math.abs(left.length - right.length) > 1) return false
  let leftIndex = 0
  let rightIndex = 0
  let edits = 0
  while (leftIndex < left.length && rightIndex < right.length) {
    if (left[leftIndex] === right[rightIndex]) {
      leftIndex += 1
      rightIndex += 1
      continue
    }
    if (++edits > 1) return false
    if (left.length === right.length) {
      if (
        left[leftIndex] === right[rightIndex + 1] &&
        left[leftIndex + 1] === right[rightIndex]
      ) {
        leftIndex += 2
        rightIndex += 2
      } else {
        leftIndex += 1
        rightIndex += 1
      }
    } else if (left.length > right.length) leftIndex += 1
    else rightIndex += 1
  }
  return (
    edits + Number(leftIndex < left.length || rightIndex < right.length) <= 1
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

function revealTransferRow(row: HTMLButtonElement) {
  const list = row.closest('[data-slot="creator-transfer-list"]')
  if (!list) return
  const rowBox = row.getBoundingClientRect()
  const listBox = list.getBoundingClientRect()
  if (rowBox.top < listBox.top) list.scrollTop -= listBox.top - rowBox.top
  if (rowBox.bottom > listBox.bottom)
    list.scrollTop += rowBox.bottom - listBox.bottom
}

function transferDisabled(
  direction: "add" | "remove",
  creator: CreatorTransferItem | undefined
) {
  return direction === "add" && Boolean(creator?.disabledReason)
}
