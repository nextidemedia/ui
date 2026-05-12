import * as React from "react"
import { Check } from "lucide-react"

import { cn } from "@nextide/ui/lib/utils"

type WorkflowStep = {
  id: string
  label: string
  meta?: string
  disabled?: boolean
}

function WorkflowStepper({
  steps,
  activeStepId,
  onStepChange,
  onWheel: onWheelProp,
  className,
  ...props
}: React.ComponentProps<"nav"> & {
  steps: WorkflowStep[]
  activeStepId: string
  onStepChange?: (step: WorkflowStep) => void
}) {
  const activeIndex = steps.findIndex((step) => step.id === activeStepId)
  const stepperRef = React.useRef<HTMLElement | null>(null)
  const stepRefs = React.useRef<Array<HTMLButtonElement | null>>([])

  const onWheel = (event: React.WheelEvent<HTMLElement>) => {
    onWheelProp?.(event)
    if (event.defaultPrevented) {
      return
    }

    const stepper = event.currentTarget
    if (stepper.scrollWidth <= stepper.clientWidth) {
      return
    }

    const deltaModeMultiplier =
      event.deltaMode === 1
        ? 16
        : event.deltaMode === 2
          ? stepper.clientWidth
          : 1
    const dominantDelta =
      Math.abs(event.deltaX) > Math.abs(event.deltaY)
        ? event.deltaX
        : event.deltaY

    stepper.scrollLeft += dominantDelta * deltaModeMultiplier
    event.preventDefault()
    event.stopPropagation()
  }

  React.useLayoutEffect(() => {
    const stepper = stepperRef.current
    if (!stepper) return

    const setOutline = (left: number, width: number) => {
      stepper.style.setProperty("--workflow-outline-left", `${left}px`)
      stepper.style.setProperty("--workflow-outline-width", `${width}px`)
    }

    if (activeIndex < 0) {
      const left =
        Number.parseFloat(
          stepper.style.getPropertyValue("--workflow-outline-left")
        ) || 8
      const width =
        Number.parseFloat(
          stepper.style.getPropertyValue("--workflow-outline-width")
        ) || 0
      setOutline(left + width / 2, 0)
      return
    }

    const activeStepElement = stepRefs.current[activeIndex]
    if (!activeStepElement) return

    let frame = 0
    const measureOutline = () => {
      setOutline(activeStepElement.offsetLeft, activeStepElement.offsetWidth)
    }
    const scheduleMeasureOutline = () => {
      window.cancelAnimationFrame(frame)
      frame = window.requestAnimationFrame(measureOutline)
    }

    measureOutline()
    activeStepElement.scrollIntoView({
      block: "nearest",
      inline: "nearest",
      behavior: "smooth",
    })

    const resizeObserver = new ResizeObserver(scheduleMeasureOutline)
    resizeObserver.observe(stepper)
    resizeObserver.observe(activeStepElement)
    window.addEventListener("resize", scheduleMeasureOutline)

    return () => {
      window.cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      window.removeEventListener("resize", scheduleMeasureOutline)
    }
  }, [activeIndex])

  return (
    <nav
      data-slot="workflow-stepper"
      className={cn(
        "relative flex [scrollbar-width:none] gap-2 overflow-x-auto overscroll-contain rounded-xl border border-nextide-line bg-nextide-panel p-2 [&::-webkit-scrollbar]:hidden",
        activeIndex < 0 && "[--workflow-outline-width:0px]",
        className
      )}
      aria-label="Workflow"
      ref={stepperRef}
      onWheel={onWheel}
      {...props}
    >
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute top-2 bottom-2 z-0 rounded-lg border border-nextide-tide/50 bg-nextide-tide/10 shadow-[inset_0_1px_1px_rgb(30_228_188/0.18),0_0_28px_rgb(30_228_188/0.18)] transition-[left,width,opacity] duration-[520ms] ease-[var(--nextide-ease-in-out-quart)] motion-reduce:transition-none",
          activeIndex < 0 ? "opacity-0" : "opacity-100"
        )}
        style={{
          left: "var(--workflow-outline-left, 0px)",
          width: "var(--workflow-outline-width, 0px)",
        }}
      />
      {steps.map((step, index) => {
        const active = step.id === activeStepId
        const done = activeIndex >= 0 && index < activeIndex
        return (
          <button
            key={step.id}
            type="button"
            disabled={step.disabled}
            ref={(node) => {
              stepRefs.current[index] = node
            }}
            className={cn(
              "relative z-10 flex min-w-36 items-center gap-2 rounded-lg border border-transparent p-2 text-left transition-[color,background-color,border-color] duration-[220ms]",
              "disabled:pointer-events-none disabled:opacity-45",
              active
                ? "text-foreground"
                : "text-muted-foreground hover:bg-nextide-panel-strong hover:text-foreground",
              done && "text-foreground"
            )}
            aria-current={active ? "step" : undefined}
            onClick={() => onStepChange?.(step)}
          >
            <StepNumber value={done ? "check" : index + 1} active={active} />
            <span className="grid min-w-0 gap-0.5">
              <strong className="truncate text-sm leading-none font-bold">
                {step.label}
              </strong>
              {step.meta ? (
                <small className="truncate text-xs text-muted-foreground">
                  {step.meta}
                </small>
              ) : null}
            </span>
          </button>
        )
      })}
    </nav>
  )
}

function StepNumber({
  value,
  active,
}: {
  value: number | "check"
  active?: boolean
}) {
  const previousValue = React.useRef(value)
  const [displayValue, setDisplayValue] = React.useState(value)
  const [flipping, setFlipping] = React.useState(false)
  const targetComplete = value === "check"

  React.useEffect(() => {
    if (previousValue.current === value) return
    previousValue.current = value
    setFlipping(true)
    const swapTimer = window.setTimeout(() => setDisplayValue(value), 180)
    const finishTimer = window.setTimeout(() => setFlipping(false), 380)
    return () => {
      window.clearTimeout(swapTimer)
      window.clearTimeout(finishTimer)
    }
  }, [value])

  return (
    <span
      className={cn(
        "grid size-7 shrink-0 place-items-center rounded-full border text-xs leading-none font-bold transition-[border-color,color,background-color,box-shadow] duration-[220ms] [transform-style:preserve-3d]",
        targetComplete
          ? "border-nextide-tide text-nextide-tide"
          : "border-nextide-line text-muted-foreground",
        active &&
          !targetComplete &&
          "border-nextide-tide bg-nextide-tide/10 text-nextide-tide shadow-[0_0_18px_rgb(30_228_188/0.16)]",
        flipping &&
          "animate-[nextide-step-coin-flip_360ms_var(--nextide-ease-in-out-quart)]"
      )}
    >
      {displayValue === "check" ? <Check className="size-3.5" /> : displayValue}
    </span>
  )
}

export { WorkflowStepper, type WorkflowStep }
