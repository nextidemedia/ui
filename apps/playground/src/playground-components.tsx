import { Button } from "@nextide/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@nextide/ui/components/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@nextide/ui/components/carousel"
import { Kbd, KbdGroup } from "@nextide/ui/components/kbd"
import { Separator } from "@nextide/ui/components/separator"
import {
  Surface,
  SurfaceDescription,
  SurfaceHeader,
  SurfaceTitle,
} from "@nextide/ui/components/surface"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@nextide/ui/components/table"
import { Search } from "lucide-react"
import { ComponentReference } from "./component-reference"
import {
  AutocompletePreview,
  FilterPreview,
  InputPreview,
} from "./playground-component-controls"
import {
  IdentityPreview,
  ProcessingPreview,
  StatusPreview,
} from "./playground-component-feedback"
import { OverlayPreview } from "./playground-component-overlays"
function ComponentMatrix({
  density,
  confidence,
  checked,
  enabled,
  onDensityChange,
  onConfidenceChange,
  onCheckedChange,
  onEnabledChange,
}: {
  density: string
  confidence: number[]
  checked: boolean
  enabled: boolean
  onDensityChange: (value: string) => void
  onConfidenceChange: (value: number[]) => void
  onCheckedChange: (value: boolean) => void
  onEnabledChange: (value: boolean) => void
}) {
  return (
    <Surface className="grid gap-4">
      <SurfaceHeader>
        <ComponentReference names={["Surface", "Card"]} />
        <SurfaceTitle>Primitives</SurfaceTitle>
        <SurfaceDescription>
          Buttons, controls, badges, metrics, and notices.
        </SurfaceDescription>
      </SurfaceHeader>

      <div className="grid [grid-template-columns:repeat(auto-fit,minmax(min(100%,20rem),1fr))] gap-4">
        <ButtonPreview />

        <OverlayPreview />

        <InputPreview
          checked={checked}
          enabled={enabled}
          onCheckedChange={onCheckedChange}
          onEnabledChange={onEnabledChange}
        />

        <FilterPreview
          density={density}
          confidence={confidence}
          onDensityChange={onDensityChange}
          onConfidenceChange={onConfidenceChange}
        />

        <AutocompletePreview />

        <StructurePreview />

        <StatusPreview />

        <ProcessingPreview />

        <IdentityPreview />
      </div>
    </Surface>
  )
}

function ButtonPreview() {
  return (
    <Card>
      <CardHeader>
        <ComponentReference names="Button" />
        <CardTitle>Buttons</CardTitle>
        <CardDescription>
          Default shadcn variants with Nextide tokens available.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Danger</Button>
        <Button size="icon" aria-label="Search">
          <Search />
        </Button>
      </CardContent>
    </Card>
  )
}

function StructurePreview() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Structure</CardTitle>
        <CardDescription>
          Keyboard hints, compact data, and paged content.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <ComponentReference names={["Kbd", "Separator"]} />
          <div className="flex items-center justify-between gap-3 text-sm">
            <span>Open command palette</span>
            <KbdGroup>
              <Kbd>Ctrl</Kbd>
              <span>+</span>
              <Kbd>K</Kbd>
            </KbdGroup>
          </div>
          <Separator />
        </div>
        <div className="grid gap-2">
          <ComponentReference names="Table" />
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Starforge</TableCell>
                <TableCell>Live</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Orbit</TableCell>
                <TableCell>Ready</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        <div className="grid gap-2">
          <ComponentReference names="Carousel" />
          <Carousel loop>
            <CarouselContent>
              {["Campaign delivery", "Creator evidence", "Safety review"].map(
                (label, index) => (
                  <CarouselItem key={label}>
                    <div
                      id={`carousel-demo-panel-${index}`}
                      className="grid min-h-24 place-items-center rounded-lg border border-nextide-line bg-input/30 px-12 text-sm font-medium"
                    >
                      {label}
                    </div>
                  </CarouselItem>
                )
              )}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </CardContent>
    </Card>
  )
}
export { ComponentMatrix }
