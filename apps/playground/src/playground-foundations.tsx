import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@nextide/ui/components/card"
import { SegmentedControl } from "@nextide/ui/components/segmented-control"
import { Slider } from "@nextide/ui/components/slider"
import { cn } from "@nextide/ui/lib/utils"
import {
  CalendarClock,
  Database,
  RadioTower,
  Search,
  Settings,
  ShieldAlert,
} from "lucide-react"
import { type CSSProperties, useState } from "react"

function FoundationsPreview() {
  return (
    <section className="grid gap-4 2xl:grid-cols-2">
      <TypographyPreview />

      <TypesetWorkbench />

      <ColorPreview />

      <RadiusPreview />

      <MotionPreview />

      <IconographyPreview />
    </section>
  )
}

type TypesetPreset = "compact" | "editorial" | "report"

const typesetPresets: Record<
  TypesetPreset,
  { size: number; leading: number; flow: number }
> = {
  compact: { size: 14, leading: 1.55, flow: 0.9 },
  editorial: { size: 16, leading: 1.7, flow: 1.25 },
  report: { size: 17, leading: 1.75, flow: 1.45 },
}

function TypesetWorkbench() {
  const [preset, setPreset] = useState<TypesetPreset>("editorial")
  const [settings, setSettings] = useState(typesetPresets.editorial)
  const updateSetting = (
    key: keyof (typeof typesetPresets)[TypesetPreset],
    value: number | readonly number[]
  ) => {
    const nextValue = Array.isArray(value) ? value[0] : value
    setSettings((current) => ({ ...current, [key]: nextValue }))
  }
  const applyPreset = (nextPreset: string) => {
    const resolvedPreset = nextPreset as TypesetPreset
    setPreset(resolvedPreset)
    setSettings(typesetPresets[resolvedPreset])
  }

  return (
    <Card className="2xl:col-span-2">
      <CardHeader>
        <CardTitle>Typeset workbench</CardTitle>
        <CardDescription>
          Tune shadcn Typeset rhythm against real report content. These three
          variables are the shared contract; product screens own the words.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5 xl:grid-cols-[18rem_minmax(0,1fr)]">
        <div className="grid content-start gap-5 self-start rounded-lg border border-nextide-line bg-background/20 p-4">
          <SegmentedControl
            value={preset}
            options={[
              { value: "compact", label: "Compact" },
              { value: "editorial", label: "Editorial" },
              { value: "report", label: "Report" },
            ]}
            onValueChange={applyPreset}
            aria-label="Typeset preset"
          />
          <TypesetControl
            label="Size"
            value={`${settings.size}px`}
            min={13}
            max={19}
            step={1}
            sliderValue={settings.size}
            onValueChange={(value) => updateSetting("size", value)}
          />
          <TypesetControl
            label="Leading"
            value={settings.leading.toFixed(2)}
            min={1.4}
            max={1.9}
            step={0.05}
            sliderValue={settings.leading}
            onValueChange={(value) => updateSetting("leading", value)}
          />
          <TypesetControl
            label="Flow"
            value={`${settings.flow.toFixed(2)}em`}
            min={0.75}
            max={1.75}
            step={0.05}
            sliderValue={settings.flow}
            onValueChange={(value) => updateSetting("flow", value)}
          />
        </div>
        <article
          className="typeset min-w-0 rounded-lg border border-nextide-line bg-nextide-panel p-5 sm:p-6"
          style={
            {
              "--typeset-size": `${settings.size}px`,
              "--typeset-leading": settings.leading,
              "--typeset-flow": `${settings.flow}em`,
            } as CSSProperties
          }
        >
          <h1>Campaign signal review</h1>
          <p>
            Delivery is pacing <strong>within the approved range</strong>. Two
            creator sessions need review before the next flight begins.
          </p>
          <h2>What changed</h2>
          <p>
            Qualified reach increased after the safety threshold moved from
            <code>0.68</code> to <code>0.72</code>. The recommendation remains
            visible until an operator approves it.
          </p>
          <blockquote>
            Keep the decision legible: show the proposed result, its evidence,
            and the human approval state together.
          </blockquote>
          <ul>
            <li>18 creators are ready for review.</li>
            <li>2 category overrides require confirmation.</li>
            <li>Exported evidence remains attached to the report.</li>
          </ul>
        </article>
      </CardContent>
    </Card>
  )
}

function TypesetControl({
  label,
  value,
  sliderValue,
  min,
  max,
  step,
  onValueChange,
}: {
  label: string
  value: string
  sliderValue: number
  min: number
  max: number
  step: number
  onValueChange: (value: number | readonly number[]) => void
}) {
  return (
    <label className="grid gap-2">
      <span className="flex items-center justify-between gap-3 text-ui-caption text-muted-foreground">
        <span className="font-medium uppercase">{label}</span>
        <output className="font-mono text-foreground">{value}</output>
      </span>
      <Slider
        value={sliderValue}
        min={min}
        max={max}
        step={step}
        onValueChange={onValueChange}
        aria-label={`Typeset ${label.toLowerCase()}`}
      />
    </label>
  )
}

