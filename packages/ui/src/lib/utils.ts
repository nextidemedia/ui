import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

// Font-size tokens declared as `--text-*` in styles/globals.css. Without them,
// tailwind-merge reads `text-ui-*` as a text colour and drops it next to one.
// The glow shadows from styles/glow.css need the same so they replace other
// shadows instead of merging as shadow colours. The packed consumer check fails
// when these lists and the stylesheets drift.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: [
        "ui-display",
        "ui-brand",
        "ui-headline",
        "ui-title",
        "ui-body",
        "ui-label",
        "ui-caption",
        "ui-micro",
      ],
      shadow: ["glow-hover", "glow-selected", "glow-focus", "glow-overlay"],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
