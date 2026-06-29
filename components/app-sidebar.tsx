"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { signOutAction } from "@/app/(dashboard)/actions";
import { Logo } from "@/components/logo";
import Icon from "@/components/ui/icon";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";

type SidebarUser = {
  username: string | null;
  name: string | null;
  email: string | null;
  image: string | null;
};

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: "layout-dashboard",
  },
  {
    title: "Links",
    href: "/dashboard/links",
    icon: "link",
  },
  {
    title: "Analytics",
    href: "/dashboard/analytics",
    icon: "chart-no-axes-column",
  },
  {
    title: "Appearance",
    href: "/dashboard/appearance",
    icon: "palette",
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: "settings",
  },
] as const;

function AppSidebar({ user }: { user: SidebarUser }) {
const { setOpenMobile} =  useSidebar()
  const pathname = usePathname();
  const publicHref = user.username ? `/${user.username}` : "/";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="flex gap-2">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
              <Logo className="size-5" />
            </span>

            <span className="flex min-w-0 flex-col overflow-hidden leading-none whitespace-nowrap transition-[width,opacity] group-data-[collapsible=icon]:opacity-0">
              <span className="font-medium">Tautree</span>
              <span className="text-xs text-sidebar-foreground/70">Dashboard</span>
            </span>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title} onClick={() => setOpenMobile(false)}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.title}
                  >
                    <Link href={item.href}>
                      <Icon name={item.icon} />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="View public page">
              <Link href={publicHref} target="_blank" rel="noreferrer">
                <Icon name="external-link" />
                <span>View public page</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <div className="flex items-center gap-2 overflow-hidden px-2 py-1.5">
              <span className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-xs font-medium">
                {user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.image} alt="" className="size-full object-cover" />
                ) : (
                  (user.name ?? user.email ?? "?").charAt(0).toUpperCase()
                )}
              </span>
              <span className="flex min-w-0 flex-col overflow-hidden leading-tight whitespace-nowrap group-data-[collapsible=icon]:hidden">
                <span className="truncate text-sm font-medium">
                  {user.name ?? user.username}
                </span>
                <span className="truncate text-xs text-sidebar-foreground/70">
                  @{user.username}
                </span>
              </span>
            </div>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <form action={signOutAction}>
              <SidebarMenuButton type="submit" tooltip="Keluar">
                <Icon name="log-out" />
                <span>Keluar</span>
              </SidebarMenuButton>
            </form>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

export default AppSidebar;
