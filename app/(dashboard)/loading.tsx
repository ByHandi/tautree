import { Spinner } from "@/components/ui/spinner";

export default function DashboardLoading() {
  return (
    <div className="flex min-h-[60dvh] items-center justify-center">
      <Spinner className="size-6 text-muted-foreground" />
    </div>
  );
}
