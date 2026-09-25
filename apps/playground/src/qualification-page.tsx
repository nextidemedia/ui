import { useState } from "react"
import { Building2 } from "lucide-react"
import {
  CreatorFlowChart,
  type CreatorFlowSession,
} from "@nextide/ui/components/creator-flow-chart"

import { WorkflowStepper } from "@nextide/ui/blocks/workflow-stepper"
import { Button } from "@nextide/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@nextide/ui/components/card"
import { Checkbox } from "@nextide/ui/components/checkbox"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@nextide/ui/components/field"
import { Input } from "@nextide/ui/components/input"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@nextide/ui/components/popover"
import { SelectMenu } from "@nextide/ui/components/select-menu"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@nextide/ui/components/tabs"

const workflowSteps = [
  { id: "details", label: "Details", meta: "Project basics", completed: true },
  { id: "review", label: "Review", meta: "Confirm choices", completed: true },
  {
    id: "complete",
    label: "Complete",
    meta: "Ready to continue",
    completed: true,
  },
]

function QualificationPage() {
  const [activeStepId, setActiveStepId] = useState("details")
  const [region, setRegion] = useState("")

  return (
    <main className="min-h-screen bg-background p-4 text-foreground sm:p-6">
      <div className="mx-auto grid w-full max-w-4xl gap-4">
        <FlowChartExample />
        <FlowViewportExample />
        <header className="grid gap-1">
          <h1 className="text-2xl font-medium">Workspace setup</h1>
          <p className="text-sm text-muted-foreground">
            Add the details your team needs to begin.
          </p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Project details</CardTitle>
            <CardDescription>
              Choose a name, reporting region, and summary preference.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="project-name">Project name</FieldLabel>
                <Input id="project-name" defaultValue="Launch plan" />
              </Field>
              <Field data-invalid={!region}>
                <FieldLabel>Delivery region</FieldLabel>
                <SelectMenu
                  aria-label="Delivery region"
                  aria-describedby={
                    region ? undefined : "delivery-region-error"
                  }
                  aria-invalid={!region}
                  onValueChange={setRegion}
                  options={[
                    { value: "europe", label: "Europe" },
                    { value: "americas", label: "Americas" },
                    { value: "asia-pacific", label: "Asia Pacific" },
                  ]}
                  value={region}
                />
                {!region && (
                  <FieldDescription id="delivery-region-error">
                    Choose a delivery region.
                  </FieldDescription>
                )}
              </Field>
              <Field orientation="horizontal">
                <Checkbox id="weekly-summary" />
                <FieldLabel htmlFor="weekly-summary">
                  Include a weekly summary
                </FieldLabel>
              </Field>
            </FieldGroup>
          </CardContent>
          <CardFooter className="justify-between gap-3">
            <Popover>
              <PopoverTrigger render={<Button variant="outline" />}>
                Review settings
              </PopoverTrigger>
              <PopoverContent>
                <PopoverHeader>
                  <PopoverTitle>Project review</PopoverTitle>
                  <PopoverDescription>
                    Your project is ready for the team.
                  </PopoverDescription>
                </PopoverHeader>
              </PopoverContent>
            </Popover>
            <Button>Continue</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Delivery workflow</CardTitle>
            <CardDescription>
              Revisit any step without losing completed progress.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <WorkflowStepper
              activeStepId={activeStepId}
              onStepChange={(step) => setActiveStepId(step.id)}
              steps={workflowSteps}
            />
          </CardContent>
          <CardFooter>
            <span>Current step: {activeStepId}</span>
          </CardFooter>
        </Card>

        <Tabs defaultValue="overview">
          <TabsList aria-label="Workspace views">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">Project overview is ready.</TabsContent>
          <TabsContent value="activity">Recent activity is ready.</TabsContent>
        </Tabs>
      </div>
    </main>
  )
}

export { QualificationPage }

function FlowChartExample() {
  const [selected, setSelected] = useState("")
  const [editable, setEditable] = useState(false)
  const [sessions, setSessions] = useState<CreatorFlowSession[]>([
    {
      id: "launch",
      creatorId: "brand",
      label: "Autumn launch",
      startIndex: 0,
      endIndex: 1,
      continuesBefore: true,
    },
  ])
  return (
    <div className="grid gap-3">
      <CreatorFlowChart
        aria-label="Campaign calendar"
        continuationFade={1 / 14}
        title={<span>Campaign calendar</span>}
        description={null}
        compact
        creators={[
          {
            id: "brand",
            name: <span>Acme</span>,
            avatar: <Building2 aria-hidden="true" />,
          },
        ]}
        days={["W39", "W40", "W41", "W42"]}
        sessions={sessions}
        onSessionsChange={editable ? setSessions : undefined}
        onSessionSelect={
          editable ? undefined : (session) => setSelected(String(session.label))
        }
      />
      <Button variant="outline" onClick={() => setEditable(!editable)}>
        {editable ? "Finish editing calendar" : "Edit calendar"}
      </Button>
      <output aria-label="Selected campaign">{selected}</output>
    </div>
  )
}

function FlowViewportExample() {
  const [start, setStart] = useState(2)
  const [selected, setSelected] = useState("")
  const creators = Array.from({ length: 8 }, (_, index) => ({
    id: `campaign-${index}`,
    name: `Campaign ${index + 1}`,
    meta: (
      <button onClick={() => setSelected(`Inspect ${index + 1}`)}>
        Inspect {index + 1}
      </button>
    ),
  }))
  return (
    <div className="grid gap-3">
      <CreatorFlowChart
        aria-label="Pannable calendar"
        title={null}
        description={null}
        compact
        className="h-56"
        creators={creators}
        days={Array.from({ length: 12 }, (_, index) => `Week ${index + 1}`)}
        sessions={creators.map((creator) => ({
          id: creator.id,
          creatorId: creator.id,
          label: creator.name,
          startIndex: 0,
          endIndex: 10,
        }))}
        visibleStartIndex={start}
        visibleColumnCount={6}
        onVisibleStartIndexChange={setStart}
        onSessionSelect={(session) => setSelected(String(session.label))}
      />
      <Button onClick={() => setStart(start + 1)}>Next calendar week</Button>
      <output aria-label="Panned campaign">{selected}</output>
    </div>
  )
}
