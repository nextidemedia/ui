"use client"

import { Toast as ToastPrimitive } from "@base-ui/react/toast"
import { CircleCheck, Info, TriangleAlert, X } from "lucide-react"
import { Button } from "@nextide/ui/components/button"

type ToastTone = "success" | "info" | "warning"
type ToastMessage = {
  title: string
  description?: string
  tone?: ToastTone
}

const manager = ToastPrimitive.createToastManager()

function toast({ tone = "info", ...message }: ToastMessage) {
  return manager.add({ ...message, type: tone, priority: "low" })
}

function Toaster() {
  return (
    <ToastPrimitive.Provider toastManager={manager} timeout={4000} limit={3}>
      <ToastPrimitive.Portal>
        <ToastViewport />
      </ToastPrimitive.Portal>
    </ToastPrimitive.Provider>
  )
}

function ToastViewport() {
  const { toasts, update } = ToastPrimitive.useToastManager()
  function setDismissalTimeout(timeout: 0 | 4000) {
    toasts
      .filter((item) => timeout === 0 || item.timeout === 0)
      .forEach((item) => update(item.id, { timeout }))
  }
  return (
    <ToastPrimitive.Viewport
      data-slot="toast-viewport"
      className="pointer-events-none fixed right-[max(1rem,env(safe-area-inset-right))] bottom-[max(1rem,env(safe-area-inset-bottom))] left-[max(1rem,env(safe-area-inset-left))] z-50 sm:left-auto sm:w-sm sm:max-w-[calc(100vw-2rem)]"
      onMouseLeave={(event) => {
        // Base UI 1.8 resumes on either exit even if the other pause is active.
        // Remove this adapter when its viewport preserves overlapping pauses.
        setDismissalTimeout(
          event.currentTarget.contains(document.activeElement) ? 0 : 4000
        )
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setDismissalTimeout(event.currentTarget.matches(":hover") ? 0 : 4000)
        }
      }}
    >
      <ToastList />
    </ToastPrimitive.Viewport>
  )
}

function ToastList() {
  const { toasts } = ToastPrimitive.useToastManager()
  return toasts.map((item) => {
    const Icon =
      item.type === "warning"
        ? TriangleAlert
        : item.type === "success"
          ? CircleCheck
          : Info
    return (
      <ToastPrimitive.Root
        key={item.id}
        toast={item}
        data-slot="toast"
        className="nextide-toast pointer-events-auto rounded-xl border border-nextide-tide/35 bg-nextide-panel p-4 text-foreground shadow-lg outline-none focus-visible:ring-2 focus-visible:ring-ring data-[type=warning]:border-nextide-yellow/40"
      >
        <ToastPrimitive.Content className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3">
          <span
            aria-hidden="true"
            className="mt-0.5 text-nextide-tide [&_svg]:size-4 [[data-type=warning]_&]:text-nextide-yellow"
          >
            <Icon />
          </span>
          <div className="grid min-w-0 gap-1">
            <ToastPrimitive.Title className="text-sm font-medium" />
            <ToastPrimitive.Description className="text-xs text-muted-foreground empty:hidden" />
          </div>
          <ToastPrimitive.Close
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Dismiss notification"
              />
            }
          >
            <X />
          </ToastPrimitive.Close>
        </ToastPrimitive.Content>
      </ToastPrimitive.Root>
    )
  })
}

export { Toaster, toast, type ToastMessage, type ToastTone }
