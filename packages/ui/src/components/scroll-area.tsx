"use client"

import { ScrollArea as ScrollAreaPrimitive } from "@base-ui/react/scroll-area"

import { cn } from "@nextide/ui/lib/utils"

function ScrollArea({
  className,
  children,
  viewportProps,
  ...props
}: ScrollAreaPrimitive.Root.Props & {
  viewportProps?: ScrollAreaPrimitive.Viewport.Props
}) {
  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      className={cn("relative min-h-0 min-w-0", className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        data-slot="scroll-area-viewport"
        {...viewportProps}
        className={cn(
          "size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-(length:--nextide-focus-ring-width) focus-visible:ring-ring focus-visible:outline-1",
          viewportProps?.className
        )}
      >
        <ScrollAreaPrimitive.Content
          className="flow-root"
          style={{ minWidth: 0 }}
        >
          {children}
        </ScrollAreaPrimitive.Content>
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  )
}

function ScrollBar({
  className,
  orientation = "vertical",
  keepMounted = true,
  ...props
}: ScrollAreaPrimitive.Scrollbar.Props) {
  return (
    <ScrollAreaPrimitive.Scrollbar
      data-slot="scroll-area-scrollbar"
      data-orientation={orientation}
      orientation={orientation}
      keepMounted={keepMounted}
      className={cn(
        "pointer-events-none flex touch-none p-px opacity-0 transition-opacity duration-150 ease-out select-none motion-reduce:transition-none data-horizontal:h-2.5 data-horizontal:flex-col data-horizontal:border-t data-horizontal:border-t-transparent data-[has-overflow-x]:data-horizontal:pointer-events-auto data-[has-overflow-x]:data-horizontal:opacity-100 data-vertical:h-full data-vertical:w-2.5 data-vertical:border-l data-vertical:border-l-transparent data-[has-overflow-y]:data-vertical:pointer-events-auto data-[has-overflow-y]:data-vertical:opacity-100",
        className
      )}
      {...props}
    >
      <ScrollAreaPrimitive.Thumb
        data-slot="scroll-area-thumb"
        className="relative flex-1 rounded-full bg-nextide-tide/50"
      />
    </ScrollAreaPrimitive.Scrollbar>
  )
}

export { ScrollArea, ScrollBar }
