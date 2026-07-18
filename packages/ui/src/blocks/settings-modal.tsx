"use client"

import * as React from "react"
import { X } from "lucide-react"

import { Button } from "@nextide/ui/components/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@nextide/ui/components/dialog"
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        ref={contentRef}
        data-slot="settings-modal"
        showCloseButton={false}
        overlayClassName={overlayClassName}
        className={cn(
          "max-h-[min(45rem,calc(100vh-2rem))] max-w-[32.5rem] grid-rows-[auto_minmax(0,1fr)] gap-0",
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
              className="inline-flex min-h-7 items-center rounded-md border border-nextide-tide/35 bg-nextide-tide/10 px-3 text-xs font-medium text-nextide-tide uppercase"
            >
              {kicker}
            </span>
          ) : null}
          <span data-slot="settings-modal-title-stack" className="grid gap-1">
            <DialogTitle
              data-slot="settings-modal-title"
              className="text-xl leading-none font-medium"
            >
              {title}
            </DialogTitle>
            {description ? (
              <DialogDescription
                data-slot="settings-modal-description"
                className="text-sm text-muted-foreground"
              >
                {description}
              </DialogDescription>
            ) : null}
          </span>
          <DialogClose
            data-slot="settings-modal-close"
            render={
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label={closeLabel}
                className="bg-card/60 text-muted-foreground hover:text-foreground"
              />
            }
          >
            <X aria-hidden="true" />
          </DialogClose>
        </header>
        <div
          data-slot="settings-modal-body"
          className={cn("min-h-0 overflow-y-auto p-4", bodyClassName)}
        >
          {children}
        </div>
      </DialogContent>
    </Dialog>
  )
}

type SettingsModalSectionProps = Omit<
  React.ComponentProps<"section">,
  "title"
> & {
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
            className="text-xs font-medium text-nextide-tide uppercase"
          >
            {eyebrow}
          </span>
        ) : null}
        <h3
          data-slot="settings-modal-section-title"
          className="text-base font-medium"
        >
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

export { SettingsModal, SettingsModalSection }
