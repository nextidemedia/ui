import * as React from "react"
import type { NavigationPanelItem } from "./navigation-panel-types.js"

import { useContainedScroll } from "@nextide/ui/hooks/use-contained-scroll"

import type {
  NavigationPanelNavProps,
  NavigationPanelSection,
} from "./navigation-panel-types.js"
function useNavigationMotion({
  sections,
  activeItemId,
  collapsed,
  drawerCollapsed,
  drawerTransitioning,
}: NavigationPanelNavProps) {
  const { ref: navRef, onWheel } = useContainedScroll<HTMLElement>({
    axis: "auto",
  })
  const itemRefs = React.useRef<Record<string, HTMLButtonElement | null>>({})
  const itemRectsRef = React.useRef<Record<string, DOMRect>>({})
  const itemAnimationsRef = React.useRef<Record<string, Animation>>({})
  const railRef = React.useRef<HTMLSpanElement | null>(null)
  const railAnimationRef = React.useRef<Animation | null>(null)
  const compact = collapsed || drawerCollapsed
  const effectiveActiveItemId = getEffectiveNavigationItemId(
    sections,
    activeItemId,
    compact
  )
  const previousCompactRef = React.useRef(compact)
  const { writeOutlineVars, measureOutline } = useOutlineMeasure(
    navRef,
    collapsed
  )
  useItemMotion({
    navRef,
    itemRefs,
    itemRectsRef,
    itemAnimationsRef,
    railRef,
    railAnimationRef,
    previousCompactRef,
    measureOutline,
    compact,
    effectiveActiveItemId,
    sections,
  })
  useActiveOutline({
    navRef,
    itemRefs,
    effectiveActiveItemId,
    drawerTransitioning,
    measureOutline,
    sections,
    writeOutlineVars,
  })
  const setItemRef = (id: string, node: HTMLButtonElement | null) => {
    itemRefs.current[id] = node
  }
  return {
    navRef,
    onWheel,
    setItemRef,
    railRef,
    compact,
    effectiveActiveItemId,
    measureOutline,
  }
}
function useOutlineMeasure(
  navRef: React.RefObject<HTMLElement | null>,
  collapsed: boolean
) {
  const writeOutlineVars = React.useCallback(
    (
      top: number,
      height: number,
      left: number,
      width: number,
      railTop = top + 6,
      railHeight = Math.max(0, height - 12)
    ) => {
      const nav = navRef.current
      if (!nav) return

      nav.style.setProperty("--navigation-outline-top", `${top}px`)
      nav.style.setProperty("--navigation-outline-height", `${height}px`)
      nav.style.setProperty("--navigation-outline-left", `${left}px`)
      nav.style.setProperty("--navigation-outline-width", `${width}px`)
      nav.style.setProperty("--navigation-rail-top", `${railTop}px`)
      nav.style.setProperty("--navigation-rail-height", `${railHeight}px`)
    },
    [navRef]
  )

  const measureOutline = React.useCallback(
    (item: HTMLButtonElement) => {
      const nav = navRef.current
      if (!nav) return

      const itemRect = item.getBoundingClientRect()
      const navRect = nav.getBoundingClientRect()
      const compactOutline = collapsed
      const compactWidth = Math.min(itemRect.width, 44)
      const left = itemRect.left - navRect.left + nav.scrollLeft
      const top = itemRect.top - navRect.top + nav.scrollTop
      const icon = item.querySelector<HTMLElement>(
        "[data-slot='navigation-panel-item-glyph']"
      )
      const iconRect = icon?.getBoundingClientRect()
      const railTop = iconRect
        ? iconRect.top - navRect.top + nav.scrollTop - 2
        : top + 6
      const railHeight = iconRect
        ? iconRect.height + 4
        : Math.max(0, itemRect.height - 12)

      writeOutlineVars(
        top,
        itemRect.height,
        compactOutline ? left + (itemRect.width - compactWidth) / 2 : left,
        compactOutline ? compactWidth : itemRect.width,
        railTop,
        railHeight
      )
    },
    [collapsed, navRef, writeOutlineVars]
  )

  return { writeOutlineVars, measureOutline }
}
type MotionRefs = {
  navRef: React.RefObject<HTMLElement | null>
  itemRefs: React.RefObject<Record<string, HTMLButtonElement | null>>
  itemRectsRef: React.RefObject<Record<string, DOMRect>>
  itemAnimationsRef: React.RefObject<Record<string, Animation>>
  railRef: React.RefObject<HTMLSpanElement | null>
  railAnimationRef: React.RefObject<Animation | null>
  previousCompactRef: React.RefObject<boolean>
  measureOutline: (item: HTMLButtonElement) => void
  compact: boolean
  effectiveActiveItemId: string | undefined
  sections: NavigationPanelSection[]
}
function useItemMotion({
  navRef,
  itemRefs,
  itemRectsRef,
  itemAnimationsRef,
  railRef,
  railAnimationRef,
  previousCompactRef,
  measureOutline,
  compact,
  effectiveActiveItemId,
  sections,
}: MotionRefs) {
  React.useLayoutEffect(() => {
    const nav = navRef.current
    if (!nav) return

    const nextRects: Record<string, DOMRect> = {}
    const visibleItems = getVisibleNavigationPanelItems(sections)
    for (const item of visibleItems) {
      const element = itemRefs.current[item.id]
      if (element) nextRects[item.id] = readNavigationItemMotionRect(element)
    }

    const previousRects = itemRectsRef.current
    const stateChanged = previousCompactRef.current !== compact
    const reducedMotion = prefersReducedMotion()

    for (const animation of Object.values(itemAnimationsRef.current)) {
      animation.cancel()
    }
    itemAnimationsRef.current = {}
    railAnimationRef.current?.cancel()
    railAnimationRef.current = null

    if (stateChanged && !reducedMotion && typeof nav.animate === "function") {
      const styles = window.getComputedStyle(nav)
      const duration = readCssTime(
        styles.getPropertyValue("--nextide-drawer-icon-duration"),
        160
      )
      const activeElement = effectiveActiveItemId
        ? itemRefs.current[effectiveActiveItemId]
        : null
      const previousRailTop = Number.parseFloat(
        nav.style.getPropertyValue("--navigation-rail-top")
      )

      if (activeElement) measureOutline(activeElement)
      const nextRailTop = Number.parseFloat(
        nav.style.getPropertyValue("--navigation-rail-top")
      )

      animateItems(
        { itemRefs, itemAnimationsRef },
        visibleItems,
        previousRects,
        nextRects,
        duration
      )

      animateRail(
        { railRef, railAnimationRef },
        previousRailTop,
        nextRailTop,
        duration
      )
    }

    itemRectsRef.current = nextRects
    previousCompactRef.current = compact

    return () => {
      for (const animation of Object.values(itemAnimationsRef.current)) {
        animation.cancel()
      }
      itemAnimationsRef.current = {}
      railAnimationRef.current?.cancel()
      railAnimationRef.current = null
    }
  }, [
    compact,
    effectiveActiveItemId,
    measureOutline,
    navRef,
    sections,
    itemRefs,
    previousCompactRef,
    railRef,
    itemAnimationsRef,
    itemRectsRef,
    railAnimationRef,
  ])
}
function useActiveOutline({
  navRef,
  itemRefs,
  effectiveActiveItemId,
  drawerTransitioning,
  measureOutline,
  sections,
  writeOutlineVars,
}: Pick<
  MotionRefs,
  | "navRef"
  | "itemRefs"
  | "effectiveActiveItemId"
  | "measureOutline"
  | "sections"
> & {
  drawerTransitioning: boolean
  writeOutlineVars: ReturnType<typeof useOutlineMeasure>["writeOutlineVars"]
}) {
  React.useLayoutEffect(() => {
    const nav = navRef.current
    if (!nav) return

    const activeItem = effectiveActiveItemId
      ? itemRefs.current[effectiveActiveItemId]
      : null
    if (!activeItem) {
      const top =
        Number.parseFloat(
          nav.style.getPropertyValue("--navigation-outline-top")
        ) || 0
      const height =
        Number.parseFloat(
          nav.style.getPropertyValue("--navigation-outline-height")
        ) || 0
      const left =
        Number.parseFloat(
          nav.style.getPropertyValue("--navigation-outline-left")
        ) || 0
      const width =
        Number.parseFloat(
          nav.style.getPropertyValue("--navigation-outline-width")
        ) || 0
      writeOutlineVars(top + height / 2, 0, left + width / 2, 0)
      return
    }

    let frame = 0
    const measureActiveOutline = () => measureOutline(activeItem)
    const scheduleMeasureOutline = () => {
      window.cancelAnimationFrame(frame)
      frame = window.requestAnimationFrame(measureActiveOutline)
    }
    measureActiveOutline()

    const resizeObserver = new ResizeObserver(scheduleMeasureOutline)
    resizeObserver.observe(nav)
    resizeObserver.observe(activeItem)
    nav.addEventListener("scroll", scheduleMeasureOutline)
    window.addEventListener("resize", scheduleMeasureOutline)

    return () => {
      window.cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      nav.removeEventListener("scroll", scheduleMeasureOutline)
      window.removeEventListener("resize", scheduleMeasureOutline)
    }
  }, [
    itemRefs,
    effectiveActiveItemId,
    drawerTransitioning,
    measureOutline,
    navRef,
    sections,
    writeOutlineVars,
  ])
}
function readCssTime(value: string, fallback: number) {
  const parsed = Number.parseFloat(value)
  if (!Number.isFinite(parsed)) return fallback
  return value.trim().endsWith("s") && !value.trim().endsWith("ms")
    ? parsed * 1000
    : parsed
}

