import * as React from "react"
import { X } from "lucide-react"
import { Dialog as DialogPrimitive } from "radix-ui"

import { cn } from "@nextide/ui/lib/utils"

type SettingsModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: React.ReactNode
  children: React.ReactNode
  description?: React.ReactNode
  kicker?: React.ReactNode
  closeLabel?: string
  className?: string
  overlayClassName?: string
  contentClassName?: string
  bodyClassName?: string
  contentRef?: React.Ref<HTMLDivElement>
}

function SettingsModal({
  open,
  onOpenChange,
  title,
  children,
  bodyClassName,
  className,
  closeLabel = "Close settings",
  contentClassName,
  contentRef,
  description,
  kicker,
  overlayClassName,
}: SettingsModalProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          data-slot="settings-modal-overlay"
          className={cn(
            "fixed inset-0 z-50 bg-black/65 backdrop-blur-xl data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
            overlayClassName
          )}
        />
        <DialogPrimitive.Content
          ref={contentRef}
          data-slot="settings-modal"
          className={cn(
            "fixed top-1/2 left-1/2 z-50 grid max-h-[min(45rem,calc(100vh-2rem))] w-[min(32.5rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 grid-rows-[auto_minmax(0,1fr)] overflow-hidden rounded-xl border border-nextide-line bg-background text-foreground shadow-[0_30px_90px_rgb(0_0_0/0.55)] outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
            className,
            contentClassName
          )}
        >
          <header
            data-slot="settings-modal-header"
            className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 border-b border-nextide-line p-4"
          >
            {kicker ? (
              <span
                data-slot="settings-modal-kicker"
                className="inline-flex min-h-7 items-center rounded-full border border-nextide-tide/35 bg-nextide-tide/10 px-3 text-xs font-bold text-nextide-tide uppercase"
              >
                {kicker}
              </span>
            ) : null}
            <span data-slot="settings-modal-title-stack" className="grid gap-1">
              <DialogPrimitive.Title
                data-slot="settings-modal-title"
                className="text-xl leading-none font-bold"
              >
                {title}
              </DialogPrimitive.Title>
              {description ? (
                <DialogPrimitive.Description
                  data-slot="settings-modal-description"
                  className="text-sm text-muted-foreground"
                >
                  {description}
                </DialogPrimitive.Description>
              ) : null}
            </span>
            <DialogPrimitive.Close
              type="button"
              aria-label={closeLabel}
              data-slot="settings-modal-close"
              className="grid size-9 place-items-center rounded-full border border-nextide-line bg-card/60 text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              <X className="size-4" />
            </DialogPrimitive.Close>
          </header>
          <div
            data-slot="settings-modal-body"
            className={cn("min-h-0 overflow-y-auto p-4", bodyClassName)}
          >
            {children}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

type SettingsModalSectionProps = Omit<React.ComponentProps<"section">, "title"> & {
  title: React.ReactNode
  description?: React.ReactNode
  eyebrow?: React.ReactNode
}

function SettingsModalSection({
  children,
  className,
  description,
  eyebrow,
  title,
  ...props
}: SettingsModalSectionProps) {
  return (
    <section
      data-slot="settings-modal-section"
      className={cn("grid gap-3", className)}
      {...props}
    >
      <header data-slot="settings-modal-section-header" className="grid gap-1">
        {eyebrow ? (
          <span
            data-slot="settings-modal-section-eyebrow"
            className="text-xs font-bold text-nextide-tide uppercase"
          >
            {eyebrow}
          </span>
        ) : null}
        <h3 data-slot="settings-modal-section-title" className="text-base font-bold">
          {title}
        </h3>
        {description ? (
          <p
            data-slot="settings-modal-section-description"
            className="text-sm text-muted-foreground"
          >
            {description}
          </p>
        ) : null}
      </header>
      {children}
    </section>
  )
}

function SettingsProgressAction({
  active = false,
  className,
  disabled,
  icon,
  label,
  onClick,
  progress = 0,
  progressLabel = "Progress",
  stateLabel,
  ...props
}: React.ComponentProps<"button"> & {
  label: React.ReactNode
  active?: boolean
  icon?: React.ReactNode
  progress?: number
  progressLabel?: React.ReactNode
  stateLabel?: React.ReactNode
}) {
  const clampedProgress = Math.max(0, Math.min(100, progress))

  return (
    <div data-slot="settings-progress-action" className="grid gap-2">
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        className={cn(
          "inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-nextide-tide/40 bg-nextide-tide px-3 text-sm font-bold text-black transition-colors hover:bg-nextide-tide/85 disabled:pointer-events-none disabled:border-nextide-line disabled:bg-nextide-panel disabled:text-muted-foreground",
          className
        )}
        {...props}
      >
        {icon ? (
          <span
            data-active={active ? "true" : undefined}
            className="grid place-items-center data-[active=true]:animate-spin"
          >
            {icon}
          </span>
        ) : null}
        {label}
      </button>
      <div
        data-slot="settings-progress"
        className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 pt-3 text-xs font-bold text-muted-foreground uppercase"
      >
        <span>{progressLabel}</span>
        <b>{stateLabel ?? (active ? "Running" : clampedProgress === 100 ? "Done" : "Ready")}</b>
        <span
          aria-hidden="true"
          className="relative col-span-2 h-1.5 overflow-hidden rounded-full bg-nextide-line"
        >
          <i
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-nextide-tide to-nextide-yellow transition-[width] duration-200"
            style={{ width: `${clampedProgress}%` }}
          />
        </span>
      </div>
    </div>
  )
}

export { SettingsModal, SettingsModalSection, SettingsProgressAction }
