import { useState } from "react"

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
import { Field, FieldGroup, FieldLabel } from "@nextide/ui/components/field"
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
  { id: "details", label: "Details", meta: "Project basics" },
  { id: "review", label: "Review", meta: "Confirm choices" },
  { id: "complete", label: "Complete", meta: "Ready to continue" },
]

function QualificationPage() {
  const [activeStepId, setActiveStepId] = useState("details")
  const [region, setRegion] = useState("europe")

  return (
    <main className="min-h-screen bg-background p-4 text-foreground sm:p-6">
      <div className="mx-auto grid w-full max-w-4xl gap-4">
        <header className="grid gap-1">
          <h1 className="text-2xl font-bold">Workspace setup</h1>
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
              <Field>
                <FieldLabel>Delivery region</FieldLabel>
                <SelectMenu
                  aria-label="Delivery region"
                  onValueChange={setRegion}
                  options={[
                    { value: "europe", label: "Europe" },
                    { value: "americas", label: "Americas" },
                    { value: "asia-pacific", label: "Asia Pacific" },
                  ]}
                  value={region}
                />
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
              Move between the available setup steps.
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