function readNavigationItemMotionRect(item: HTMLButtonElement) {
  return (
    item
      .querySelector<HTMLElement>("[data-slot='navigation-panel-item-icon']")
      ?.getBoundingClientRect() ?? item.getBoundingClientRect()
  )
}

function getVisibleNavigationPanelItems(sections: NavigationPanelSection[]) {
  return sections.flatMap((section) =>
    section.items.flatMap((item) => [
      item,
      ...(item.expanded ? (item.children ?? []) : []),
    ])
  )
}

function getEffectiveNavigationItemId(
  sections: NavigationPanelSection[],
  activeItemId: string | undefined,
  compact: boolean
) {
  if (!activeItemId) return activeItemId

  const parent = sections
    .flatMap((section) => section.items)
    .find((item) => item.children?.some((child) => child.id === activeItemId))

  return parent && (compact || !parent.expanded) ? parent.id : activeItemId
}

export { useNavigationMotion }

function animateItems(
  {
    itemRefs,
    itemAnimationsRef,
  }: Pick<MotionRefs, "itemRefs" | "itemAnimationsRef">,
  visibleItems: NavigationPanelItem[],
  previousRects: Record<string, DOMRect>,
  nextRects: Record<string, DOMRect>,
  duration: number
) {
  for (const item of visibleItems) {
    const element = itemRefs.current[item.id]
    const previousRect = previousRects[item.id]
    const nextRect = nextRects[item.id]
    if (!element || !previousRect || !nextRect) continue

    const deltaY = previousRect.top - nextRect.top
    if (Math.abs(deltaY) < 0.5) continue

    const animation = element.animate(
      [
        { transform: `translate3d(0, ${deltaY}px, 0)` },
        { transform: "translate3d(0, 0, 0)" },
      ],
      {
        duration,
        easing: "cubic-bezier(0.25, 1, 0.5, 1)",
      }
    )

    itemAnimationsRef.current[item.id] = animation
    void animation.finished
      .then(() => {
        if (itemAnimationsRef.current[item.id] !== animation) return
        delete itemAnimationsRef.current[item.id]
      })
      .catch(() => undefined)
  }
}

function animateRail(
  {
    railRef,
    railAnimationRef,
  }: Pick<MotionRefs, "railRef" | "railAnimationRef">,
  previousRailTop: number,
  nextRailTop: number,
  duration: number
) {
  if (
    railRef.current &&
    Number.isFinite(previousRailTop) &&
    Number.isFinite(nextRailTop)
  ) {
    const deltaY = previousRailTop - nextRailTop
    if (Math.abs(deltaY) >= 0.5) {
      const animation = railRef.current.animate(
        [
          { transform: `translate3d(0, ${deltaY}px, 0)` },
          { transform: "translate3d(0, 0, 0)" },
        ],
        {
          duration,
          easing: "cubic-bezier(0.25, 1, 0.5, 1)",
        }
      )

      railAnimationRef.current = animation
      void animation.finished
        .then(() => {
          if (railAnimationRef.current === animation) {
            railAnimationRef.current = null
          }
        })
        .catch(() => undefined)
    }
  }
}

function prefersReducedMotion() {
  return (
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false
  )
}
