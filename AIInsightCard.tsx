import React from "react";
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Info,
  ChevronRight,
  Clock,
  ArrowRight
} from "lucide-react";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import analyticsStore, { AnalyticsStoreType } from "../data/furnitureData";

export interface AIInsightResponse {
  answer: string;
  keyFindings?: string[];
  keyMetrics?: { label: string; value: string | number; change?: string }[];
  suggestedChart?: string;
  suggestedFollowUps?: string[];
  isUnsure?: boolean;
  engine?: string;
}

interface AIInsightCardProps {
  insight: AIInsightResponse;
  onSelectFollowUp: (query: string) => void;
  onGoToGeneralData?: () => void;
}

export const AIInsightCard: React.FC<AIInsightCardProps> = ({
  insight,
  onSelectFollowUp,
  onGoToGeneralData
}) => {
  const isUnsure = insight.isUnsure;
  const chartType = insight.suggestedChart;

  // Prepare chart datasets
  const profitabilityChartData = analyticsStore.productProfitability.map((p) => ({
    name: p.productType,
    "Margin %": p.profitMargin,
    "Gross Profit ($k)": Math.round(p.grossProfit / 1000),
    "Revenue ($k)": Math.round(p.totalRevenue / 1000)
  }));

  // Lead time buckets for bottleneck chart
  const leadTimeBuckets: { [key: string]: number } = {
    "6-8 days": 0,
    "9-10 days": 0,
    "11-12 days": 0,
    "13-14 days": 0,
    "15-17 days": 0,
    "18-21 days": 0
  };
  analyticsStore.orders.forEach((o) => {
    const days = o.leadTimeDays;
    if (days <= 8) leadTimeBuckets["6-8 days"]++;
    else if (days <= 10) leadTimeBuckets["9-10 days"]++;
    else if (days <= 12) leadTimeBuckets["11-12 days"]++;
    else if (days <= 14) leadTimeBuckets["13-14 days"]++;
    else if (days <= 17) leadTimeBuckets["15-17 days"]++;
    else leadTimeBuckets["18-21 days"]++;
  });
  const bottleneckChartData = Object.entries(leadTimeBuckets).map(([k, v]) => ({
    name: k,
    Orders: v
  }));

  const cashFlowChartData = analyticsStore.monthlyData.map((m) => ({
    name: m.month,
    Revenue: m.revenue,
    "Total Costs": m.costs,
    "Net Cash": m.netCash
  }));

  const materialsChartData = analyticsStore.materialSummary.map((m) => ({
    name: m.material,
    "Consumed (m³)": m.totalConsumedM3,
    "Reordered (m³)": m.totalReorderedM3
  }));

  return (
    <div
      id="ai-insight-card"
      className={`rounded-2xl border p-5 sm:p-7 transition-all shadow-sm ${
        isUnsure
          ? "bg-amber-50/70 border-amber-300 text-stone-900"
          : "bg-white border-stone-200 text-stone-900"
      }`}
    >
      {/* Header badge row */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-stone-100">
        <div className="flex items-center gap-2">
          {isUnsure ? (
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          )}
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
            {isUnsure ? "Scope Boundary Enforced" : "Insight Result"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {insight.engine && (
            <span className="text-[11px] font-medium text-stone-500 bg-stone-100 px-2.5 py-0.5 rounded-full border border-stone-200">
              {insight.engine}
            </span>
          )}
          {onGoToGeneralData && (
            <button
              id="search-go-to-general-data"
              type="button"
              onClick={onGoToGeneralData}
              className="text-xs font-medium text-stone-700 hover:text-stone-950 flex items-center gap-1 bg-stone-50 hover:bg-stone-100 px-2.5 py-1 rounded-md border border-stone-200 transition-colors cursor-pointer"
            >
              <span>Explore All Orders</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main plain English answer */}
      <div className="mb-5">
        <p className="text-base sm:text-lg text-stone-900 leading-relaxed font-normal">
          {insight.answer}
        </p>
      </div>

      {/* Key metrics cards */}
      {insight.keyMetrics && insight.keyMetrics.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {insight.keyMetrics.map((metric, idx) => (
            <div
              key={idx}
              className="bg-stone-50 rounded-xl p-3 border border-stone-200/80"
            >
              <div className="text-[11px] font-medium text-stone-500 truncate">
                {metric.label}
              </div>
              <div className="text-base sm:text-lg font-bold text-stone-900 mt-0.5 truncate">
                {metric.value}
              </div>
              {metric.change && (
                <div className="text-[10px] text-emerald-700 flex items-center gap-0.5 mt-0.5">
                  <TrendingUp className="w-3 h-3" />
                  {metric.change}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Embedded Chart Visualizations directly matching the query */}
      {!isUnsure && chartType && chartType !== "none" && (
        <div className="bg-stone-50/70 rounded-2xl p-4 sm:p-5 border border-stone-200 mb-6">
          <div className="text-xs font-semibold uppercase tracking-wider text-stone-600 mb-3 flex items-center justify-between">
            <span>
              {chartType === "profitability" && "Product Lines Margin & Revenue Breakdown"}
              {chartType === "bottleneck" && "Manufacturing Lead Time Distribution (Target: 14 Days)"}
              {chartType === "cashflow" && "Monthly Cash Inflow vs Outflow Trend (2025)"}
              {chartType === "materials" && "Timber Consumption vs Reorders (m³)"}
              {chartType === "staffing" && "Staffing Attrition & Resignations Timeline"}
            </span>
            <span className="text-[11px] font-normal text-stone-500 lowercase">
              Interactive chart
            </span>
          </div>

          <div className="h-64 sm:h-72 w-full">
            {chartType === "profitability" && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={profitabilityChartData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7E5E4" />
                  <XAxis dataKey="name" stroke="#78716C" fontSize={11} tickLine={false} angle={-15} textAnchor="end" />
                  <YAxis stroke="#78716C" fontSize={11} tickLine={false} />
                  <Tooltip
                    formatter={(val: unknown, name: string | undefined) => [
                      name === "Margin %" ? `${val}%` : `$${Number(val || 0) * 1000}`,
                      name || ""
                    ]}
                    contentStyle={{
                      backgroundColor: "#1C1917",
                      borderRadius: "12px",
                      color: "#F5F5F4",
                      fontSize: "12px"
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                  <Bar dataKey="Margin %" fill="#059669" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Gross Profit ($k)" fill="#D97706" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Revenue ($k)" fill="#78716C" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}

            {chartType === "bottleneck" && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bottleneckChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7E5E4" />
                  <XAxis dataKey="name" stroke="#78716C" fontSize={11} tickLine={false} />
                  <YAxis stroke="#78716C" fontSize={11} tickLine={false} />
                  <Tooltip
                    formatter={(val: unknown) => [`${val} Orders`, "Volume"]}
                    contentStyle={{
                      backgroundColor: "#1C1917",
                      borderRadius: "12px",
                      color: "#F5F5F4",
                      fontSize: "12px"
                    }}
                  />
                  <Bar dataKey="Orders" fill="#D97706" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}

            {chartType === "cashflow" && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cashFlowChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7E5E4" />
                  <XAxis dataKey="name" stroke="#78716C" fontSize={11} tickLine={false} />
                  <YAxis stroke="#78716C" fontSize={11} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                  <Tooltip
                    formatter={(val: unknown) => [`$${Number(val || 0).toLocaleString()}`, ""]}
                    contentStyle={{
                      backgroundColor: "#1C1917",
                      borderRadius: "12px",
                      color: "#F5F5F4",
                      fontSize: "12px"
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                  <Area type="monotone" dataKey="Revenue" stroke="#059669" fill="#059669" fillOpacity={0.15} />
                  <Area type="monotone" dataKey="Total Costs" stroke="#78716C" fill="#78716C" fillOpacity={0.15} />
                </AreaChart>
              </ResponsiveContainer>
            )}

            {chartType === "materials" && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={materialsChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7E5E4" />
                  <XAxis dataKey="name" stroke="#78716C" fontSize={12} tickLine={false} />
                  <YAxis stroke="#78716C" fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1C1917",
                      borderRadius: "12px",
                      color: "#F5F5F4",
                      fontSize: "12px"
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                  <Bar dataKey="Consumed (m³)" fill="#059669" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Reordered (m³)" fill="#D97706" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}

            {chartType === "staffing" && (
              <div className="h-full flex flex-col justify-center space-y-3 text-xs">
                <div className="p-3 bg-rose-100/70 border border-rose-200 rounded-xl text-rose-900 font-medium">
                  <strong>Critical Resignation Window:</strong> 3 Designers quit in July 2025 (D14 on July 15, D5 on July 22, Senior D2 on July 27), cutting design capacity by 50%.
                </div>
                <div className="p-3 bg-stone-100 border border-stone-200 rounded-xl text-stone-800">
                  <strong>Maker Attrition:</strong> M8 resigned May 21, M15 on Sept 19, and M9 on Sept 30. Total historical staff: 24 (12 Active, 12 Resigned).
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Key findings bullets */}
      {insight.keyFindings && insight.keyFindings.length > 0 && (
        <div className="bg-stone-50/60 rounded-xl p-4 border border-stone-200 mb-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-stone-600 mb-2 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-stone-500" />
            Key Data Findings
          </div>
          <ul className="space-y-1.5">
            {insight.keyFindings.map((finding, idx) => (
              <li
                key={idx}
                className="text-xs sm:text-sm text-stone-700 flex items-start gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{finding}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommended follow-ups */}
      {insight.suggestedFollowUps && insight.suggestedFollowUps.length > 0 && (
        <div className="pt-3 border-t border-stone-100">
          <span className="text-xs font-medium text-stone-500 block mb-2">
            Suggested follow-up questions:
          </span>
          <div className="flex flex-wrap gap-2">
            {insight.suggestedFollowUps.map((q, idx) => (
              <button
                key={idx}
                id={`followup-query-${idx}`}
                type="button"
                onClick={() => onSelectFollowUp(q)}
                className="text-xs text-stone-700 hover:text-stone-950 bg-stone-100 hover:bg-amber-100/60 border border-stone-200 hover:border-amber-300 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
              >
                <span>{q}</span>
                <ChevronRight className="w-3 h-3 text-stone-400" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
