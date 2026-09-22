// Types for ModernFurniture Co. Analytics Platform

export interface OrderItem {
  id: number;
  customerId: number;
  productType: string;
  inquiryText: string;
  status: 'LOST' | 'DELIVERED' | 'DESIGN' | 'MILLING' | 'JOINERY' | 'FINISHING';
  currentStage: string;
  complexity: number;
  designHours: number;
  millingHours: number;
  joineryHours: number;
  finishingHours: number;
  totalLaborHours: number;
  materialType: string;
  materialQty: number;
  materialCost: number;
  quotePrice: number;
  creationDate: string;
  completionDate?: string;
  acceptanceDate?: string;
  dueDate?: string;
  deliveryStatus: 'On Time' | 'Late';
  lateDays: number;
  penaltyPct: number;
  actualRevenue: number;
  grossProfit: number;
  profitMargin: number;
}

export interface CashTransaction {
  date: string;
  day: number;
  type: 'COST' | 'REVENUE';
  amount: number;
  description: string;
}

export interface HrEvent {
  date: string;
  event: 'Leave Start' | 'Leave End' | 'Resignation' | 'Hired';
  employeeId: string;
  details: string;
}

export interface Employee {
  employeeId: string;
  role: 'designer' | 'maker';
  skillLevel: 'high' | 'low';
  status: 'Active' | 'Resigned';
  wage: number;
}

export interface MaterialLog {
  date: string;
  material: string;
  type: 'CONSUME' | 'REORDER';
  quantity: number;
  orderId: string;
  newLevel: number;
}

export interface DesignerLog {
  orderId: number;
  designerId: string;
  designerSkill: string;
  startDate: string;
  endDate?: string;
  durationDays: number;
}

export interface AnalyticalSummary {
  totalInquiries: number;
  acceptedOrders: number;
  conversionRate: number;
  deliveredOrders: number;
  inProgressOrders: number;
  lateOrders: number;
  onTimeDeliveryRate: number;
  totalRevenue: number;
  totalCosts: number;
  netCashFlow: number;
  totalMaterialCost: number;
  estimatedLaborCost: number;
  productProfitability: {
    productType: string;
    totalOrders: number;
    deliveredCount: number;
    quoteSum: number;
    actualRevenue: number;
    materialCost: number;
    grossProfit: number;
    profitMargin: number;
    avgLaborHours: number;
    lateCount: number;
  }[];
  materialStats: {
    material: string;
    totalConsumed: number;
    reorderCount: number;
    costSpent: number;
  }[];
  quarterlyBreakdown: {
    quarter: string;
    delivered: number;
    late: number;
    revenue: number;
    latePenaltyLoss: number;
  }[];
  bottlenecks: {
    period: string;
    description: string;
    cause: string;
    impact: string;
    lateOrdersCount: number;
  }[];
}

export interface QueryInsightResponse {
  answer: string;
  keyMetrics?: { label: string; value: string | number; change?: string }[];
  suggestedCharts?: ('profitability' | 'bottleneck' | 'cashflow' | 'staffing' | 'orders')[];
  dataContextUsed: string[];
  isUnsure: boolean;
}
