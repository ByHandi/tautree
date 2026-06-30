import { redirect } from "next/navigation";

import { auth } from "@/auth";
import AppSidebar from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { db } from "@/lib/db";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      username: true,
      name: true,
      email: true,
      image: true,
      avatarUrl: true,
      role: true,
    },
  });
  if (!user) redirect("/login");
  // DB-truthful username gate (the edge middleware can't read the DB).
  if (!user.username) redirect("/onboarding");

  return (
    <SidebarProvider>
      <AppSidebar
        user={{
          username: user.username,
          name: user.name,
          email: user.email,
          image: user.avatarUrl ?? user.image,
        }}
        isAdmin={user.role === "ADMIN"}
      />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <SidebarTrigger />
          <div className="h-4 w-px bg-border" />
          <span className="text-sm font-medium">Dashboard</span>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
