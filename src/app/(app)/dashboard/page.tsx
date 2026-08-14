import { redirect } from "next/navigation";
import { Suspense } from "react";

import type { DateRangeKey } from "@/features/dashboard/types";
import { getDateRange } from "@/features/dashboard/calculations/date-ranges";

import { DashboardHeader } from "@/features/dashboard/components/DashboardHeader";
import { DashboardDateFilterWithNavigation } from "@/features/dashboard/components/DashboardDateFilterWithNavigation";
import { WelcomeSection } from "@/features/dashboard/components/WelcomeSection";
import { QuickActions } from "@/features/dashboard/components/QuickActions";
import { MetricCard } from "@/features/dashboard/components/MetricCard";
import { RecentTransactions } from "@/features/dashboard/components/RecentTransactions";

import {
  fetchDashboardData,
  getCurrentUserAndBusiness,
} from "@/features/dashboard/queries/dashboard-queries";

interface DashboardPageProps {
  searchParams: Promise<{ range?: string }>;
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const resolvedSearchParams = await searchParams;
  const rangeKey: DateRangeKey =
    (resolvedSearchParams.range as DateRangeKey) || "this-month";

  const { profile, business, allBusinesses } =
    await getCurrentUserAndBusiness();

  if (!profile) {
    redirect("/login");
  }

  if (!business) {
    redirect("/setup-business");
  }

  const dateRange = getDateRange(rangeKey);

  const dashboardData = await fetchDashboardData(
    business.id,
    dateRange,
  );

  const currency = business.currency || "INR";

  const kpis = dashboardData?.kpis;
  const recentTransactions = dashboardData?.recentTransactions ?? [];
  const hasQueryError = dashboardData === null;

  return (
    <div className="flex min-h-screen flex-col">
      <Suspense fallback={<div className="h-16 border-b bg-background" />}>
        <DashboardHeader
          businessName={business.name}
          businessType={business.businessType || "Business"}
          userName={profile.name}
          userEmail={profile.email}
          allBusinesses={allBusinesses.map((b) => ({
            id: b.id,
            name: b.name,
            businessType: b.businessType,
          }))}
          dateFilter={<DashboardDateFilterWithNavigation />}
        />
      </Suspense>

      <div className="flex-1 space-y-6 px-3 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <Suspense fallback={<WelcomeSectionSkeleton />}>
          <WelcomeSection
            profile={profile}
            business={business}
            range={dateRange}
          />
        </Suspense>

        <div className="md:hidden">
          <Suspense fallback={<div className="h-10" />}>
            <DashboardDateFilterWithNavigation />
          </Suspense>
        </div>

        <Suspense fallback={<QuickActionsSkeleton />}>
          <QuickActions />
        </Suspense>

        <section aria-label="Key metrics">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Overview
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <Suspense fallback={<MetricCardSkeleton />}>
              <MetricCard
                currency={currency}
                data={{
                  label: "Total Revenue",
                  value: kpis?.totalRevenue ?? 0,
                  icon: "revenue",
                  description: "All income in this period",
                  emptyStateMessage:
                    "No income recorded yet. Add your first sale.",
                  viewDetailsHref: "/transactions",
                  accent: "positive",
                }}
              />
            </Suspense>

            <Suspense fallback={<MetricCardSkeleton />}>
              <MetricCard
                currency={currency}
                data={{
                  label: "Total Expenses",
                  value: kpis?.totalExpenses ?? 0,
                  icon: "expenses",
                  description: "All business expenses",
                  emptyStateMessage:
                    "No expenses recorded yet.",
                  viewDetailsHref: "/transactions",
                }}
              />
            </Suspense>

            <Suspense fallback={<MetricCardSkeleton />}>
              <MetricCard
                currency={currency}
                data={{
                  label: "Net Profit",
                  value: kpis?.netProfit ?? 0,
                  icon: "profit",
                  description: "Revenue minus expenses",
                  emptyStateMessage:
                    "No activity yet. Profit will appear here.",
                  viewDetailsHref: "/transactions",
                  accent:
                    kpis && kpis.netProfit >= 0 ? "positive" : "negative",
                }}
              />
            </Suspense>

            <Suspense fallback={<MetricCardSkeleton />}>
              <MetricCard
                currency={currency}
                data={{
                  label: "Money Retained",
                  value: kpis?.moneyRetained ?? 0,
                  icon: "savings",
                  description: "Profit kept as cash",
                  emptyStateMessage:
                    "No retained savings yet.",
                }}
              />
            </Suspense>

            <Suspense fallback={<MetricCardSkeleton />}>
              <MetricCard
                currency={currency}
                data={{
                  label: "Cash Available",
                  value: kpis?.cashAvailable ?? 0,
                  icon: "cash",
                  description: "Balance from payments received",
                  emptyStateMessage:
                    "No cash balance yet. Record payments received.",
                }}
              />
            </Suspense>

            <Suspense fallback={<MetricCardSkeleton />}>
              <MetricCard
                currency={currency}
                data={{
                  label: "Pending Receivables",
                  value: kpis?.pendingReceivables ?? 0,
                  icon: "receivables",
                  description: "Money customers owe you",
                  emptyStateMessage:
                    "No outstanding receivables.",
                  viewDetailsHref: "/customers",
                }}
              />
            </Suspense>

            <Suspense fallback={<MetricCardSkeleton />}>
              <MetricCard
                currency={currency}
                data={{
                  label: "Pending Payables",
                  value: kpis?.pendingPayables ?? 0,
                  icon: "payables",
                  description: "Money you owe suppliers",
                  emptyStateMessage:
                    "No supplier payables tracked yet.",
                }}
              />
            </Suspense>

            <Suspense fallback={<MetricCardSkeleton />}>
              <MetricCard
                currency={currency}
                data={{
                  label: "Orders / Sales",
                  value: kpis?.ordersCount ?? 0,
                  icon: "orders",
                  description: "Number of sales recorded",
                  emptyStateMessage:
                    "No orders recorded yet.",
                  viewDetailsHref: "/transactions",
                }}
              />
            </Suspense>
          </div>
        </section>

        <section aria-label="Recent transactions">
          <Suspense fallback={<RecentTransactionsSkeleton />}>
            <RecentTransactions
              transactions={recentTransactions}
              currency={currency}
              loading={!dashboardData}
              error={hasQueryError}
            />
          </Suspense>
        </section>
      </div>
    </div>
  );
}

