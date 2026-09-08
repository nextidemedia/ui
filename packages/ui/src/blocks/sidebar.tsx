import * as React from "react"
import { ChevronLeft } from "lucide-react"

import type { ShellDensity } from "@nextide/ui/blocks/app-shell"
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
  density?: ShellDensity
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
  density = "current",
  onToggle,
  className,
}: SidebarBrandProps) {
  const toggleButton = onToggle ? (
    <SidebarToggleButton
      drawerCollapsed={drawerCollapsed}
      onToggle={onToggle}
    />
  ) : null

  return (
    <header
      data-slot="sidebar-brand"
      data-collapsed={collapsed}
      data-drawer-collapsed={drawerCollapsed}
      data-density={density}
      className={cn(
        "relative z-30 grid w-full items-center overflow-visible transition-[grid-template-columns,gap,min-height,padding] duration-[var(--nextide-drawer-duration)] ease-[var(--nextide-drawer-ease)] motion-reduce:transition-none",
        density === "current"
          ? collapsed
            ? "grid-cols-[4rem_0fr_0fr] gap-x-0 py-1 pr-0 pl-1"
            : "grid-cols-[4rem_minmax(0,1fr)_auto] gap-x-0 py-1 pr-2 pl-1"
          : collapsed
            ? "grid-cols-[2.5rem_0fr_0fr] gap-x-0"
            : "grid-cols-[2.5rem_minmax(0,1fr)_auto] gap-x-2",
        className
      )}
    >
      <SidebarBrandMark density={density} logo={logo} />
      <SidebarBrandText
        brand={brand}
        eyebrow={eyebrow}
        byline={byline}
        bylineLogo={bylineLogo}
        collapsed={collapsed}
        drawerCollapsed={drawerCollapsed}
        drawerTransitioning={drawerTransitioning}
        density={density}
      />
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

function SidebarBrandMark({
  density,
  logo,
}: {
  density: ShellDensity
  logo: React.ReactNode
}) {
  return (
    <span
      className={cn(
        "relative z-30 grid shrink-0 place-items-center overflow-visible transition-[width,height] duration-[var(--nextide-drawer-duration)] ease-[var(--nextide-drawer-ease)] motion-reduce:transition-none",
        density === "current" ? "size-16" : "size-10"
      )}
    >
      <span
        aria-hidden="true"
        data-slot="sidebar-brand-glow"
        className={cn(
          "absolute rounded-xl bg-[radial-gradient(circle,color-mix(in_srgb,var(--nextide-tide)_58%,transparent)_0%,color-mix(in_srgb,var(--nextide-tide)_18%,transparent)_38%,transparent_72%)]",
          density === "current"
            ? "-inset-5 blur-2xl"
            : density === "compact"
              ? "-inset-3 blur-xl"
              : "-inset-2 opacity-70 blur-lg"
        )}
      />
      <span
        className={cn(
          "relative grid size-full place-items-center overflow-hidden border border-nextide-tide/20 bg-background shadow-[inset_0_1px_1px_rgb(255_255_255/0.08),0_0_24px_rgb(30_228_188/0.12)] transition-[border-radius] duration-[var(--nextide-drawer-duration)] ease-[var(--nextide-drawer-ease)] motion-reduce:transition-none",
          density === "current"
            ? "rounded-xl"
            : density === "compact"
              ? "rounded-lg"
              : "rounded-md"
        )}
      >
        {logo ?? (
          <img
            src={defaultLogoUrl}
            alt=""
            draggable={false}
            className={cn(
              "block object-contain",
              density === "current" ? "size-11" : "size-7"
            )}
          />
        )}
      </span>
    </span>
  )
}

type BrandTextProps = Required<
  Pick<
    SidebarBrandProps,
    | "brand"
    | "eyebrow"
    | "byline"
    | "collapsed"
    | "drawerCollapsed"
    | "drawerTransitioning"
    | "density"
  >
> &
  Pick<SidebarBrandProps, "bylineLogo">
function SidebarBrandText({
  brand,
  eyebrow,
  byline,
  bylineLogo,
  collapsed,
  drawerCollapsed,
  drawerTransitioning,
  density,
}: BrandTextProps) {
  const clipBrandText = drawerCollapsed || drawerTransitioning
  const bylineMark = bylineLogo ?? (
    <img
      src={defaultBylineLogoUrl}
      alt={byline}
      draggable={false}
      className={cn(
        "w-auto object-contain object-left",
        density === "current" ? "h-5" : density === "compact" ? "h-4" : "h-3.5"
      )}
    />
  )
  return (
    <span
      data-slot="sidebar-brand-text"
      aria-hidden={collapsed}
      className={cn(
        "relative z-10 min-w-0 whitespace-nowrap transition-[max-width,opacity] duration-[var(--nextide-drawer-duration)] ease-[var(--nextide-drawer-ease)] motion-reduce:transition-none",
        density === "current" ? "-my-3 py-3 pr-3 pl-3" : "py-1 pr-1",
        drawerCollapsed ? "max-w-0 opacity-0" : "max-w-56 opacity-100",
        clipBrandText ? "overflow-hidden" : "overflow-visible"
      )}
    >
      <span
        data-slot="sidebar-brand-text-inner"
        className={cn(
          "grid transition-transform duration-[var(--nextide-drawer-duration)] ease-[var(--nextide-drawer-ease)] motion-reduce:transition-none",
          density === "current" ? "gap-px" : "gap-0",
          drawerCollapsed ? "-translate-x-56" : "translate-x-0"
        )}
      >
        <SidebarBrandCopy
          brand={brand}
          eyebrow={eyebrow}
          density={density}
          bylineMark={bylineMark}
        />
      </span>
    </span>
  )
}

function SidebarBrandCopy({
  brand,
  eyebrow,
  density,
  bylineMark,
}: Pick<BrandTextProps, "brand" | "eyebrow" | "density"> & {
  bylineMark: React.ReactNode
}) {
  const condensed = density !== "current"
  return condensed ? (
    <>
      <strong
        className={cn(
          "truncate font-display font-bold [text-shadow:0_0_1px_rgb(255_255_255/0.72),0_0_12px_rgb(30_228_188/0.24)]",
          density === "compact" ? "text-[20px]/[20px]" : "text-[15px]/[15px]"
        )}
      >
        {brand}
      </strong>
      <small
        className={cn(
          "truncate font-semibold text-nextide-tide uppercase",
          density === "compact"
            ? "text-[11px] leading-4"
            : "text-[10px] leading-3.5"
        )}
      >
        {eyebrow}
      </small>
      <span className="flex items-start gap-1 uppercase">
        <b
          className={cn(
            "font-semibold text-muted-foreground",
            density === "compact" ? "text-[11px]/[16px]" : "text-[10px]/[14px]"
          )}
        >
          By
        </b>
        {/* The wordmark's lowercase cap begins 28% below the image edge. */}
        <span
          className={cn(
            "grid min-w-0 place-items-start overflow-visible pt-[calc(.5lh-.28em)]",
            density === "compact" ? "text-[16px]/[16px]" : "text-[14px]/[14px]"
          )}
        >
          {bylineMark}
        </span>
      </span>
    </>
  ) : (
    <>
      <strong className="font-display text-ui-brand font-bold [text-shadow:0_0_1px_rgb(255_255_255/0.72),0_0_18px_rgb(30_228_188/0.34)]">
        {brand}
      </strong>
      <small className="-mt-1 truncate text-ui-caption font-semibold text-nextide-tide uppercase">
        {eyebrow}
      </small>
      <span className="flex items-center gap-1.5 uppercase">
        <b className="-translate-y-1.5 text-ui-caption font-semibold text-muted-foreground">
          By
        </b>
        <span className="grid h-5 min-w-0 place-items-start overflow-visible">
          {bylineMark}
        </span>
      </span>
    </>
  )
}
