import type { DashboardKPIs, TodaySummary } from "../types";
import type { DateRange } from "../types";
import { generateDateBuckets } from "./date-ranges";
import { calculateTrend } from "./formatting";
import type {
  ChartDataPoint,
  CashFlowPoint,
  ExpenseCategoryPoint,
  PendingReceivable,
  TransactionSummary,
  AlertItem,
  BusinessHealthSummary,
} from "../types";

interface RawTransaction {
  id: number;
  amount: number;
  type: "CREDIT" | "DEBIT";
  description: string | null;
  createdAt: Date;
  customerId: number;
  customer?: {
    name: string;
  };
}

interface RawPayment {
  id: number;
  amount: number;
  method: "CASH" | "UPI" | "BANK" | "OTHER";
  createdAt: Date;
  customerId: number;
  customer?: {
    name: string;
  };
}

interface RawCustomer {
  id: number;
  name: string;
  phone: string | null;
  transactions: RawTransaction[];
  payments: RawPayment[];
}

export function sumAmounts(
  items: Array<{ amount: number }> | undefined | null,
): number {
  if (!items || items.length === 0) return 0;
  return items.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0,
  );
}

export function calculateKPIs(
  currentTransactions: RawTransaction[],
  previousTransactions: RawTransaction[],
  customers: RawCustomer[],
  allPayments: RawPayment[],
): DashboardKPIs {
  const currentCredits = currentTransactions.filter(
    (t) => t.type === "CREDIT",
  );
  const currentDebits = currentTransactions.filter(
    (t) => t.type === "DEBIT",
  );

  const totalRevenue = sumAmounts(currentCredits);
  const totalExpenses = sumAmounts(currentDebits);
  const netProfit = totalRevenue - totalExpenses;

  const cashIn = sumAmounts(allPayments);
  const cashOut = totalExpenses;
  const cashAvailable = Math.max(0, cashIn - cashOut);

  const moneyRetained =
    netProfit > 0 ? Math.min(netProfit, cashAvailable) : 0;

  const pendingReceivables = customers.reduce((total, customer) => {
    const customerCredits = sumAmounts(
      customer.transactions.filter((t) => t.type === "CREDIT"),
    );
    const customerPayments = sumAmounts(customer.payments);
    const balance = customerCredits - customerPayments;
    return total + Math.max(0, balance);
  }, 0);

  const pendingPayables = 0;

  const ordersCount = currentCredits.length;

  const employeePayments = 0;

  return {
    totalRevenue,
    totalExpenses,
    netProfit,
    moneyRetained,
    cashAvailable,
    pendingReceivables,
    pendingPayables,
    ordersCount,
    employeePayments,
  };
}

export function calculateTodaySummary(
  todayTransactions: RawTransaction[],
  todayPayments: RawPayment[],
  customers: RawCustomer[],
): TodaySummary {
  const todayCredits = todayTransactions.filter(
    (t) => t.type === "CREDIT",
  );
  const todayDebits = todayTransactions.filter((t) => t.type === "DEBIT");

  const income = sumAmounts(todayCredits);
  const expenses = sumAmounts(todayDebits);
  const paymentsReceived = sumAmounts(todayPayments);

  const sales = income;
  const orders = todayCredits.length;

  const totalReceivables = customers.reduce((total, customer) => {
    const customerCredits = sumAmounts(
      customer.transactions.filter((t) => t.type === "CREDIT"),
    );
    const customerPayments = sumAmounts(customer.payments);
    return total + Math.max(0, customerCredits - customerPayments);
  }, 0);

  return {
    sales,
    income,
    expenses,
    profit: income - expenses,
    orders,
    paymentsReceived,
    paymentsPending: totalReceivables,
  };
}

export function buildRevenueExpenseChart(
  transactions: RawTransaction[],
  range: DateRange,
): ChartDataPoint[] {
  const buckets = generateDateBuckets(range);

  return buckets.map((bucket) => {
    const inBucket = transactions.filter(
      (t) =>
        new Date(t.createdAt) >= bucket.start &&
        new Date(t.createdAt) <= bucket.end,
    );

    const revenue = sumAmounts(
      inBucket.filter((t) => t.type === "CREDIT"),
    );
    const expenses = sumAmounts(
      inBucket.filter((t) => t.type === "DEBIT"),
    );

    return {
      period: bucket.label,
      date: bucket.start,
      revenue,
      expenses,
      profit: revenue - expenses,
    };
  });
}

