import { Button } from "@nextide/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@nextide/ui/components/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@nextide/ui/components/collapsible"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@nextide/ui/components/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@nextide/ui/components/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@nextide/ui/components/popover"
import { ScrollArea } from "@nextide/ui/components/scroll-area"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@nextide/ui/components/tooltip"
import { ComponentReference } from "./component-reference"
function OverlayPreview() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Overlays and scroll</CardTitle>
        <CardDescription>
          Focused details and compact overflow surfaces.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <ComponentReference
            names={["Dialog", "DropdownMenu", "Popover", "Tooltip"]}
          />
          <div className="flex flex-wrap gap-2">
            <Dialog>
              <DialogTrigger render={<Button variant="outline" />}>
                Open dialog
              </DialogTrigger>
              <DialogContent className="max-w-md p-5">
                <DialogHeader>
                  <DialogTitle>Review report scope</DialogTitle>
                  <DialogDescription>
                    Confirm the creators and campaigns included in this report.
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="outline" />}>
                Open menu
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Switch view</DropdownMenuLabel>
                  <DropdownMenuItem>Campaigns</DropdownMenuItem>
                  <DropdownMenuItem>Creators</DropdownMenuItem>
                  <DropdownMenuItem>Partners</DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <Popover>
              <PopoverTrigger render={<Button variant="outline" />}>
                Open details
              </PopoverTrigger>
              <PopoverContent>
                <PopoverHeader>
                  <PopoverTitle>Shared preview</PopoverTitle>
                  <PopoverDescription>
                    Review compact overlays without leaving the page.
                  </PopoverDescription>
                </PopoverHeader>
              </PopoverContent>
            </Popover>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger render={<Button variant="outline" />}>
                  Hover for status
                </TooltipTrigger>
                <TooltipContent>All checks are ready.</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        <div className="grid gap-2">
          <ComponentReference names="ScrollArea" />
          <ScrollArea className="h-28 rounded-lg border border-nextide-line bg-background/25">
            <div className="grid gap-2 p-3 text-sm">
              {[
                "Campaign summary",
                "Creator confidence",
                "Safety review",
                "Export schedule",
                "Delivery status",
              ].map((label) => (
                <div
                  key={label}
                  className="rounded-md border border-input bg-input/30 px-3 py-2"
                >
                  {label}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
        <CollapsiblePreview />
      </CardContent>
    </Card>
  )
}

function CollapsiblePreview() {
  return (
    <div className="grid gap-2">
      <ComponentReference names="Collapsible" />
      <Collapsible defaultOpen>
        <CollapsibleTrigger render={<Button variant="outline" size="sm" />}>
          Campaign details
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2 text-sm text-muted-foreground">
          Delivery and evidence controls stay available without opening another
          surface.
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
export { OverlayPreview }
