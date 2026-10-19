import { useState } from "react"
import { Button } from "@nextide/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@nextide/ui/components/card"
import { SegmentedControl } from "@nextide/ui/components/segmented-control"
import { Surface } from "@nextide/ui/components/surface"
import { cn } from "@nextide/ui/lib/utils"
import { ComponentReference } from "./component-reference"

const options = [
  { id: "a", label: "Option A", detail: "Recommended", tone: undefined },
  {
    id: "b",
    label: "Option B",
    detail: "Gameplay loop",
    tone: "var(--nextide-purple)",
  },
] as const

const looks = [
  { value: "backlight", label: "Backlight" },
  { value: "halo", label: "Halo" },
]

function GlowPreview() {
  const [choice, setChoice] = useState<string>("a")
  const [focused, setFocused] = useState(false)
  const [look, setLook] = useState("backlight")

  return (
    <Card>
      <CardHeader>
        <ComponentReference
          names={[
            "nextide-glow",
            "Surface selectable",
            "nextide-tone-border",
            "nextide-glow-wash",
          ]}
        />
        <CardTitle>Glow states</CardTitle>
        <CardDescription>
          Selection, hover, and focus glow in one tone. Nothing lifts.
        </CardDescription>
      </CardHeader>
      <CardContent
        className="grid gap-4"
        data-nextide-glow={look === "backlight" ? undefined : look}
      >
        <SegmentedControl
          aria-label="Selected look"
          value={look}
          options={looks}
          onValueChange={setLook}
        />
        <fieldset className="grid min-w-0 grid-cols-2 gap-3">
          <legend className="sr-only">Creative option</legend>
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              aria-pressed={choice === option.id}
              onClick={() => setChoice(option.id)}
              style={
                option.tone
                  ? { ["--nextide-glow-tone" as string]: option.tone }
                  : undefined
              }
              className={cn(
                "nextide-glow grid min-h-16 gap-0.5 rounded-lg border border-nextide-line bg-nextide-panel p-3 text-left",
                option.id === "a" && "nextide-tone-border"
              )}
            >
              <span className="text-ui-label font-medium">{option.label}</span>
              <span className="text-ui-caption text-muted-foreground">
                {option.detail}
              </span>
            </button>
          ))}
        </fieldset>
        <Surface
          selectable
          padding="sm"
          data-selected={focused || undefined}
          className="flex items-center justify-between gap-3"
        >
          <span className="text-ui-label">Starforge launch</span>
          <Button
            size="sm"
            variant="outline"
            aria-pressed={focused}
            onClick={() => setFocused(!focused)}
          >
            {focused ? "Unfocus" : "Focus"}
          </Button>
        </Surface>
        <div className="grid min-h-20 place-items-center rounded-lg border border-nextide-line nextide-glow-wash [--nextide-glow-origin:50%_0%]">
          <span className="grid size-10 place-items-center rounded-full bg-nextide-tide text-ui-caption font-medium text-black shadow-glow-overlay">
            Live
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

export { GlowPreview }
