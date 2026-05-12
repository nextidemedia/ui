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
  completedStepIds = [],
  onStepChange,
  className,
  ...props
}: React.ComponentProps<"nav"> & {
  steps: WorkflowStep[]
  activeStepId: string
  completedStepIds?: string[]
  onStepChange?: (step: WorkflowStep) => void
}) {
  const completed = new Set(completedStepIds)

  return (
    <nav
      data-slot="workflow-stepper"
      className={cn(
        "flex [scrollbar-width:none] gap-2 overflow-x-auto rounded-xl border border-nextide-line bg-nextide-panel p-2 [&::-webkit-scrollbar]:hidden",
        className
      )}
      aria-label="Workflow"
      {...props}
    >
      {steps.map((step, index) => {
        const active = step.id === activeStepId
        const done = completed.has(step.id)
        return (
          <button
            key={step.id}
            type="button"
            disabled={step.disabled}
            className={cn(
              "flex min-w-36 items-center gap-2 rounded-lg border p-2 text-left transition-colors",
              "disabled:pointer-events-none disabled:opacity-45",
              active
                ? "border-nextide-tide/60 bg-nextide-tide/10"
                : "border-transparent hover:border-nextide-line hover:bg-nextide-panel-strong"
            )}
            aria-current={active ? "step" : undefined}
            onClick={() => onStepChange?.(step)}
          >
            <span
              className={cn(
                "grid size-7 shrink-0 place-items-center rounded-full border text-xs font-semibold",
                done
                  ? "border-nextide-tide bg-nextide-tide text-black"
                  : "border-nextide-line text-muted-foreground",
                active && !done && "border-nextide-tide text-nextide-tide"
              )}
            >
              {done ? <Check className="size-3.5" /> : index + 1}
            </span>
            <span className="grid min-w-0 gap-0.5">
              <strong className="truncate text-sm leading-none font-medium">
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

export { WorkflowStepper, type WorkflowStep }
