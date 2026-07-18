import * as React from "react"
import { ChevronLeft } from "lucide-react"

import { Button } from "@nextide/ui/components/button"
import { cn } from "@nextide/ui/lib/utils"

const defaultLogoUrl = new URL(
  "../assets/logos/nextide-mark-white.png",
  import.meta.url
).href
const defaultBylineLogoUrl = new URL(
  "../assets/logos/nextide-wordmark-white.png",
  import.meta.url
).href

type SidebarBrandProps = {
  brand?: string
  eyebrow?: string
  byline?: string
  logo?: React.ReactNode
  bylineLogo?: React.ReactNode
  collapsed?: boolean
  drawerCollapsed?: boolean
  drawerTransitioning?: boolean
  onToggle?: () => void
  className?: string
}

type SidebarToggleButtonProps = {
  drawerCollapsed?: boolean
  onToggle: () => void
  className?: string
}

function SidebarToggleButton({
  drawerCollapsed = false,
  onToggle,
  className,
}: SidebarToggleButtonProps) {
  const handledPointerToggleRef = React.useRef(false)

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      data-slot="sidebar-toggle"
      className={cn(
        "relative z-30 overflow-visible transition-[right,rotate,opacity,color,box-shadow,background-color,border-color] duration-[var(--nextide-drawer-duration)] ease-[var(--nextide-drawer-ease)] before:absolute before:-inset-1 before:content-[''] active:translate-y-0 motion-reduce:transition-none",
        className
      )}
      aria-label={drawerCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      onPointerDown={(event) => {
        if (event.button !== 0) return

        handledPointerToggleRef.current = true
        window.setTimeout(() => {
          handledPointerToggleRef.current = false
        }, 500)
        onToggle()
      }}
      onClick={() => {
        if (handledPointerToggleRef.current) {
          handledPointerToggleRef.current = false
          return
        }

        onToggle()
      }}
    >
      <ChevronLeft
        data-icon="inline-start"
        className={cn(
          "transition-[rotate] duration-[var(--nextide-drawer-duration)] ease-[var(--nextide-drawer-ease)] motion-reduce:transition-none",
          drawerCollapsed && "rotate-180"
        )}
      />
    </Button>
  )
}

function SidebarBrand({
  brand = "Nextide UI",
  eyebrow = "Package",
  byline = "Nextide",
  logo,
  bylineLogo,
  collapsed = false,
  drawerCollapsed = collapsed,
  drawerTransitioning = false,
  onToggle,
  className,
}: SidebarBrandProps) {
  const clipBrandText = drawerCollapsed || drawerTransitioning
  const toggleButton = onToggle ? (
    <SidebarToggleButton
      drawerCollapsed={drawerCollapsed}
      onToggle={onToggle}
    />
  ) : null

  const brandMark = (
    <span className="relative z-30 grid size-16 shrink-0 place-items-center overflow-visible transition-[width,height] duration-[var(--nextide-drawer-duration)] ease-[var(--nextide-drawer-ease)] motion-reduce:transition-none">
      <span
        aria-hidden="true"
        data-slot="sidebar-brand-glow"
        className="absolute -inset-5 rounded-xl bg-[radial-gradient(circle,color-mix(in_srgb,var(--nextide-tide)_58%,transparent)_0%,color-mix(in_srgb,var(--nextide-tide)_18%,transparent)_38%,transparent_72%)] blur-2xl"
      />
      <span className="relative grid size-full place-items-center overflow-hidden rounded-xl border border-nextide-tide/20 bg-background shadow-[inset_0_1px_1px_rgb(255_255_255/0.08),0_0_24px_rgb(30_228_188/0.12)] transition-[border-radius] duration-[var(--nextide-drawer-duration)] ease-[var(--nextide-drawer-ease)] motion-reduce:transition-none">
        {logo ?? (
          <img
            src={defaultLogoUrl}
            alt=""
            draggable={false}
            className="block size-11 object-contain"
          />
        )}
      </span>
    </span>
  )
  const bylineMark = bylineLogo ?? (
    <img
      src={defaultBylineLogoUrl}
      alt={byline}
      draggable={false}
      className="h-5 w-auto object-contain object-left"
    />
  )

  return (
    <header
      data-slot="sidebar-brand"
      data-collapsed={collapsed}
      data-drawer-collapsed={drawerCollapsed}
      className={cn(
        "relative z-30 grid w-full grid-cols-[4rem_minmax(0,1fr)_auto] items-center overflow-visible transition-[grid-template-columns,gap,min-height,padding] duration-[var(--nextide-drawer-duration)] ease-[var(--nextide-drawer-ease)] motion-reduce:transition-none",
        collapsed
          ? "grid-cols-[4rem_0fr_0fr] gap-x-0 py-1 pr-0 pl-1"
          : "gap-x-0 py-1 pr-2 pl-1",
        className
      )}
    >
      {brandMark}
      <span
        data-slot="sidebar-brand-text"
        aria-hidden={collapsed}
        className={cn(
          "relative z-10 -my-3 min-w-0 py-3 pr-3 pl-3 whitespace-nowrap transition-[max-width,opacity] duration-[var(--nextide-drawer-duration)] ease-[var(--nextide-drawer-ease)] motion-reduce:transition-none",
          drawerCollapsed ? "max-w-0 opacity-0" : "max-w-56 opacity-100",
          clipBrandText ? "overflow-hidden" : "overflow-visible"
        )}
      >
        <span
          data-slot="sidebar-brand-text-inner"
          className={cn(
            "grid gap-0.5 transition-transform duration-[var(--nextide-drawer-duration)] ease-[var(--nextide-drawer-ease)] motion-reduce:transition-none",
            drawerCollapsed ? "-translate-x-56" : "translate-x-0"
          )}
        >
          <strong className="font-display text-ui-brand font-bold [text-shadow:0_0_1px_rgb(255_255_255/0.72),0_0_18px_rgb(30_228_188/0.34)]">
            {brand}
          </strong>
          <small className="truncate text-ui-caption font-semibold text-nextide-tide uppercase">
            {eyebrow}
          </small>
          <span className="mt-1 flex items-center gap-1.5 uppercase">
            <b className="text-ui-caption font-semibold text-muted-foreground">
              By
            </b>
            <span className="grid h-5 min-w-0 place-items-start overflow-visible">
              {bylineMark}
            </span>
          </span>
        </span>
      </span>
      {toggleButton}
    </header>
  )
}

export {
  SidebarBrand,
  SidebarToggleButton,
  type SidebarBrandProps,
  type SidebarToggleButtonProps,
}
