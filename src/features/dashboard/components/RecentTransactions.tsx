"use client";

import Link from "next/link";
import { format } from "date-fns";
import {
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Wallet,
  Banknote,
  CircleDot,
  ArrowRight,
  Plus,
  RefreshCw,
  Receipt,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { TransactionSummary } from "../types";
import { formatCurrency } from "../calculations/formatting";

interface RecentTransactionsProps {
  transactions: TransactionSummary[];
  currency?: string;
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
}

const PAYMENT_METHOD_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  CASH: Wallet,
  UPI: Banknote,
  BANK: CreditCard,
  OTHER: CircleDot,
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH: "Cash",
  UPI: "UPI",
  BANK: "Bank",
  OTHER: "Other",
};

function getTypeBadgeClass(type: "CREDIT" | "DEBIT") {
  return type === "CREDIT"
    ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
    : "bg-rose-50 text-rose-700 ring-rose-200";
}

function getTypeTextClass(type: "CREDIT" | "DEBIT") {
  return type === "CREDIT" ? "text-emerald-700" : "text-rose-700";
}

function getAmountPrefix(type: "CREDIT" | "DEBIT") {
  return type === "CREDIT" ? "+" : "-";
}

function renderStatusPill(status: string) {
  const normalized = status.toLowerCase();

  let styles =
    "bg-muted text-muted-foreground ring-border";

  if (normalized.includes("received") || normalized === "paid") {
    styles = "bg-emerald-50 text-emerald-700 ring-emerald-200";
  } else if (normalized.includes("billed")) {
    styles = "bg-sky-50 text-sky-700 ring-sky-200";
  } else if (normalized.includes("pending")) {
    styles = "bg-amber-50 text-amber-700 ring-amber-200";
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset sm:text-xs",
        styles,
      )}
    >
      {status}
    </span>
  );
}

function PaymentMethodBadge({ method }: { method: string | null }) {
  if (!method) return null;

  const Icon = PAYMENT_METHOD_ICONS[method] || CircleDot;
  const label = PAYMENT_METHOD_LABELS[method] || method;

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground ring-1 ring-inset ring-border sm:text-xs"
      title={`Paid via ${label}`}
    >
      <Icon className="h-3 w-3 shrink-0" aria-hidden="true" />
      <span className="hidden sm:inline">{label}</span>
    </span>
  );
}

function TransactionRow({
  tx,
  currency,
}: {
  tx: TransactionSummary;
  currency: string;
}) {
  const dateObj = new Date(tx.date);

  return (
    <tr className="border-b border-border/60 last:border-0 transition-colors hover:bg-muted/30">
      <td className="py-3 pr-2 align-top sm:py-4 sm:pr-4">
        <div className="flex flex-col">
          <time
            dateTime={dateObj.toISOString()}
            className="text-sm font-medium tabular-nums text-foreground"
          >
            {format(dateObj, "dd MMM")}
          </time>
          <span className="text-[11px] text-muted-foreground tabular-nums hidden sm:inline">
            {format(dateObj, "HH:mm")}
          </span>
        </div>
      </td>

      <td className="min-w-0 py-3 pr-2 align-top sm:py-4 sm:pr-4">
        <div className="flex flex-col gap-1.5">
          <p className="truncate text-sm font-medium text-foreground">
            {tx.description}
          </p>
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset",
                getTypeBadgeClass(tx.type),
              )}
            >
              {tx.type === "CREDIT" ? (
                <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
              ) : (
                <ArrowDownRight className="h-3 w-3" aria-hidden="true" />
              )}
              <span className="sr-only">
                {tx.type === "CREDIT" ? "Income" : "Expense"}
              </span>
              {tx.category}
            </span>
            <PaymentMethodBadge method={tx.paymentMethod} />
            {renderStatusPill(tx.status)}
          </div>
        </div>
      </td>

      <td className="py-3 align-top text-right sm:py-4">
        <div
          className={cn(
            "text-sm font-semibold tabular-nums sm:text-base",
            getTypeTextClass(tx.type),
          )}
        >
          <span aria-hidden="true">{getAmountPrefix(tx.type)}</span>
          {formatCurrency(tx.amount, currency)}
          <span className="sr-only">
            {tx.type === "CREDIT" ? " income" : " expense"}
          </span>
        </div>
      </td>
    </tr>
  );
}

