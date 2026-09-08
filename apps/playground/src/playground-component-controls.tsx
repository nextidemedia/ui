import {
  Autocomplete,
  AutocompleteClear,
  AutocompleteContent,
  AutocompleteEmpty,
  AutocompleteInput,
  AutocompleteInputGroup,
  AutocompleteItem,
  AutocompleteList,
  AutocompletePortal,
  AutocompletePositioner,
} from "@nextide/ui/components/autocomplete"
import { Avatar, AvatarFallback } from "@nextide/ui/components/avatar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@nextide/ui/components/card"
import { Checkbox } from "@nextide/ui/components/checkbox"
import {
  DurationPicker,
  type DurationValue,
} from "@nextide/ui/components/duration-picker"
import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@nextide/ui/components/field"
import { Input } from "@nextide/ui/components/input"
import { SegmentedControl } from "@nextide/ui/components/segmented-control"
import { SelectMenu } from "@nextide/ui/components/select-menu"
import { Slider } from "@nextide/ui/components/slider"
import { Switch } from "@nextide/ui/components/switch"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@nextide/ui/components/tabs"
import { Search } from "lucide-react"
import { useState } from "react"
import { ComponentReference } from "./component-reference"
import { ComponentMatrix } from "./playground-components"
import {
  autocompleteCreatorValue,
  intelligenceCreators,
} from "./playground-intelligence-data"
function InputPreview({
  checked,
  enabled,
  onCheckedChange,
  onEnabledChange,
}: Pick<
  Parameters<typeof ComponentMatrix>[0],
  "checked" | "enabled" | "onCheckedChange" | "onEnabledChange"
>) {
  const [primitiveScope, setPrimitiveScope] = useState("campaigns")
  const [duration, setDuration] = useState<DurationValue>({
    days: 2,
    hours: 2,
    minutes: 33,
  })
  return (
    <Card>
      <CardHeader>
        <CardTitle>Inputs</CardTitle>
        <CardDescription>
          Labeled fields and compact controls for dense app surfaces.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <ComponentReference names={["Field", "FieldLabel", "Input"]} />
          <Field>
            <FieldLabel htmlFor="primitive-report-name">Report name</FieldLabel>
            <Input id="primitive-report-name" defaultValue="Sponsored report" />
            <FieldDescription>
              Used for saved reports and exported evidence.
            </FieldDescription>
          </Field>
        </div>
        <div className="grid gap-2">
          <ComponentReference names="SelectMenu" />
          <SelectMenu
            value={primitiveScope}
            onValueChange={setPrimitiveScope}
            options={[
              { value: "campaigns", label: "Campaigns" },
              { value: "creators", label: "Creators" },
              { value: "partners", label: "Partners" },
            ]}
            aria-label="Report scope"
          />
        </div>
        <div className="grid gap-2">
          <ComponentReference names="DurationPicker" />
          <DurationPicker
            showDays
            maxDays={365}
            value={duration}
            onValueChange={setDuration}
          />
          <output
            data-slot="duration-picker-output"
            className="text-ui-caption text-muted-foreground"
            aria-live="polite"
          >
            {duration.days ?? 0} d {duration.hours} hr {duration.minutes} min
          </output>
        </div>
        <div className="grid gap-2">
          <ComponentReference names="Checkbox" />
          <div className="flex items-center gap-3">
            <Checkbox
              id="include-degraded-runs"
              checked={checked}
              onCheckedChange={(value) => onCheckedChange(value === true)}
            />
            <label htmlFor="include-degraded-runs" className="text-sm">
              Include degraded runs
            </label>
          </div>
        </div>
        <div className="grid gap-2">
          <ComponentReference names="Switch" />
          <div className="flex items-center gap-3">
            <Switch
              id="runtime-checks"
              checked={enabled}
              onCheckedChange={onEnabledChange}
            />
            <label htmlFor="runtime-checks" className="text-sm">
              Runtime checks
            </label>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function FilterPreview({
  density,
  confidence,
  onDensityChange,
  onConfidenceChange,
}: Pick<
  Parameters<typeof ComponentMatrix>[0],
  "density" | "confidence" | "onDensityChange" | "onConfidenceChange"
>) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Filters</CardTitle>
        <CardDescription>
          Segmented choice and confidence range.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <ComponentReference names="SegmentedControl" />
          <SegmentedControl
            value={density}
            options={[
              { value: "compact", label: "Compact" },
              { value: "comfortable", label: "Comfort" },
              { value: "spacious", label: "Spacious" },
            ]}
            onValueChange={onDensityChange}
          />
        </div>
        <div className="grid gap-2">
          <ComponentReference names="Slider" />
          <Slider
            aria-label="Confidence"
            value={confidence}
            min={0}
            max={100}
            step={1}
            onValueChange={(nextValue) =>
              onConfidenceChange(
                Array.isArray(nextValue) ? [...nextValue] : [nextValue]
              )
            }
          />
        </div>
        <div className="grid gap-2">
          <ComponentReference names="Tabs" />
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="evidence">Evidence</TabsTrigger>
            </TabsList>
            <TabsContent
              value="overview"
              className="rounded-md bg-input/30 p-3 text-muted-foreground"
            >
              Campaign-level delivery signals.
            </TabsContent>
            <TabsContent
              value="evidence"
              className="rounded-md bg-input/30 p-3 text-muted-foreground"
            >
              Creator proof and review state.
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  )
}

function AutocompletePreview() {
  const [creatorQuery, setCreatorQuery] = useState("")
  return (
    <Card>
      <CardHeader>
        <ComponentReference names="Autocomplete" />
        <CardTitle>Autocomplete</CardTitle>
        <CardDescription>
          Free-form search with inline suggestions and keyboard selection.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Autocomplete
          items={intelligenceCreators}
          itemToStringValue={autocompleteCreatorValue}
          mode="both"
          openOnInputClick
          value={creatorQuery}
          onValueChange={setCreatorQuery}
        >
          <label
            className="mb-1.5 block text-xs font-medium text-muted-foreground"
            htmlFor="creator-autocomplete-preview"
          >
            Find a creator
          </label>
          <AutocompleteInputGroup>
            <Search />
            <AutocompleteInput
              id="creator-autocomplete-preview"
              placeholder="Search creators"
            />
            <AutocompleteClear aria-label="Clear creator search" />
          </AutocompleteInputGroup>
          <AutocompletePortal>
            <AutocompletePositioner>
              <AutocompleteContent>
                <AutocompleteEmpty>No creators found.</AutocompleteEmpty>
                <AutocompleteList>
                  {(creator: (typeof intelligenceCreators)[number]) => (
                    <AutocompleteItem key={creator.id} value={creator}>
                      <Avatar size="sm">
                        <AvatarFallback>{creator.avatar}</AvatarFallback>
                      </Avatar>
                      <span className="grid min-w-0">
                        <strong className="truncate font-medium">
                          {creator.name}
                        </strong>
                        <small className="truncate text-muted-foreground">
                          {creator.meta}
                        </small>
                      </span>
                    </AutocompleteItem>
                  )}
                </AutocompleteList>
              </AutocompleteContent>
            </AutocompletePositioner>
          </AutocompletePortal>
        </Autocomplete>
      </CardContent>
    </Card>
  )
}
export { AutocompletePreview, FilterPreview, InputPreview }
