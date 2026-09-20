import * as React from "react"

import { useContainedScroll } from "@nextide/ui/hooks/use-contained-scroll"

import type {
  NavigationPanelNavProps,
  NavigationPanelSection,
} from "./navigation-panel-types.js"
function useNavigationMotion({
  sections,
  activeItemId,
  collapsed,
  drawerTransitioning,
}: NavigationPanelNavProps) {
  const { ref: navRef, onWheel } = useContainedScroll<HTMLElement>({
    axis: "auto",
  })
  const itemRefs = React.useRef<Record<string, HTMLButtonElement | null>>({})
  const railRef = React.useRef<HTMLSpanElement | null>(null)
  const compact = collapsed
  const effectiveActiveItemId = getEffectiveNavigationItemId(
    sections,
    activeItemId,
    compact
  )
  const { writeOutlineVars, measureOutline } = useOutlineMeasure(
    navRef,
    collapsed
  )
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
function useActiveOutline({
  navRef,
  itemRefs,
  effectiveActiveItemId,
  drawerTransitioning,
  measureOutline,
  sections,
  writeOutlineVars,
}: {
  navRef: React.RefObject<HTMLElement | null>
  itemRefs: React.RefObject<Record<string, HTMLButtonElement | null>>
  effectiveActiveItemId: string | undefined
  measureOutline: (item: HTMLButtonElement) => void
  sections: NavigationPanelSection[]
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
    const measureActiveOutline = () => {
      measureOutline(activeItem)
      if (drawerTransitioning)
        frame = window.requestAnimationFrame(measureActiveOutline)
    }
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
