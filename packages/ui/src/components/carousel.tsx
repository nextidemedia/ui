import {
  Children,
  createContext,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type CSSProperties,
} from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@nextide/ui/components/button"
import { cn } from "@nextide/ui/lib/utils"

type CarouselContextValue = {
  index: number
  itemCount: number
  loop: boolean
  setIndex: (index: number) => void
  setItemCount: (count: number) => void
  trackIndex: number
  trackTransitionEnabled: boolean
  onTrackTransitionEnd: () => void
}

type CarouselProps = ComponentProps<"div"> & {
  loop?: boolean
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
}

// A looped wrap slides onto a clone slide, then snaps to the matching real
// slide with transitions off for two frames.
type CarouselTrack =
  | { kind: "idle"; index: number }
  | { kind: "wrapping"; index: number; snapTo: number; value: number }
  | { kind: "snapping"; index: number }

const CarouselContext = createContext<CarouselContextValue | null>(null)

function Carousel({
  children,
  className,
  loop = false,
  value,
  defaultValue = 0,
  onValueChange,
  ...props
}: CarouselProps) {
  const [internalIndex, setInternalIndex] = useState(defaultValue)
  const [itemCount, setItemCount] = useState(0)
  const loopEnabled = loop && itemCount > 1
  const index = clampCarouselIndex(value ?? internalIndex, itemCount)
  const trackIndex = loopEnabled ? index + 1 : index
  const [track, setTrack] = useState<CarouselTrack>({
    kind: "idle",
    index: trackIndex,
  })
  const [trackSource, setTrackSource] = useState({ index, loopEnabled, value })
  if (
    trackSource.index !== index ||
    trackSource.loopEnabled !== loopEnabled ||
    trackSource.value !== value
  ) {
    setTrackSource({ index, loopEnabled, value })
    // A wrap in flight keeps going until its own value arrives; any other value wins.
    if (
      track.kind !== "wrapping" ||
      (value !== undefined && value !== track.value)
    )
      setTrack({ kind: "idle", index: trackIndex })
  }

  const context = useMemo<CarouselContextValue>(
    () => ({
      index,
      itemCount,
      loop: loopEnabled,
      setIndex: (nextIndex) => {
        if (itemCount <= 0 || track.kind === "wrapping") return

        const maxIndex = itemCount - 1
        const normalized = loopEnabled
          ? wrapCarouselIndex(nextIndex, itemCount)
          : clampCarouselIndex(nextIndex, itemCount)
        const wrapsBackward = loopEnabled && nextIndex < 0
        const wrapsForward = loopEnabled && nextIndex > maxIndex

        if (wrapsBackward || wrapsForward) {
          setTrack({
            kind: "wrapping",
            index: wrapsForward ? itemCount + 1 : 0,
            snapTo: normalized + 1,
            value: normalized,
          })
        } else {
          setTrack({
            kind: "idle",
            index: loopEnabled ? normalized + 1 : normalized,
          })
        }

        if (value === undefined) setInternalIndex(normalized)
        onValueChange?.(normalized)
      },
      setItemCount,
      trackIndex: track.index,
      trackTransitionEnabled: track.kind !== "snapping",
      onTrackTransitionEnd: () => {
        if (track.kind !== "wrapping") return

        setTrack({ kind: "snapping", index: track.snapTo })
        window.requestAnimationFrame(() =>
          window.requestAnimationFrame(() =>
            setTrack((current) =>
              current.kind === "snapping"
                ? { kind: "idle", index: current.index }
                : current
            )
          )
        )
      },
    }),
    [index, itemCount, loopEnabled, onValueChange, track, value]
  )

  return (
    <CarouselContext.Provider value={context}>
      <div
        aria-roledescription="carousel"
        className={cn("relative min-w-0", className)}
        data-slot="carousel"
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  )
}

