import { cn } from "@nextide/ui/lib/utils"
import { Loader2Icon } from "lucide-react"

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <Loader2Icon
      data-slot="spinner"
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- SVG semantics require an explicit ARIA role; HTML replacement elements cannot contain these graphics.
      role="status"
      aria-label="Loading"
      className={cn("size-4 motion-safe:animate-spin", className)}
      {...props}
    />
  )
}

export { Spinner }
