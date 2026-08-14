import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subDays,
  subMonths,
  isSameDay,
  format,
} from "date-fns";

import type { DateRange, DateRangeKey, PeriodComparison } from "../types";

export const DATE_RANGE_LABELS: Record<DateRangeKey, string> = {
  today: "Today",
  yesterday: "Yesterday",
  "this-week": "This Week",
  "this-month": "This Month",
  "last-month": "Last Month",
  "this-year": "This Year",
  custom: "Custom Range",
};

export function getDateRange(
  key: DateRangeKey,
  customFrom?: Date,
  customTo?: Date,
  now: Date = new Date(),
): DateRange {
  switch (key) {
    case "today": {
      return {
        key,
        label: DATE_RANGE_LABELS[key],
        from: startOfDay(now),
        to: endOfDay(now),
      };
    }
    case "yesterday": {
      const yesterday = subDays(now, 1);
      return {
        key,
        label: DATE_RANGE_LABELS[key],
        from: startOfDay(yesterday),
        to: endOfDay(yesterday),
      };
    }
    case "this-week": {
      return {
        key,
        label: DATE_RANGE_LABELS[key],
        from: startOfWeek(now, { weekStartsOn: 1 }),
        to: endOfWeek(now, { weekStartsOn: 1 }),
      };
    }
    case "this-month": {
      return {
        key,
        label: DATE_RANGE_LABELS[key],
        from: startOfMonth(now),
        to: endOfMonth(now),
      };
    }
    case "last-month": {
      const lastMonth = subMonths(now, 1);
      return {
        key,
        label: DATE_RANGE_LABELS[key],
        from: startOfMonth(lastMonth),
        to: endOfMonth(lastMonth),
      };
    }
    case "this-year": {
      return {
        key,
        label: DATE_RANGE_LABELS[key],
        from: startOfYear(now),
        to: endOfYear(now),
      };
    }
    case "custom": {
      if (!customFrom || !customTo) {
        const fallback = getDateRange(
          "this-month",
          undefined,
          undefined,
          now,
        );
        return {
          ...fallback,
          key: "custom",
          label: DATE_RANGE_LABELS["custom"],
        };
      }
      return {
        key,
        label: `${format(customFrom, "dd MMM yyyy")} — ${format(customTo, "dd MMM yyyy")}`,
        from: startOfDay(customFrom),
        to: endOfDay(customTo),
      };
    }
  }
}

export function getPreviousPeriod(range: DateRange): DateRange {
  const durationMs = range.to.getTime() - range.from.getTime() + 1;
  const days = Math.max(
    1,
    Math.ceil(durationMs / (1000 * 60 * 60 * 24)),
  );

  const prevTo = subDays(range.from, 1);
  const prevFrom = subDays(prevTo, days - 1);

  const previousKey = range.key;

  return {
    key: previousKey,
    label: `Previous ${DATE_RANGE_LABELS[previousKey]}`,
    from: startOfDay(prevFrom),
    to: endOfDay(prevTo),
  };
}

export function getPeriodComparison(
  key: DateRangeKey,
  customFrom?: Date,
  customTo?: Date,
): PeriodComparison {
  const current = getDateRange(key, customFrom, customTo);
  const previous = getPreviousPeriod(current);
  return { current, previous };
}

export function dateRangesEqual(a: DateRange, b: DateRange): boolean {
  return isSameDay(a.from, b.from) && isSameDay(a.to, b.to);
}

export function formatRangeDisplay(range: DateRange): string {
  if (isSameDay(range.from, range.to)) {
    return format(range.from, "dd MMMM yyyy");
  }
  return `${format(range.from, "dd MMM")} — ${format(range.to, "dd MMM yyyy")}`;
}

export function getAggregationGranularity(
  range: DateRange,
): "daily" | "weekly" | "monthly" {
  const durationDays = Math.ceil(
    (range.to.getTime() - range.from.getTime()) /
      (1000 * 60 * 60 * 24),
  );

  if (durationDays <= 31) return "daily";
  if (durationDays <= 120) return "weekly";
  return "monthly";
}

export function generateDateBuckets(range: DateRange): Array<{
  start: Date;
  end: Date;
  label: string;
}> {
  const granularity = getAggregationGranularity(range);
  const buckets: Array<{ start: Date; end: Date; label: string }> = [];

  if (granularity === "daily") {
    let cursor = new Date(range.from);
    while (cursor <= range.to) {
      buckets.push({
        start: startOfDay(cursor),
        end: endOfDay(cursor),
        label: format(cursor, "dd MMM"),
      });
      cursor = new Date(cursor.getTime() + 24 * 60 * 60 * 1000);
    }
  } else if (granularity === "weekly") {
    let cursor = startOfWeek(range.from, { weekStartsOn: 1 });
    while (cursor <= range.to) {
      const weekEnd = endOfWeek(cursor, { weekStartsOn: 1 });
      buckets.push({
        start: new Date(
          Math.max(cursor.getTime(), range.from.getTime()),
        ),
        end: new Date(Math.min(weekEnd.getTime(), range.to.getTime())),
        label: format(cursor, "dd MMM"),
      });
      const result = new Date(cursor);
      result.setDate(result.getDate() + 7);
      cursor = result;
    }
  } else {
    let cursor = startOfMonth(range.from);
    while (cursor <= range.to) {
      const monthEnd = endOfMonth(cursor);
      buckets.push({
        start: new Date(
          Math.max(cursor.getTime(), range.from.getTime()),
        ),
        end: new Date(Math.min(monthEnd.getTime(), range.to.getTime())),
        label: format(cursor, "MMM yy"),
      });
      const result = new Date(cursor);
      result.setMonth(result.getMonth() + 1);
      cursor = result;
    }
  }

  return buckets;
}