function CarouselContent({
  children,
  className,
  onTransitionEnd,
  style,
  viewportClassName,
  ...props
}: ComponentProps<"div"> & { viewportClassName?: string }) {
  const context = useCarousel()
  const items = Children.toArray(children)
  const itemCount = items.length
  const renderedItems =
    context.loop && itemCount > 1
      ? [
          <CarouselLoopClone key="carousel-loop-last">
            {items[itemCount - 1]}
          </CarouselLoopClone>,
          ...items,
          <CarouselLoopClone key="carousel-loop-first">
            {items[0]}
          </CarouselLoopClone>,
        ]
      : items

  useLayoutEffect(() => {
    context.setItemCount(itemCount)
  }, [context, itemCount])

  return (
    <div
      className={cn("overflow-hidden", viewportClassName)}
      data-slot="carousel-viewport"
    >
      <div
        className={cn(
          "flex [transform:translate3d(calc(var(--carousel-index,0)*-100%),0,0)] transition-transform duration-[var(--nextide-motion-layout)] ease-[var(--nextide-ease-in-out-quart)]",
          !context.trackTransitionEnabled && "transition-none",
          className
        )}
        data-slot="carousel-content"
        onTransitionEnd={(event) => {
          if (
            event.currentTarget === event.target &&
            event.propertyName === "transform"
          )
            context.onTrackTransitionEnd()
          onTransitionEnd?.(event)
        }}
        style={
          { ...style, "--carousel-index": context.trackIndex } as CSSProperties
        }
        {...props}
      >
        {renderedItems}
      </div>
    </div>
  )
}

function CarouselLoopClone({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement | null>(null)

  useLayoutEffect(() => {
    ref.current
      ?.querySelectorAll<HTMLElement>("[id]")
      .forEach((element) => element.removeAttribute("id"))
  }, [children])

  return (
    <div ref={ref} aria-hidden="true" inert className="min-w-0 flex-[0_0_100%]">
      {children}
    </div>
  )
}

function CarouselItem({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("min-w-0 flex-[0_0_100%]", className)}
      data-slot="carousel-item"
      {...props}
    />
  )
}

function CarouselPrevious({
  className,
  "aria-label": ariaLabel = "Previous slide",
  disabled,
  onClick,
  ...props
}: ComponentProps<typeof Button>) {
  const context = useCarousel()
  const controlDisabled =
    disabled || context.itemCount <= 1 || (!context.loop && context.index <= 0)

  return (
    <Button
      {...props}
      aria-label={ariaLabel}
      className={cn(
        "absolute top-1/2 left-3 z-10 -translate-y-1/2 bg-background! active:not-aria-[haspopup]:-translate-y-1/2",
        className
      )}
      data-slot="carousel-previous"
      disabled={controlDisabled}
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented) context.setIndex(context.index - 1)
      }}
      type="button"
      variant="outline"
      size="icon-sm"
    >
      <ChevronLeft aria-hidden="true" />
    </Button>
  )
}

function CarouselNext({
  className,
  "aria-label": ariaLabel = "Next slide",
  disabled,
  onClick,
  ...props
}: ComponentProps<typeof Button>) {
  const context = useCarousel()
  const controlDisabled =
    disabled ||
    context.itemCount <= 1 ||
    (!context.loop && context.index >= context.itemCount - 1)

  return (
    <Button
      {...props}
      aria-label={ariaLabel}
      className={cn(
        "absolute top-1/2 right-3 z-10 -translate-y-1/2 bg-background! active:not-aria-[haspopup]:-translate-y-1/2",
        className
      )}
      data-slot="carousel-next"
      disabled={controlDisabled}
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented) context.setIndex(context.index + 1)
      }}
      type="button"
      variant="outline"
      size="icon-sm"
    >
      <ChevronRight aria-hidden="true" />
    </Button>
  )
}

function useCarousel() {
  const context = useContext(CarouselContext)
  if (!context)
    throw new Error("Carousel components must be rendered inside Carousel.")
  return context
}

function clampCarouselIndex(index: number, itemCount: number) {
  return Math.min(Math.max(index, 0), Math.max(itemCount - 1, 0))
}

function wrapCarouselIndex(index: number, itemCount: number) {
  if (itemCount <= 0) return 0
  return ((index % itemCount) + itemCount) % itemCount
}

export {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
}
