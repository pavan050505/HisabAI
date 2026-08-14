"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { DashboardDateFilter } from "./DashboardDateFilter";
import { useMemo } from "react";
import type { DateRange, DateRangeKey } from "../types";
import { getDateRange } from "../calculations/date-ranges";

export function DashboardDateFilterWithNavigation() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const rangeKey =
    (searchParams.get("range") as DateRangeKey) || "this-month";

  const range: DateRange = useMemo(() => {
    return getDateRange(rangeKey);
  }, [rangeKey]);

  const onRangeChange = (key: DateRangeKey) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("range", key);
    router.push(`/dashboard?${params.toString()}`);
  };

  return (
    <DashboardDateFilter range={range} onRangeChange={onRangeChange} />
  );
}
