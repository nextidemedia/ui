import { ChevronsUpDown, LogOut, Settings } from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@nextide/ui/components/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@nextide/ui/components/dropdown-menu"
import { cn } from "@nextide/ui/lib/utils"

type NavigationUserMenuProps = {
  name: string
  email?: string
  avatarSrc?: string
  initials?: string
  collapsed?: boolean
  drawerCollapsed?: boolean
  onSettings: () => void
  onLogout: () => void
}

function NavigationUserMenu({
  name,
  email,
  avatarSrc,
  initials = initialsFromName(name),
  collapsed = false,
  drawerCollapsed = collapsed,
  onSettings,
  onLogout,
}: NavigationUserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            aria-label={`${name} menu`}
            className={cn(
              "grid h-11 w-full min-w-0 items-center rounded-lg border border-transparent text-left transition-[grid-template-columns,gap,padding,background-color,border-color] duration-[var(--nextide-drawer-icon-duration)] ease-[var(--nextide-drawer-ease)] hover:border-nextide-tide/25 hover:bg-nextide-tide/8 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none data-popup-open:border-nextide-tide/25 data-popup-open:bg-nextide-tide/8 motion-reduce:transition-none",
              collapsed
                ? "grid-cols-[2rem] justify-center px-1.5"
                : "grid-cols-[2rem_minmax(0,1fr)_1rem] gap-2 px-1.5"
            )}
          />
        }
      >
        <UserAvatar avatarSrc={avatarSrc} initials={initials} />
        {!collapsed ? (
          <span
            className={cn(
              "grid min-w-0 gap-0.5 overflow-hidden whitespace-nowrap transition-[max-width,opacity,transform] duration-[var(--nextide-drawer-duration)] ease-[var(--nextide-drawer-ease)] motion-reduce:transition-none",
              drawerCollapsed
                ? "max-w-0 -translate-x-4 opacity-0"
                : "max-w-full translate-x-0 opacity-100"
            )}
          >
            <strong className="truncate text-ui-label font-medium text-foreground">
              {name}
            </strong>
            {email ? (
              <small className="truncate text-ui-micro text-muted-foreground">
                {email}
              </small>
            ) : null}
          </span>
        ) : null}
        {!collapsed ? (
          <ChevronsUpDown
            className={cn(
              "text-muted-foreground transition-[opacity,transform] duration-[var(--nextide-drawer-icon-duration)] ease-[var(--nextide-drawer-ease)] motion-reduce:transition-none",
              drawerCollapsed
                ? "-translate-x-3 opacity-0"
                : "translate-x-0 opacity-100"
            )}
          />
        ) : null}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="right"
        align="end"
        sideOffset={8}
        className="w-64 rounded-lg"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="p-1.5 font-normal">
            <span className="grid grid-cols-[2rem_minmax(0,1fr)] items-center gap-2">
              <UserAvatar avatarSrc={avatarSrc} initials={initials} />
              <span className="grid min-w-0 gap-0.5">
                <strong className="truncate text-ui-label font-medium text-foreground">
                  {name}
                </strong>
                {email ? (
                  <small className="truncate text-ui-micro text-muted-foreground">
                    {email}
                  </small>
                ) : null}
              </span>
            </span>
          </DropdownMenuLabel>
          <DropdownMenuItem onClick={onSettings}>
            <Settings />
            Settings
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={onLogout}>
            <LogOut />
            Logout
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function UserAvatar({
  avatarSrc,
  initials,
}: {
  avatarSrc?: string
  initials: string
}) {
  return (
    <Avatar className="rounded-lg after:rounded-lg">
      {avatarSrc ? (
        <AvatarImage className="rounded-lg" src={avatarSrc} alt="" />
      ) : null}
      <AvatarFallback className="rounded-lg bg-nextide-tide/12 font-medium text-nextide-tide">
        {initials}
      </AvatarFallback>
    </Avatar>
  )
}

function initialsFromName(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export { NavigationUserMenu, type NavigationUserMenuProps }