export function buildProfitTrendChart(
  transactions: RawTransaction[],
  range: DateRange,
): ChartDataPoint[] {
  return buildRevenueExpenseChart(transactions, range);
}

export function buildCashFlowChart(
  transactions: RawTransaction[],
  payments: RawPayment[],
  range: DateRange,
): CashFlowPoint[] {
  const buckets = generateDateBuckets(range);

  return buckets.map((bucket) => {
    const txInBucket = transactions.filter(
      (t) =>
        new Date(t.createdAt) >= bucket.start &&
        new Date(t.createdAt) <= bucket.end,
    );
    const pmtInBucket = payments.filter(
      (p) =>
        new Date(p.createdAt) >= bucket.start &&
        new Date(p.createdAt) <= bucket.end,
    );

    const moneyIn = sumAmounts(pmtInBucket);
    const moneyOut = sumAmounts(
      txInBucket.filter((t) => t.type === "DEBIT"),
    );

    return {
      period: bucket.label,
      date: bucket.start,
      moneyIn,
      moneyOut,
      net: moneyIn - moneyOut,
    };
  });
}

export function buildExpenseBreakdown(
  transactions: RawTransaction[],
): ExpenseCategoryPoint[] {
  const debits = transactions.filter((t) => t.type === "DEBIT");

  const categoryMap = new Map<string, number>();

  for (const tx of debits) {
    const category = tx.description?.trim() || "Other";
    const current = categoryMap.get(category) || 0;
    categoryMap.set(category, current + Number(tx.amount));
  }

  const result: ExpenseCategoryPoint[] = [];
  categoryMap.forEach((amount, category) => {
    result.push({ category, amount });
  });

  result.sort((a, b) => b.amount - a.amount);

  return result;
}

export function buildRecentTransactions(
  transactions: RawTransaction[],
  payments: RawPayment[],
  limit = 10,
): TransactionSummary[] {
  const combined: Array<{
    _id: string;
    date: Date;
    description: string;
    category: string;
    type: "CREDIT" | "DEBIT";
    paymentMethod: string | null;
    amount: number;
    status: string;
    _sort: number;
  }> = [];

  for (const tx of transactions) {
    const customerName = tx.customer?.name?.trim();
    let description = tx.description?.trim() || "";
    if (!description) {
      if (tx.type === "CREDIT") {
        description = customerName
          ? `Sale to ${customerName}`
          : "Sale / Income";
      } else {
        description = customerName
          ? `Payment to ${customerName}`
          : "Expense";
      }
    } else if (customerName) {
      description = `${description} · ${customerName}`;
    }

    combined.push({
      _id: `tx-${tx.id}`,
      date: new Date(tx.createdAt),
      description,
      category: tx.type === "CREDIT" ? "Sales" : "General",
      type: tx.type,
      paymentMethod: null,
      amount: Number(tx.amount),
      status: tx.type === "CREDIT" ? "Billed" : "Paid",
      _sort: new Date(tx.createdAt).getTime(),
    });
  }

  for (const pmt of payments) {
    const customerName = pmt.customer?.name?.trim();
    combined.push({
      _id: `pmt-${pmt.id}`,
      date: new Date(pmt.createdAt),
      description: customerName
        ? `Payment from ${customerName}`
        : "Payment received",
      category: "Payments",
      type: "CREDIT",
      paymentMethod: pmt.method,
      amount: Number(pmt.amount),
      status: "Received",
      _sort: new Date(pmt.createdAt).getTime() + 1,
    });
  }

  combined.sort((a, b) => b._sort - a._sort);

  return combined.slice(0, limit).map((item) => ({
    id: item._id,
    date: item.date,
    description: item.description,
    category: item.category,
    type: item.type,
    paymentMethod: item.paymentMethod,
    amount: item.amount,
    status: item.status,
  }));
}

export function buildPendingReceivables(
  customers: RawCustomer[],
  limit = 5,
): PendingReceivable[] {
  const result: PendingReceivable[] = [];

  for (const customer of customers) {
    const totalCredits = sumAmounts(
      customer.transactions.filter((t) => t.type === "CREDIT"),
    );
    const totalPayments = sumAmounts(customer.payments);
    const balance = totalCredits - totalPayments;

    if (balance > 0.01) {
      const lastPayment = [...customer.payments].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime(),
      )[0];

      result.push({
        customerId: customer.id,
        customerName: customer.name,
        phone: customer.phone,
        amount: balance,
        lastPaymentDate: lastPayment
          ? new Date(lastPayment.createdAt)
          : null,
        dueDate: null,
      });
    }
  }

  result.sort((a, b) => b.amount - a.amount);
  return result.slice(0, limit);
}

