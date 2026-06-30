import { cookies } from "next/headers";
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

  // Restore the persisted collapse state (set as a cookie on toggle) so a
  // reload doesn't snap the sidebar back to its default-open state.
  const sidebarOpen = (await cookies()).get("sidebar_state")?.value !== "false";

  return (
    <SidebarProvider defaultOpen={sidebarOpen}>
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
        <header className="sticky top-2 left-2 z-10 w-fit rounded-xl bg-background/95 p-1 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <SidebarTrigger />
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