function WelcomeSectionSkeleton() {
  return (
    <section className="space-y-2">
      <div className="h-8 w-64 animate-pulse rounded bg-muted sm:h-9 sm:w-80" />
      <div className="h-4 w-80 animate-pulse rounded bg-muted sm:w-96" />
      <div className="h-3 w-48 animate-pulse rounded bg-muted" />
    </section>
  );
}

function QuickActionsSkeleton() {
  return (
    <section>
      <div className="h-4 w-28 animate-pulse rounded bg-muted mb-3" />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 md:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-xl ring-1 ring-foreground/10 bg-muted/30"
          />
        ))}
      </div>
    </section>
  );
}

function MetricCardSkeleton() {
  return (
    <div className="rounded-xl ring-1 ring-foreground/10 bg-card p-5">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-3 w-20 animate-pulse rounded bg-muted" />
            <div className="h-7 w-28 animate-pulse rounded bg-muted sm:h-8" />
          </div>
          <div className="h-9 w-9 animate-pulse rounded-lg bg-muted" />
        </div>
        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}

function RecentTransactionsSkeleton() {
  return (
    <div className="rounded-xl ring-1 ring-foreground/10 bg-card overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-4 py-4 sm:px-6 sm:py-5 border-b border-border/60">
        <div className="h-5 w-44 animate-pulse rounded bg-muted" />
        <div className="h-7 w-20 animate-pulse rounded-lg bg-muted" />
      </div>
      <div className="px-3 sm:px-6 pb-4 sm:pb-5 pt-3 sm:pt-4">
        <div className="space-y-0.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex items-start gap-3 py-3 sm:py-4 border-b border-border/60 last:border-0"
            >
              <div className="space-y-1.5 shrink-0 w-24 sm:pr-2">
                <div className="h-4 w-16 animate-pulse rounded bg-muted" />
                <div className="h-3 w-10 animate-pulse rounded bg-muted hidden sm:block" />
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-4 w-56 max-w-[50vw] animate-pulse rounded bg-muted" />
                <div className="flex gap-1.5">
                  <div className="h-5 w-20 animate-pulse rounded-full bg-muted" />
                  <div className="h-5 w-14 animate-pulse rounded-full bg-muted" />
                </div>
              </div>
              <div className="ml-auto shrink-0">
                <div className="h-5 w-24 animate-pulse rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
