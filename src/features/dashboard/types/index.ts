export type DateRangeKey =
  | "today"
  | "yesterday"
  | "this-week"
  | "this-month"
  | "last-month"
  | "this-year"
  | "custom";

export interface DateRange {
  from: Date;
  to: Date;
  label: string;
  key: DateRangeKey;
}

export interface PeriodComparison {
  current: DateRange;
  previous: DateRange;
}

export type TrendDirection = "up" | "down" | "neutral";

export interface TrendInfo {
  direction: TrendDirection;
  percentage: number;
  absolute: number;
}

export interface MetricCardData {
  label: string;
  value: number;
  icon: string;
  description: string;
  trend?: TrendInfo;
  previousValue?: number;
  emptyStateMessage?: string;
  viewDetailsHref?: string;
  accent?: "default" | "positive" | "negative" | "info";
}

export interface TransactionSummary {
  id: string | number;
  date: Date;
  description: string;
  category: string;
  type: "CREDIT" | "DEBIT";
  paymentMethod: string | null;
  amount: number;
  status: string;
}

export interface PendingReceivable {
  customerId: number;
  customerName: string;
  phone: string | null;
  amount: number;
  lastPaymentDate: Date | null;
  dueDate: Date | null;
}

export interface PendingPayable {
  id: number;
  supplierName: string;
  amount: number;
  dueDate: Date | null;
}

export interface ChartDataPoint {
  period: string;
  date: Date;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface CashFlowPoint {
  period: string;
  date: Date;
  moneyIn: number;
  moneyOut: number;
  net: number;
}

export interface ExpenseCategoryPoint {
  category: string;
  amount: number;
}

export interface DashboardKPIs {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  moneyRetained: number;
  cashAvailable: number;
  pendingReceivables: number;
  pendingPayables: number;
  ordersCount: number;
  employeePayments: number;
}

export interface TodaySummary {
  sales: number;
  income: number;
  expenses: number;
  profit: number;
  orders: number;
  paymentsReceived: number;
  paymentsPending: number;
}

export interface AlertItem {
  id: string;
  level: "warning" | "danger" | "info";
  title: string;
  description: string;
  amount?: number;
  actionLabel: string;
  actionHref: string;
}

export interface BusinessHealthSummary {
  revenueTrend: TrendInfo;
  expenseTrend: TrendInfo;
  profitTrend: TrendInfo;
  receivablesTrend: TrendInfo;
  payablesTrend: TrendInfo;
  cashPosition: TrendInfo;
  overallMessage: string;
  overallStatus: "good" | "neutral" | "concerning" | "poor";
}

export interface DashboardData {
  kpis: DashboardKPIs;
  revenueExpenseChart: ChartDataPoint[];
  profitTrendChart: ChartDataPoint[];
  expenseBreakdown: ExpenseCategoryPoint[];
  cashFlow: CashFlowPoint[];
  todaySummary: TodaySummary;
  recentTransactions: TransactionSummary[];
  pendingReceivables: PendingReceivable[];
  pendingPayables: PendingPayable[];
  businessHealth: BusinessHealthSummary;
  alerts: AlertItem[];
}

export interface BusinessInfo {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  currency: string;
  businessType?: string | null;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
}