function RecentTransactionsTable({
  transactions,
  currency,
}: {
  transactions: TransactionSummary[];
  currency: string;
}) {
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 px-4 py-12 text-center sm:px-6 sm:py-16">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-full bg-muted"
          aria-hidden="true"
        >
          <Receipt className="h-6 w-6 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-foreground">
            No transactions yet
          </h3>
          <p className="max-w-xs text-xs text-muted-foreground sm:text-sm">
            Add your first income or expense to start tracking your business
            finances.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link href="/transactions?tab=income">
            <Button size="sm" className="gap-1.5">
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              Add Income
            </Button>
          </Link>
          <Link href="/transactions?tab=expense">
            <Button size="sm" variant="outline" className="gap-1.5">
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              Add Expense
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate border-spacing-0">
        <thead>
          <tr className="text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <th
              scope="col"
              className="w-24 border-b border-border/80 pb-2 pr-2 sm:pr-4"
            >
              Date
            </th>
            <th
              scope="col"
              className="border-b border-border/80 pb-2 pr-2 sm:pr-4"
            >
              Description
            </th>
            <th
              scope="col"
              className="border-b border-border/80 pb-2 text-right"
            >
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <TransactionRow key={String(tx.id)} tx={tx} currency={currency} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr className="border-b border-border/60 last:border-0">
      <td className="py-3 pr-2 sm:py-4 sm:pr-4">
        <div className="space-y-1.5">
          <div className="h-4 w-16 animate-pulse rounded bg-muted" />
          <div className="h-3 w-10 animate-pulse rounded bg-muted hidden sm:block" />
        </div>
      </td>
      <td className="min-w-0 py-3 pr-2 sm:py-4 sm:pr-4">
        <div className="space-y-2">
          <div className="h-4 w-56 max-w-[60vw] animate-pulse rounded bg-muted" />
          <div className="flex gap-1.5">
            <div className="h-5 w-20 animate-pulse rounded-full bg-muted" />
            <div className="h-5 w-14 animate-pulse rounded-full bg-muted" />
          </div>
        </div>
      </td>
      <td className="py-3 text-right sm:py-4">
        <div className="ml-auto h-5 w-24 animate-pulse rounded bg-muted" />
      </td>
    </tr>
  );
}

function LoadingState({ rows = 6 }: { rows?: number }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate border-spacing-0">
        <thead>
          <tr className="text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <th
              scope="col"
              className="w-24 border-b border-border/80 pb-2 pr-2 sm:pr-4"
            >
              <div className="h-3 w-10 animate-pulse rounded bg-muted" />
            </th>
            <th
              scope="col"
              className="border-b border-border/80 pb-2 pr-2 sm:pr-4"
            >
              <div className="h-3 w-24 animate-pulse rounded bg-muted" />
            </th>
            <th
              scope="col"
              className="border-b border-border/80 pb-2 text-right"
            >
              <div className="ml-auto h-3 w-16 animate-pulse rounded bg-muted" />
            </th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-4 py-12 text-center sm:px-6 sm:py-16">
      <div
        className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50"
        aria-hidden="true"
      >
        <RefreshCw className="h-6 w-6 text-rose-600" />
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-foreground">
          Unable to load transactions
        </h3>
        <p className="max-w-xs text-xs text-muted-foreground sm:text-sm">
          We couldn&apos;t fetch your recent transactions. Please try again.
        </p>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onRetry}
        className="gap-1.5"
      >
        <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
        Try Again
      </Button>
    </div>
  );
}

export function RecentTransactions({
  transactions,
  currency = "INR",
  loading = false,
  error = false,
  onRetry,
}: RecentTransactionsProps) {
  return (
    <Card aria-labelledby="recent-transactions-title">
      <CardHeader className="flex-row items-center justify-between gap-3 space-y-0 px-4 py-4 sm:px-6 sm:py-5">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Receipt
              className="h-4 w-4 text-muted-foreground shrink-0"
              aria-hidden="true"
            />
            <CardTitle
              id="recent-transactions-title"
              className="text-sm font-semibold tracking-tight sm:text-base"
            >
              Recent Transactions
            </CardTitle>
          </div>
        </div>
        <Link href="/transactions" className="shrink-0">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 h-7 -my-1 -mr-2"
          >
            <span className="text-xs sm:text-sm">View all</span>
            <ArrowRight
              className="h-3.5 w-3.5 opacity-60"
              aria-hidden="true"
            />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="px-3 sm:px-6 pb-4 sm:pb-5">
        {error ? (
          <ErrorState onRetry={onRetry} />
        ) : loading ? (
          <LoadingState />
        ) : (
          <RecentTransactionsTable
            transactions={transactions}
            currency={currency}
          />
        )}
      </CardContent>
    </Card>
  );
}
