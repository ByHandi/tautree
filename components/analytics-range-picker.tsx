"use client";

import { useRouter } from "next/navigation";

import { format } from "date-fns";
import type { DateRange } from "react-day-picker";

import { DateRangePicker } from "@/components/ui/date-range-picker";

/**
 * Drives the analytics window via the URL (`?from=&to=`). The server component
 * reads those params, so picking a range just navigates — no client data fetch.
 */
export function AnalyticsRangePicker({ from, to }: { from: string; to: string }) {
  const router = useRouter();
  const value: DateRange = { from: new Date(from), to: new Date(to) };

  function onValueChange(range: DateRange | undefined) {
    if (!range?.from || !range?.to) return;
    const params = new URLSearchParams({
      from: format(range.from, "yyyy-MM-dd"),
      to: format(range.to, "yyyy-MM-dd"),
    });
    router.push(`/dashboard/analytics?${params.toString()}`);
  }

  return (
    <DateRangePicker
      popoverAlign="end"
      className="max-w-xs"
      value={value}
      onValueChange={onValueChange}
      numberOfMonths={2}
    />
  );
}
