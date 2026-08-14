"use client";

import { useState } from "react";
import { Calendar, ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  DATE_RANGE_LABELS,
  formatRangeDisplay,
} from "../calculations/date-ranges";
import type { DateRange, DateRangeKey } from "../types";

interface DashboardDateFilterProps {
  range: DateRange;
  onRangeChange: (key: DateRangeKey) => void;
}

const DATE_RANGE_OPTIONS: DateRangeKey[] = [
  "today",
  "yesterday",
  "this-week",
  "this-month",
  "last-month",
  "this-year",
  "custom",
];

export function DashboardDateFilter({
  range,
  onRangeChange,
}: DashboardDateFilterProps) {
  const [open, setOpen] = useState(false);

  const displayLabel =
    range.key === "custom" ? formatRangeDisplay(range) : range.label;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger>
        <Button
          variant="outline"
          className="w-full justify-start gap-2 sm:w-auto"
          aria-label="Select date range"
        >
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{displayLabel}</span>
          <ChevronDown
            className={cn(
              "ml-auto h-4 w-4 opacity-50 transition-transform sm:ml-1",
              open && "rotate-180",
            )}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[220px]">
        <DropdownMenuLabel>Date range</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {DATE_RANGE_OPTIONS.map((key) => {
          const isActive = range.key === key;
          const isDisabled = key === "custom";
          return (
            <DropdownMenuItem
              key={key}
              onClick={() => {
                if (isDisabled) return;
                onRangeChange(key);
                setOpen(false);
              }}
              className={cn(
                "flex items-center justify-between gap-4",
                isDisabled && "cursor-not-allowed opacity-50",
              )}
              disabled={isDisabled}
            >
              <span>{DATE_RANGE_LABELS[key]}</span>
              {isActive && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
