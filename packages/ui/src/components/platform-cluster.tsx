import * as React from "react"
import { Play, Radio } from "lucide-react"

import { cn } from "@nextide/ui/lib/utils"

type PlatformId = "twitch" | "youtube" | "kick" | "unknown" | (string & {})

const platformLabels: Record<string, string> = {
  twitch: "Twitch",
  youtube: "YouTube",
  kick: "Kick",
  unknown: "Unknown platform",
}

const platformToneClasses: Record<string, string> = {
  twitch: "border-[#9146ff]/40 bg-[#9146ff]/15 text-[#b88cff]",
  youtube: "border-nextide-red/40 bg-nextide-red/15 text-nextide-red",
  kick: "border-nextide-tide/40 bg-nextide-tide/15 text-nextide-tide",
  unknown: "border-nextide-line bg-nextide-panel text-muted-foreground",
}

function PlatformCluster({
  platforms,
  max = 2,
  size = "default",
  className,
  ...props
}: React.ComponentProps<"span"> & {
  platforms: PlatformId[]
  max?: number
  size?: "sm" | "default"
}) {
  const visiblePlatforms =
    platforms.length > 0 ? platforms.slice(0, max) : ["unknown"]

  return (
    <span
      data-slot="platform-cluster"
      className={cn("inline-flex items-center", className)}
      aria-label={visiblePlatforms.map(platformLabel).join(", ")}
      {...props}
    >
      {visiblePlatforms.map((platform, index) => (
        <span
          key={platform}
          title={platformLabel(platform)}
          className={cn(
            "grid shrink-0 place-items-center rounded-full border font-bold shadow-[0_0_14px_rgb(30_228_188/0.08)]",
            size === "sm"
              ? "size-6 text-[0.62rem] [&_svg]:size-3"
              : "size-8 text-[0.72rem] [&_svg]:size-3.5",
            index > 0 && "-ml-2",
            platformToneClasses[platform] ?? platformToneClasses.unknown
          )}
        >
          {platformIcon(platform)}
        </span>
      ))}
    </span>
  )
}

function platformLabel(platform: PlatformId) {
  return platformLabels[platform] ?? platform
}

function platformIcon(platform: PlatformId) {
  if (platform === "youtube") {
    return <Play fill="currentColor" />
  }

  if (platform === "twitch") {
    return "T"
  }

  if (platform === "kick") {
    return "K"
  }

  return <Radio />
}

export { PlatformCluster, type PlatformId }
