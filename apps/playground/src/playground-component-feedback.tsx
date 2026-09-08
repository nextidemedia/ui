import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@nextide/ui/components/alert"
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
} from "@nextide/ui/components/avatar"
import { Badge } from "@nextide/ui/components/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@nextide/ui/components/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@nextide/ui/components/empty"
import { Notice } from "@nextide/ui/components/notice"
import { ProcessingText } from "@nextide/ui/components/processing-text"
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@nextide/ui/components/progress"
import { Skeleton } from "@nextide/ui/components/skeleton"
import { Spinner } from "@nextide/ui/components/spinner"
import { StatusBadge } from "@nextide/ui/components/status-badge"
import { Search, ShieldAlert } from "lucide-react"
import { ComponentReference } from "./component-reference"
import { intelligenceCreators } from "./playground-intelligence-data"
function StatusPreview() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Status</CardTitle>
        <CardDescription>Badges and notices for runtime state.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        <div className="grid gap-2">
          <ComponentReference names={["StatusBadge", "Badge"]} />
          <div className="flex flex-wrap gap-2">
            <StatusBadge tone="success">Ready</StatusBadge>
            <StatusBadge tone="processing" indicator="pulse">
              Processing
            </StatusBadge>
            <StatusBadge tone="warning">Degraded</StatusBadge>
            <StatusBadge tone="danger">Failed</StatusBadge>
            <Badge variant="outline">Outline</Badge>
          </div>
        </div>
        <div className="grid gap-2">
          <ComponentReference names="Alert" />
          <Alert>
            <ShieldAlert />
            <AlertTitle>Evidence review ready</AlertTitle>
            <AlertDescription>
              Two creator sessions are ready for operator review.
            </AlertDescription>
          </Alert>
        </div>
        <div className="grid gap-2">
          <ComponentReference names="Notice" />
          <Notice title="Projection cache warm" tone="info">
            Read model data is available for the current playground run.
          </Notice>
        </div>
      </CardContent>
    </Card>
  )
}

function ProcessingPreview() {
  return (
    <Card>
      <CardHeader>
        <ComponentReference names="ProcessingText" />
        <CardTitle>Processing text</CardTitle>
        <CardDescription>
          Three named styles moving at the same travel speed across any text
          length.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {[
          {
            label: "Classic",
            variant: "classic" as const,
            copy: "Preparing your campaign report",
          },
          {
            label: "Aurora",
            variant: "aurora" as const,
            copy: "Analyzing creator evidence",
          },
          {
            label: "Flame",
            variant: "flame" as const,
            copy: "Generating delivery insights",
          },
        ].map((example) => (
          <div
            key={example.variant}
            className="grid gap-1.5 rounded-lg border border-nextide-line bg-background/25 p-3"
          >
            <strong className="text-ui-caption text-muted-foreground">
              ProcessingText · {example.label}
            </strong>
            <p className="text-ui-title font-medium">
              <ProcessingText variant={example.variant}>
                {example.copy}
              </ProcessingText>
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function IdentityPreview() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Identity and feedback</CardTitle>
        <CardDescription>
          Compact identity, progress, loading, and empty states.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <ComponentReference names={["Avatar", "AvatarGroup"]} />
          <AvatarGroup>
            {intelligenceCreators.slice(0, 3).map((creator, index) => (
              <Avatar key={creator.id}>
                <AvatarFallback>{creator.avatar}</AvatarFallback>
                {index === 0 ? <AvatarBadge aria-hidden="true" /> : null}
              </Avatar>
            ))}
            <AvatarGroupCount>+2</AvatarGroupCount>
          </AvatarGroup>
        </div>
        <div className="grid gap-2">
          <ComponentReference names="Progress" />
          <Progress value={72}>
            <ProgressLabel>Profile readiness</ProgressLabel>
            <ProgressValue />
          </Progress>
        </div>
        <div className="grid gap-2">
          <ComponentReference names="Spinner" />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Spinner />
            Refreshing preview
          </div>
        </div>
        <div className="grid gap-2">
          <ComponentReference names="Skeleton" />
          <div className="flex items-center gap-3" aria-hidden="true">
            <Skeleton className="size-9 rounded-full" />
            <div className="grid flex-1 gap-2">
              <Skeleton className="h-3 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        </div>
        <div className="grid gap-2">
          <ComponentReference names="Empty" />
          <Empty className="min-h-32 border border-nextide-line bg-background/20">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Search />
              </EmptyMedia>
              <EmptyTitle>No saved views</EmptyTitle>
              <EmptyDescription>Saved views will appear here.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
      </CardContent>
    </Card>
  )
}
export { IdentityPreview, ProcessingPreview, StatusPreview }
