import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

// Font-size tokens declared as `--text-*` in styles/globals.css. Without them,
// tailwind-merge reads `text-ui-*` as a text colour and drops it next to one.
// The packed consumer check fails when this list and the stylesheet drift.
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
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
