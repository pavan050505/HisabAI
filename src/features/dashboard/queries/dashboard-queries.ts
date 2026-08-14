import prisma from "@/lib/prisma";
import { createClient as createSupabaseClient } from "@/lib/supabase/server";

import type {
  BusinessInfo,
  DateRange,
  DashboardData,
  UserProfile,
} from "../types";

import {
  buildAlerts,
  buildBusinessHealth,
  buildCashFlowChart,
  buildExpenseBreakdown,
  buildPendingReceivables,
  buildProfitTrendChart,
  buildRecentTransactions,
  buildRevenueExpenseChart,
  calculateKPIs,
  calculateTodaySummary,
} from "../calculations/financial";

import {
  getDateRange,
  getPreviousPeriod,
} from "../calculations/date-ranges";

async function getAuthenticatedUserSafe(): Promise<{
  user: { id: string; email?: string };
  profile: UserProfile;
} | null> {
  try {
    const supabase = await createSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const profile: UserProfile = {
      id: user.id,
      name:
        (user.user_metadata?.full_name as string) ||
        (user.email?.split("@")[0] as string) ||
        "User",
      email: user.email || "",
      avatarUrl: (user.user_metadata?.avatar_url as string) || null,
    };

    return { user, profile };
  } catch {
    return null;
  }
}

export async function getCurrentUserAndBusiness(): Promise<{
  profile: UserProfile | null;
  business: BusinessInfo | null;
  allBusinesses: BusinessInfo[];
}> {
  const auth = await getAuthenticatedUserSafe();

  if (!auth) {
    return { profile: null, business: null, allBusinesses: [] };
  }

  const { user, profile } = auth;

  try {
    const supabase = await createSupabaseClient();

    let allBusinesses: BusinessInfo[] = [];

    for (let attempt = 0; attempt < 3; attempt++) {
      const { data: businessesRaw } = await supabase
        .from("businesses")
        .select("id, name, phone, email, address, currency, business_type")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      allBusinesses = (businessesRaw || []).map(
        (b: {
          id: number;
          name: string;
          phone: string | null;
          email: string | null;
          address: string | null;
          currency?: string;
          business_type?: string | null;
        }) => ({
          id: b.id,
          name: b.name,
          phone: b.phone || null,
          email: b.email || null,
          address: b.address || null,
          currency: b.currency || "INR",
          businessType: b.business_type || null,
        }),
      );

      if (allBusinesses.length > 0) break;
      await new Promise((r) => setTimeout(r, 200));
    }

    const business = allBusinesses[0] || null;

    return { profile, business, allBusinesses };
  } catch {
    return { profile, business: null, allBusinesses: [] };
  }
}

async function fetchAllCustomersWithData(businessId: number) {
  try {
    const results = await prisma.customer.findMany({
      where: { businessId },
      include: {
        transactions: true,
        payments: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return results.map((c) => ({
      ...c,
      transactions: c.transactions.map((t) => ({
        ...t,
        amount: Number(t.amount),
      })),
      payments: c.payments.map((p) => ({
        ...p,
        amount: Number(p.amount),
      })),
    }));
  } catch {
    return [];
  }
}

async function fetchAllTransactionsForBusiness(businessId: number) {
  try {
    const results = await prisma.transaction.findMany({
      where: {
        customer: {
          businessId,
        },
      },
      include: {
        customer: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return results.map((t) => ({
      ...t,
      amount: Number(t.amount),
    }));
  } catch {
    return [];
  }
}

async function fetchAllPaymentsForBusiness(businessId: number) {
  try {
    const results = await prisma.payment.findMany({
      where: {
        customer: {
          businessId,
        },
      },
      include: {
        customer: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return results.map((p) => ({
      ...p,
      amount: Number(p.amount),
    }));
  } catch {
    return [];
  }
}

function filterByRange<T extends { createdAt: Date }>(
  items: T[],
  range: DateRange,
) {
  return items.filter(
    (i) =>
      new Date(i.createdAt) >= range.from &&
      new Date(i.createdAt) <= range.to,
  );
}

export async function fetchDashboardData(
  businessId: number,
  range: DateRange,
): Promise<DashboardData | null> {
  if (!businessId) return null;

  try {
    const previousRange = getPreviousPeriod(range);

    const todayRange = getDateRange(
      "today",
      undefined,
      undefined,
      new Date(),
    );

    const [
      allTransactions,
      allPayments,
      customers,
    ] = await Promise.all([
      fetchAllTransactionsForBusiness(businessId),
      fetchAllPaymentsForBusiness(businessId),
      fetchAllCustomersWithData(businessId),
    ]);

    const currentTransactions = filterByRange(allTransactions, range);
    const previousTransactions = filterByRange(
      allTransactions,
      previousRange,
    );
    const todayTransactions = filterByRange(
      allTransactions,
      todayRange,
    );
    const todayPayments = filterByRange(allPayments, todayRange);
    const rangePayments = filterByRange(allPayments, range);

    const kpis = calculateKPIs(
      currentTransactions,
      previousTransactions,
      customers,
      rangePayments,
    );

    const previousKPIs = calculateKPIs(
      previousTransactions,
      [],
      [],
      [],
    );

    const revenueExpenseChart = buildRevenueExpenseChart(
      currentTransactions,
      range,
    );
    const profitTrendChart = buildProfitTrendChart(
      currentTransactions,
      range,
    );
    const expenseBreakdown = buildExpenseBreakdown(
      currentTransactions,
    );
    const cashFlow = buildCashFlowChart(
      currentTransactions,
      rangePayments,
      range,
    );

    const todaySummary = calculateTodaySummary(
      todayTransactions,
      todayPayments,
      customers,
    );
    const recentTransactions = buildRecentTransactions(
      allTransactions.slice(0, 50),
      allPayments.slice(0, 50),
      10,
    );
    const pendingReceivables = buildPendingReceivables(
      customers,
      5,
    );

    const pendingPayables: Array<{
      id: number;
      supplierName: string;
      amount: number;
      dueDate: Date | null;
    }> = [];

    const businessHealth = buildBusinessHealth(kpis, previousKPIs);
    const alerts = buildAlerts(kpis, customers);

    return {
      kpis,
      revenueExpenseChart,
      profitTrendChart,
      expenseBreakdown,
      cashFlow,
      todaySummary,
      recentTransactions,
      pendingReceivables,
      pendingPayables,
      businessHealth,
      alerts,
    };
  } catch (err) {
    console.error("Dashboard query error:", err);
    return null;
  }
}
