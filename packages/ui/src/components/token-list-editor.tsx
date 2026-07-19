import * as React from "react"
import { Plus, X } from "lucide-react"

import { Button } from "@nextide/ui/components/button"
import { Input } from "@nextide/ui/components/input"
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
      <div className="grid grid-cols-[minmax(0,1fr)_2.5rem] gap-2">
        <Input
          value={draft}
          placeholder={placeholder}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault()
              addDraft()
            }
          }}
          className="h-10 bg-nextide-panel dark:bg-nextide-panel"
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
      <div className="flex min-h-8 flex-wrap items-start gap-1.5">
        {tokens.length === 0 ? (
          <span className="text-sm text-muted-foreground">{emptyLabel}</span>
        ) : (
          tokens.map((token) => (
            <span
              key={token}
              className="inline-flex h-7 items-center gap-1 rounded-md border border-nextide-tide/30 bg-nextide-tide/[0.07] pr-1 pl-2 text-xs font-medium text-nextide-tide"
            >
              {token}
              <button
                type="button"
                className="grid size-5 place-items-center rounded-sm text-nextide-tide transition-colors hover:bg-nextide-tide/15"
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
