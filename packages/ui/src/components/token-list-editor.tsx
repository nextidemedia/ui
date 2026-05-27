import * as React from "react"
import { Plus, X } from "lucide-react"

import { Button } from "@nextide/ui/components/button"
import { cn } from "@nextide/ui/lib/utils"

function TokenListEditor({
  tokens,
  placeholder = "Add token",
  emptyLabel = "No tokens configured.",
  onTokensChange,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  tokens: string[]
  placeholder?: string
  emptyLabel?: React.ReactNode
  onTokensChange: (tokens: string[]) => void
}) {
  const [draft, setDraft] = React.useState("")

  const addDraft = React.useCallback(() => {
    const nextToken = draft.trim()
    if (!nextToken || tokens.includes(nextToken)) {
      setDraft("")
      return
    }

    onTokensChange([...tokens, nextToken])
    setDraft("")
  }, [draft, onTokensChange, tokens])

  return (
    <div
      data-slot="token-list-editor"
      className={cn("grid gap-3", className)}
      {...props}
    >
      <div className="flex gap-2">
        <input
          value={draft}
          placeholder={placeholder}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault()
              addDraft()
            }
          }}
          className="h-8 min-w-0 flex-1 rounded-lg border border-nextide-line bg-nextide-panel px-3 text-sm outline-none focus:border-nextide-tide/50 focus:ring-3 focus:ring-nextide-tide/15"
        />
        <Button
          type="button"
          size="icon"
          onClick={addDraft}
          aria-label="Add token"
        >
          <Plus />
        </Button>
      </div>
      <div className="flex min-h-9 flex-wrap gap-2">
        {tokens.length === 0 ? (
          <span className="text-sm text-muted-foreground">{emptyLabel}</span>
        ) : (
          tokens.map((token) => (
            <span
              key={token}
              className="inline-flex items-center gap-1.5 rounded-full border border-nextide-tide/35 bg-nextide-tide/10 py-1 pr-1 pl-2 text-xs font-medium text-nextide-tide"
            >
              {token}
              <button
                type="button"
                className="grid size-5 place-items-center rounded-full text-nextide-tide transition-colors hover:bg-nextide-tide/15"
                aria-label={`Remove ${token}`}
                onClick={() =>
                  onTokensChange(tokens.filter((item) => item !== token))
                }
              >
                <X className="size-3" />
              </button>
            </span>
          ))
        )}
      </div>
    </div>
  )
}

export { TokenListEditor }
