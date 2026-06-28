"use client";

import Link from "next/link";

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
} from "@/components/ui/sidebar";

const navItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: "layout-dashboard",
    isActive: true,
  },
  {
    title: "Components",
    href: "/",
    icon: "blocks",
    isActive: false,
  },
  {
    title: "Forms",
    href: "/",
    icon: "file-input",
    isActive: false,
  },
  {
    title: "Settings",
    href: "/",
    icon: "settings",
    isActive: false,
  },
] as const;

function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="flex gap-2">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
              <Icon name="box" className="size-4" />
            </span>

            <span className="flex min-w-0 flex-col overflow-hidden leading-none whitespace-nowrap transition-[width,opacity] group-data-[collapsible=icon]:opacity-0">
              <span className="font-medium">Next shadcn</span>
              <span className="text-xs text-sidebar-foreground/70">Boilerplate</span>
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
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={Boolean(item.isActive)} tooltip={item.title}>
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
            <SidebarMenuButton asChild tooltip="Repository">
              <Link href="/">
                <Icon name="folder-git-2" />
                <span>Repository</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

export default AppSidebar;
