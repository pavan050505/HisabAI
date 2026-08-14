import type { TrendDirection, TrendInfo } from "../types";

const CURRENCY_FORMATTERS: Record<string, Intl.NumberFormat> = {};

export function getCurrencyFormatter(
  currency: string = "INR",
  locale: string = "en-IN",
): Intl.NumberFormat {
  const key = `${currency}_${locale}`;

  if (!CURRENCY_FORMATTERS[key]) {
    CURRENCY_FORMATTERS[key] = new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    });
  }

  return CURRENCY_FORMATTERS[key];
}

export function formatCurrency(
  amount: number,
  currency: string = "INR",
): string {
  if (amount === 0 || !amount) return `₹0`;

  try {
    const formatter = getCurrencyFormatter(currency);
    return formatter.format(amount);
  } catch {
    return `₹${amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
  }
}

export function formatNumber(value: number): string {
  return value.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

export function formatPercentage(value: number, fractionDigits = 1): string {
  return `${value >= 0 ? "" : ""}${value.toFixed(fractionDigits)}%`;
}

export function calculateTrend(
  currentValue: number,
  previousValue: number,
): TrendInfo {
  if (previousValue === 0 && currentValue === 0) {
    return {
      direction: "neutral",
      percentage: 0,
      absolute: 0,
    };
  }

  if (previousValue === 0) {
    return {
      direction: currentValue > 0 ? "up" : "down",
      percentage: currentValue > 0 ? 100 : -100,
      absolute: currentValue,
    };
  }

  const absolute = currentValue - previousValue;
  const percentage = (absolute / Math.abs(previousValue)) * 100;

  let direction: TrendDirection = "neutral";
  if (percentage > 0.5) direction = "up";
  else if (percentage < -0.5) direction = "down";

  return {
    direction,
    percentage: Math.round(percentage * 10) / 10,
    absolute,
  };
}

export function getTrendColor(direction: TrendDirection): string {
  switch (direction) {
    case "up":
      return "text-emerald-600";
    case "down":
      return "text-rose-600";
    default:
      return "text-muted-foreground";
  }
}

export function getTrendBg(direction: TrendDirection): string {
  switch (direction) {
    case "up":
      return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    case "down":
      return "bg-rose-50 text-rose-700 ring-rose-200";
    default:
      return "bg-muted text-muted-foreground ring-border";
  }
}
