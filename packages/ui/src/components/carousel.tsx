import {
  Children,
  Fragment,
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
  const [trackIndex, setTrackIndex] = useState(defaultValue)
  const [trackTransitionEnabled, setTrackTransitionEnabled] = useState(true)
  const pendingSnapTrackIndex = useRef<number | null>(null)
  const pendingValueIndex = useRef<number | null>(null)

  useLayoutEffect(() => {
    if (pendingSnapTrackIndex.current !== null) {
      if (value === undefined || value === pendingValueIndex.current) return
    }
    pendingSnapTrackIndex.current = null
    pendingValueIndex.current = null
    setTrackTransitionEnabled(true)
    setTrackIndex(loopEnabled ? index + 1 : index)
  }, [index, loopEnabled, value])

  const context = useMemo<CarouselContextValue>(
    () => ({
      index,
      itemCount,
      loop: loopEnabled,
      setIndex: (nextIndex) => {
        if (itemCount <= 0 || pendingSnapTrackIndex.current !== null) return

        const maxIndex = itemCount - 1
        const normalized = loopEnabled
          ? wrapCarouselIndex(nextIndex, itemCount)
          : clampCarouselIndex(nextIndex, itemCount)
        const wrapsBackward = loopEnabled && nextIndex < 0
        const wrapsForward = loopEnabled && nextIndex > maxIndex

        setTrackTransitionEnabled(true)
        if (wrapsBackward || wrapsForward) {
          pendingSnapTrackIndex.current = normalized + 1
          pendingValueIndex.current = normalized
          setTrackIndex(wrapsForward ? itemCount + 1 : 0)
        } else {
          setTrackIndex(loopEnabled ? normalized + 1 : normalized)
        }

        if (value === undefined) setInternalIndex(normalized)
        onValueChange?.(normalized)
      },
      setItemCount,
      trackIndex,
      trackTransitionEnabled,
      onTrackTransitionEnd: () => {
        const snapTrackIndex = pendingSnapTrackIndex.current
        if (snapTrackIndex === null) return

        pendingSnapTrackIndex.current = null
        pendingValueIndex.current = null
        setTrackTransitionEnabled(false)
        setTrackIndex(snapTrackIndex)
        window.requestAnimationFrame(() =>
          window.requestAnimationFrame(() => setTrackTransitionEnabled(true))
        )
      },
    }),
    [
      index,
      itemCount,
      loopEnabled,
      onValueChange,
      trackIndex,
      trackTransitionEnabled,
      value,
    ]
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
          ...items.map((item, index) => (
            <Fragment key={`carousel-item-${index}`}>{item}</Fragment>
          )),
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
        "absolute top-1/2 left-3 z-10 -translate-y-1/2 active:not-aria-[haspopup]:-translate-y-1/2",
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
        "absolute top-1/2 right-3 z-10 -translate-y-1/2 active:not-aria-[haspopup]:-translate-y-1/2",
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
