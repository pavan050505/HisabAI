"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { MetricCardData } from "../types";
import {
  formatCurrency,
  formatPercentage,
  getTrendBg,
} from "../calculations/formatting";

interface MetricCardProps {
  data: MetricCardData;
  currency?: string;
  loading?: boolean;
}

function renderIcon(
  iconName: string,
  accent?: MetricCardData["accent"],
) {
  switch (iconName) {
    case "revenue":
      return (
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg",
            accent === "positive"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-emerald-50 text-emerald-600",
          )}
          aria-hidden="true"
        >
          <TrendingUp className="h-5 w-5" />
        </div>
      );
    case "expenses":
      return (
        <div
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 text-rose-600"
          aria-hidden="true"
        >
          <TrendingDown className="h-5 w-5" />
        </div>
      );
    case "profit":
      return (
        <div
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600"
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-5 w-5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </div>
      );
    case "savings":
      return (
        <div
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-teal-600"
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-5 w-5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2" />
            <path d="M18 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z" />
            <path d="M6 7h.01M10 7h4" />
          </svg>
        </div>
      );
    case "cash":
      return (
        <div
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600"
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-5 w-5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="6" width="20" height="12" rx="2" />
            <circle cx="12" cy="12" r="2" />
          </svg>
        </div>
      );
    case "receivables":
      return (
        <div
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 text-orange-600"
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-5 w-5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 11h-6" />
            <path d="M19 8v6" />
          </svg>
        </div>
      );
    case "payables":
      return (
        <div
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-fuchsia-50 text-fuchsia-600"
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-5 w-5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 7h-4V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2H4v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
            <path d="M10 5v2" />
          </svg>
        </div>
      );
    case "orders":
      return (
        <div
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 text-sky-600"
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-5 w-5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
            <path d="M3 6h18" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
        </div>
      );
    default:
      return (
        <div
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground"
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-5 w-5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
          </svg>
        </div>
      );
  }
}

function renderTrendIcon(direction: "up" | "down" | "neutral") {
  switch (direction) {
    case "up":
      return <ArrowUpRight className="h-3.5 w-3.5" />;
    case "down":
      return <ArrowDownRight className="h-3.5 w-3.5" />;
    default:
      return <Minus className="h-3.5 w-3.5" />;
  }
}

export function MetricCard({
  data,
  currency = "INR",
  loading = false,
}: MetricCardProps) {
  const isEmpty =
    !loading && (data.value === 0 || !data.value) && !data.previousValue;

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-colors",
        "hover:ring-2 hover:ring-ring/30",
      )}
      aria-label={`${data.label}: ${formatCurrency(data.value, currency)}`}
    >
      <CardContent className="p-5">
        {loading ? (
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                <div className="h-8 w-32 animate-pulse rounded bg-muted" />
              </div>
              <div className="h-9 w-9 animate-pulse rounded-lg bg-muted" />
            </div>
            <div className="h-4 w-36 animate-pulse rounded bg-muted" />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {data.label}
                </p>
                <p className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  {formatCurrency(data.value, currency)}
                </p>
              </div>
              {renderIcon(data.icon, data.accent)}
            </div>

            {isEmpty && data.emptyStateMessage ? (
              <p className="text-xs text-muted-foreground">
                {data.emptyStateMessage}
              </p>
            ) : (
              <div className="flex items-center justify-between gap-2">
                {data.trend ? (
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
                      getTrendBg(data.trend.direction),
                    )}
                  >
                    {renderTrendIcon(data.trend.direction)}
                    {formatPercentage(Math.abs(data.trend.percentage))}
                    <span className="text-[10px] opacity-70 ml-0.5">
                      vs prev
                    </span>
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    {data.description}
                  </span>
                )}

                {data.viewDetailsHref && (
                  <Link
                    href={data.viewDetailsHref}
                    className="shrink-0"
                  >
                    <Button
                      variant="ghost"
                      size="xs"
                      className="text-xs h-6 -mr-2"
                    >
                      View
                      <span aria-hidden="true"> →</span>
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
