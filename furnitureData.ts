// Generated TypeScript export for ModernFurniture Co. Analytics Store
// Regenerated from the REAL orders_data.csv (via scripts/build_full_analytics_fixed.py) —
// productType, order counts and revenue now come directly from the provided dataset.
import rawStore from './analyticsStore.json';

export interface OrderRecord {
  id: number;
  customerId: string;
  productType: string; // real values: Bookshelf, Office Desk, Dining Table, Sideboard, Media Console
  inquiryText: string;
  materialType: string;
  materialQty: number;
  materialCost: number;
  quotePrice: number;
  actualRevenue: number; // 0 unless status === 'DELIVERED'
  status: 'DESIGN' | 'MILLING' | 'JOINERY' | 'FINISHING' | 'DELIVERED' | 'LOST';
  currentStage: string;
  complexity: number | null;
  creationDate: string;
  acceptanceDate: string | null;
  completionDate: string | null;
  dueDate: string | null;
  deliveryStatus: 'On Time' | 'Late';
  lateDays: number;
  penaltyPct: number;
  isLate: boolean;
  leadTimeDays: number | null;
  designerId: string | null;
  designerSkill: string;
  designHours: number;
  millingHours: number;
  joineryHours: number;
  finishingHours: number;
  totalLaborHours: number;
  estimatedLaborCost: number;
  grossProfit: number | null; // null for non-delivered orders (no realised revenue yet)
  profitMargin: number | null;
  startDate: string; // back-compat alias for creationDate
}

export interface ProductProfitabilityRecord {
  productType: string;
  totalInquiries: number;
  deliveredOrderCount: number;
  lostCount: number;
  winRatePct: number | null;
  totalRevenue: number;
  materialCost: number;
  laborCost: number;
  grossProfit: number;
  profitMargin: number;
  avgLeadTime: number | null;
  lateRate: number | null;
  orderCount: number; // back-compat alias for deliveredOrderCount
}

export interface QuarterlyFinancialRecord {
  quarter: string;
  revenue: number;
  wages: number;
  overheads: number;
  timberCost: number;
  totalCosts: number;
  netProfit: number;
  profitMargin: number;
  ordersCompleted: number;
}

export interface MonthlyFinancialRecord {
  month: string;
  revenue: number;
  costs: number;
  wages: number;
  overheads: number;
  timber: number;
  netCash: number;
}

export interface MaterialSummaryRecord {
  material: string;
  unitCost: number;
  totalConsumedM3: number;
  totalReorderedM3: number;
  totalSpent: number;
  reorderCount: number;
  criticalLowEvents: number;
  stockoutDates: string[];
}

export interface BottleneckSummary {
  slowestStageByAvgHours: string;
  avgHoursByStage: { design: number; milling: number; joinery: number; finishing: number };
  lateDeliveryRateByQuarter: Record<string, number>;
  note: string;
}

// Legacy per-quarter shape (back-compat), now computed live from real data instead of hardcoded.
export interface BottleneckRecord {
  quarter: string;
  title: string;
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  type: string;
  rootCause: string;
  operationalImpact: string;
  metrics: string;
}

export interface AnalyticsStoreType {
  orders: OrderRecord[];
  productProfitability: ProductProfitabilityRecord[];
  quarterlyData: QuarterlyFinancialRecord[];
  monthlyData: MonthlyFinancialRecord[];
  materialSummary: MaterialSummaryRecord[];
  bottleneckSummary: BottleneckSummary;
  bottlenecks: BottleneckRecord[]; // back-compat alias, real per-quarter data
  employees: { employeeId: string; role: string; skillLevel: string; status: string; wage: string }[];
  hrEvents: { date: string; event: string; employeeId: string; details: string }[];
  dataScopeNote: string;
  totals: {
    totalOrders: number;
    deliveredOrders: number;
    lostOrders: number;
    inProductionOrders: number;
    overallWinRatePct: number | null;
    fullPipelineQuotedRevenue: number; // full orders_data.csv period (2025-01-02 to 2027-01-01)
    ledgerPeriod: string;              // financial_ledger.csv only covers this shorter window
    ledgerRevenue: number;
    ledgerCosts: number;
    ledgerNetCashFlow: number;
    deliveredOrdersWithinLedgerWindow: number;
    activeStaff: number;
    resignedStaff: number;
    // Back-compat aliases (point at the ledger-period figures — NOT the same window as fullPipelineQuotedRevenue)
    totalRevenue: number;
    totalCosts: number;
    netCashFlow: number;
  };
}

export const analyticsStore = rawStore as unknown as AnalyticsStoreType;
export default analyticsStore;