export function buildAlerts(
  kpis: DashboardKPIs,
  customers: RawCustomer[],
): AlertItem[] {
  const alerts: AlertItem[] = [];

  const overdueCustomers: RawCustomer[] = [];
  for (const customer of customers) {
    const totalCredits = sumAmounts(
      customer.transactions.filter((t) => t.type === "CREDIT"),
    );
    const totalPayments = sumAmounts(customer.payments);
    if (totalCredits - totalPayments > 0.01) {
      overdueCustomers.push(customer);
    }
  }

  if (overdueCustomers.length > 0) {
    const totalOverdue = overdueCustomers.reduce((sum, c) => {
      const credits = sumAmounts(
        c.transactions.filter((t) => t.type === "CREDIT"),
      );
      const payments = sumAmounts(c.payments);
      return sum + (credits - payments);
    }, 0);

    alerts.push({
      id: "receivables-overdue",
      level: overdueCustomers.length >= 3 ? "warning" : "info",
      title: `${overdueCustomers.length} customer payment${overdueCustomers.length > 1 ? "s" : ""} pending`,
      description: "Customers have outstanding balances.",
      amount: totalOverdue,
      actionLabel: "View Receivables",
      actionHref: "/customers",
    });
  }

  if (kpis.cashAvailable < 1000 && kpis.totalRevenue > 0) {
    alerts.push({
      id: "low-cash",
      level: "warning",
      title: "Low cash balance",
      description:
        "Your available cash is running low. Review expenses and collections.",
      actionLabel: "View Cash Flow",
      actionHref: "/transactions",
    });
  }

  if (kpis.netProfit < 0 && kpis.totalRevenue > 0) {
    alerts.push({
      id: "negative-profit",
      level: "danger",
      title: "Expenses exceed revenue",
      description:
        "Your business is operating at a loss in this period. Review costs.",
      amount: Math.abs(kpis.netProfit),
      actionLabel: "Review Expenses",
      actionHref: "/transactions",
    });
  }

  return alerts;
}

export function buildBusinessHealth(
  currentKPIs: DashboardKPIs,
  previousKPIs: DashboardKPIs,
): BusinessHealthSummary {
  const revenueTrend = calculateTrend(
    currentKPIs.totalRevenue,
    previousKPIs.totalRevenue,
  );
  const expenseTrend = calculateTrend(
    currentKPIs.totalExpenses,
    previousKPIs.totalExpenses,
  );
  const profitTrend = calculateTrend(
    currentKPIs.netProfit,
    previousKPIs.netProfit,
  );
  const receivablesTrend = calculateTrend(
    currentKPIs.pendingReceivables,
    previousKPIs.pendingReceivables,
  );
  const payablesTrend = calculateTrend(
    currentKPIs.pendingPayables,
    previousKPIs.pendingPayables,
  );
  const cashPosition = calculateTrend(
    currentKPIs.cashAvailable,
    previousKPIs.cashAvailable,
  );

  let overallStatus: BusinessHealthSummary["overallStatus"] = "neutral";
  let overallMessage = "No prior period data for comparison.";

  if (
    currentKPIs.totalRevenue === 0 &&
    previousKPIs.totalRevenue === 0
  ) {
    overallMessage =
      "No recorded transactions yet. Add your first income or expense to start tracking.";
    overallStatus = "neutral";
  } else if (profitTrend.direction === "up") {
    overallMessage = `Your profit is ${Math.abs(profitTrend.percentage).toFixed(1)}% higher compared with the previous period.`;
    overallStatus = "good";
  } else if (currentKPIs.netProfit < 0) {
    overallMessage =
      "Expenses exceeded revenue in this period. Review cost structure.";
    overallStatus = "poor";
  } else if (
    expenseTrend.direction === "up" &&
    revenueTrend.direction !== "up"
  ) {
    overallMessage =
      "Expenses increased faster than revenue in this period.";
    overallStatus = "concerning";
  } else if (profitTrend.direction === "down") {
    overallMessage = `Profit declined by ${Math.abs(profitTrend.percentage).toFixed(1)}% compared with the previous period.`;
    overallStatus = "concerning";
  } else {
    overallMessage =
      "Business performance is stable in this period.";
    overallStatus = "good";
  }

  return {
    revenueTrend,
    expenseTrend,
    profitTrend,
    receivablesTrend,
    payablesTrend,
    cashPosition,
    overallMessage,
    overallStatus,
  };
}