function FoundationDefinition({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="grid grid-cols-[6rem_minmax(0,1fr)] gap-3 border-b border-nextide-line pb-2 last:border-b-0 last:pb-0">
      <dt className="text-ui-caption font-medium text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="text-ui-label font-medium">{value}</dd>
    </div>
  )
}

function FoundationSwatch({
  className,
  label,
}: {
  className?: string
  label: string
}) {
  return (
    <div
      className={cn(
        "flex min-h-20 items-end rounded-lg border border-nextide-line p-3",
        className
      )}
    >
      <strong className="text-ui-label">{label}</strong>
    </div>
  )
}

export { FoundationsPreview }

function TypographyPreview() {
  return (
    <Card className="2xl:col-span-2">
      <CardHeader>
        <CardTitle>Typography</CardTitle>
        <CardDescription>
          Regular carries the interface. Medium creates hierarchy. Obviously
          appears only when the title itself is the moment.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]">
        <div className="grid content-start gap-3">
          <p className="font-display text-ui-display font-bold">
            Signals, not noise.
          </p>
          <p className="text-ui-headline font-medium">
            Campaign state should read in one glance.
          </p>
          <p className="max-w-[65ch] text-ui-body text-muted-foreground">
            The everyday interface uses a metric-stable system stack with no
            baseline offsets or per-component corrections.
          </p>
        </div>
        <dl className="grid content-start gap-3">
          <FoundationDefinition
            label="Display"
            value="Obviously Bold · rare title"
          />
          <FoundationDefinition label="Medium" value="500 · hierarchy" />
          <FoundationDefinition label="Regular" value="400 · body" />
          <FoundationDefinition label="Caption floor" value="12px" />
        </dl>
      </CardContent>
    </Card>
  )
}

function ColorPreview() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Color and surface</CardTitle>
        <CardDescription>
          Quiet graphite layers keep turquoise scarce enough to remain a signal.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        <FoundationSwatch className="bg-background" label="Canvas" />
        <FoundationSwatch className="bg-nextide-panel" label="Surface" />
        <FoundationSwatch
          className="bg-nextide-panel-strong"
          label="Raised state"
        />
        <FoundationSwatch
          className="bg-nextide-tide text-black"
          label="Signal"
        />
        <FoundationSwatch
          className="bg-nextide-yellow text-black"
          label="Warning"
        />
        <FoundationSwatch
          className="bg-nextide-red text-white"
          label="Danger"
        />
      </CardContent>
    </Card>
  )
}

function RadiusPreview() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Radius</CardTitle>
        <CardDescription>
          Every control and surface stays between 8 and 12 pixels. True circles
          and data marks are the only exceptions.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-3">
        {[
          { label: "Control", value: "8px", className: "rounded-md" },
          { label: "Surface", value: "10px", className: "rounded-lg" },
          { label: "Overlay", value: "12px", className: "rounded-xl" },
        ].map((radius) => (
          <div
            key={radius.label}
            className={cn(
              "grid min-h-28 place-content-center gap-1 border border-nextide-tide/28 bg-nextide-tide/[0.06] text-center",
              radius.className
            )}
          >
            <strong className="text-ui-label">{radius.label}</strong>
            <span className="text-ui-caption text-muted-foreground">
              {radius.value}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function MotionPreview() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Motion</CardTitle>
        <CardDescription>
          Four timings cover response, control feedback, state change, and
          layout. Motion explains change; it does not decorate rest.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        {[
          { label: "Instant", value: "120ms", detail: "Tooltip and exit" },
          { label: "Control", value: "160ms", detail: "Hover and focus" },
          { label: "State", value: "220ms", detail: "Selection and reveal" },
          { label: "Layout", value: "300ms", detail: "Drawer and reflow" },
        ].map((motion) => (
          <div
            key={motion.label}
            className="group grid gap-3 rounded-lg border border-nextide-line bg-background/25 p-3"
          >
            <span className="h-1.5 overflow-hidden rounded-full bg-nextide-panel-strong">
              <span className="block h-full w-1/3 rounded-full bg-nextide-tide transition-transform duration-[var(--nextide-motion-state)] ease-[var(--nextide-ease-out-quart)] group-hover:translate-x-[200%] motion-reduce:transition-none" />
            </span>
            <span className="grid gap-0.5">
              <strong className="text-ui-label">
                {motion.label} · {motion.value}
              </strong>
              <span className="text-ui-caption text-muted-foreground">
                {motion.detail}
              </span>
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function IconographyPreview() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Iconography</CardTitle>
        <CardDescription>
          One outline family, consistent optical size, and text labels for every
          non-obvious action.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex flex-wrap gap-3 text-nextide-tide [&_svg]:size-5">
          <Search />
          <CalendarClock />
          <RadioTower />
          <ShieldAlert />
          <Database />
          <Settings />
        </div>
        <p className="text-ui-label text-muted-foreground">
          Lucide is the current shared default. The family can change later;
          mixing families within a product cannot.
        </p>
      </CardContent>
    </Card>
  )
}
