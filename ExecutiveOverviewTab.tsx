import React from "react";
import {
  DollarSign,
  TrendingUp,
  Package,
  AlertOctagon,
  Award,
  ArrowRight,
  Sparkles,
  TreePine
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { AnalyticsStoreType } from "../data/furnitureData";

interface ExecutiveOverviewTabProps {
  data: AnalyticsStoreType;
  onSwitchTab: (tabId: string) => void;
  onAskQuestion: (q: string) => void;
}

export const ExecutiveOverviewTab: React.FC<ExecutiveOverviewTabProps> = ({
  data,
  onSwitchTab,
  onAskQuestion
}) => {
  const { totals, productProfitability, quarterlyData, bottlenecks } = data;

  const highestMarginProduct = productProfitability[0]; // Bookshelf
  const highestVolumeProduct = productProfitability.reduce(
    (max, p) => (p.grossProfit > max.grossProfit ? p : max),
    productProfitability[0]
  ); // Dining Table

  const chartData = quarterlyData.map((q) => ({
    name: q.quarter,
    Revenue: q.revenue,
    "Operating Costs": q.totalCosts,
    "Net Profit": q.netProfit
  }));

  return (
    <div className="space-y-6">
      {/* Top Level KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Total Order Revenue
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-serif font-bold text-stone-900 mt-2">
            ${Math.round(totals.totalRevenue).toLocaleString()}
          </div>
          <div className="text-xs text-stone-500 mt-1 flex items-center justify-between">
            <span>160 custom orders quoted</span>
            <span className="text-emerald-700 font-medium">152 delivered</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Net Cash Flow
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-serif font-bold text-stone-900 mt-2">
            +${Math.round(totals.netCashFlow).toLocaleString()}
          </div>
          <div className="text-xs text-stone-500 mt-1 flex items-center justify-between">
            <span>Total costs: ${Math.round(totals.totalCosts).toLocaleString()}</span>
            <span className="text-blue-700 font-medium">+3.9% net margin</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Most Profitable Product
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-serif font-bold text-stone-900 mt-2 truncate">
            {highestMarginProduct.productType}
          </div>
          <div className="text-xs text-stone-500 mt-1 flex items-center justify-between">
            <span className="text-amber-800 font-medium">
              {highestMarginProduct.profitMargin}% gross margin
            </span>
            <span>${Math.round(highestMarginProduct.grossProfit).toLocaleString()} profit</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Peak Delay Period
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-serif font-bold text-stone-900 mt-2">
            Q2 Delay Peak
          </div>
          <div className="text-xs text-stone-500 mt-1 flex items-center justify-between">
            <span className="text-rose-700 font-medium">26.7% late orders (16/60)</span>
            <span>12.6d avg lead time</span>
          </div>
        </div>
      </div>

      {/* Highlights & In-Depth Quick Findings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quarterly Financials Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-serif font-semibold text-stone-900 text-base">
                Quarterly Financial Performance (2025)
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Revenue vs Operating Costs (Wages, Overheads, Timber Reorders)
              </p>
            </div>
            <button
              id="view-financials-btn"
              type="button"
              onClick={() => onSwitchTab("financials")}
              className="text-xs font-medium text-stone-700 hover:text-stone-950 flex items-center gap-1 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <span>Deep Dive</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7E5E4" />
                <XAxis dataKey="name" stroke="#78716C" fontSize={12} tickLine={false} />
                <YAxis
                  stroke="#78716C"
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(val) => `$${val / 1000}k`}
                />
                <Tooltip
                  formatter={(val: unknown) => [
                    `$${Number(val || 0).toLocaleString()}`,
                    ""
                  ]}
                  contentStyle={{
                    backgroundColor: "#1C1917",
                    borderRadius: "12px",
                    color: "#F5F5F4",
                    border: "none",
                    fontSize: "12px"
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                <Bar dataKey="Revenue" fill="#059669" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Operating Costs" fill="#78716C" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Net Profit" fill="#D97706" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Manager Quick Insights Card */}
        <div className="bg-stone-900 text-stone-100 rounded-2xl p-5 sm:p-6 border border-stone-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="font-serif font-semibold text-stone-100 text-base">
                Managerial Key Takeaways
              </h3>
            </div>
            <div className="space-y-3.5 text-xs text-stone-300">
              <div className="border-l-2 border-amber-400 pl-3">
                <span className="font-semibold text-stone-100 block">
                  Most Profitable Product Type:
                </span>
                <span>
                  <strong>{highestMarginProduct.productType}</strong> delivers our highest margin ({highestMarginProduct.profitMargin}%), while the <strong>{highestVolumeProduct.productType}</strong> yields the most cash profit ($${Math.round(highestVolumeProduct.grossProfit).toLocaleString()}).
                </span>
              </div>

              <div className="border-l-2 border-amber-400 pl-3">
                <span className="font-semibold text-stone-100 block">
                  Q2 Peak Delays (Production Throughput):
                </span>
                <span>
                  Highest annual delay rate at 26.7% (16 of 60 orders late, averaging 12.6d lead time) during peak seasonal volume, while generating peak net profit (+$67,262.31).
                </span>
              </div>

              <div className="border-l-2 border-rose-400 pl-3">
                <span className="font-semibold text-stone-100 block">
                  Q3 Staffing Turnover:
                </span>
                <span>
                  3 designers resigned in July (reducing active designers from 7 to 4, a 42.9% reduction). Order volume dropped 25.0%, but on-time delivery for processed orders remained strong at 95.6%.
                </span>
              </div>

              <div className="border-l-2 border-blue-400 pl-3">
                <span className="font-semibold text-stone-100 block">
                  Q1 Walnut Inventory Dip:
                </span>
                <span>
                  American Walnut reached 0 m³ on March 16 for 1 day before an 8 m³ reorder arrived, with Q1 closing at -$27,450.77 net cash flow due to upfront timber restocking.
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-stone-800 mt-4">
            <button
              id="ask-bottleneck-overview-btn"
              type="button"
              onClick={() => onAskQuestion("What was our biggest bottleneck last quarter?")}
              className="w-full text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-stone-950 py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Ask AI: What was our biggest bottleneck?</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Two Column Detailed Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Product Profitability Leaderboard */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-serif font-semibold text-stone-900 text-base">
                Product Profitability Ranking
              </h3>
              <p className="text-xs text-stone-500">
                Sorted by Gross Margin % (Revenue minus Materials & Labor)
              </p>
            </div>
            <button
              id="view-profitability-btn"
              type="button"
              onClick={() => onSwitchTab("profitability")}
              className="text-xs text-stone-600 hover:text-stone-900 font-medium flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {productProfitability.slice(0, 5).map((p, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-stone-50 hover:bg-stone-100/80 transition-colors border border-stone-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-stone-200/80 text-stone-700 font-bold text-xs flex items-center justify-center">
                    #{idx + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-xs sm:text-sm text-stone-900">
                      {p.productType}
                    </div>
                    <div className="text-[11px] text-stone-500">
                      {p.orderCount} orders • ${Math.round(p.totalRevenue).toLocaleString()} revenue
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs sm:text-sm font-bold text-emerald-700">
                    {p.profitMargin}% margin
                  </div>
                  <div className="text-[11px] text-stone-500">
                    ${Math.round(p.grossProfit).toLocaleString()} profit
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Operational Bottlenecks Summary */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-serif font-semibold text-stone-900 text-base">
                Operational Bottlenecks Log
              </h3>
              <p className="text-xs text-stone-500">
                Identified root causes across supply chain and personnel
              </p>
            </div>
            <button
              id="view-bottlenecks-btn"
              type="button"
              onClick={() => onSwitchTab("bottlenecks")}
              className="text-xs text-stone-600 hover:text-stone-900 font-medium flex items-center gap-1 cursor-pointer"
            >
              <span>Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {bottlenecks.map((b, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-stone-200/80 bg-stone-50/50"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-semibold text-xs sm:text-sm text-stone-900">
                    {b.title}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      b.severity === "CRITICAL"
                        ? "bg-rose-100 text-rose-800"
                        : b.severity === "HIGH"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {b.quarter}
                  </span>
                </div>
                <p className="text-xs text-stone-600 line-clamp-2">
                  {b.rootCause}
                </p>
                <div className="mt-2 pt-2 border-t border-stone-200/60 flex items-center justify-between text-[11px] text-stone-500">
                  <span>Impact: {b.operationalImpact.slice(0, 60)}...</span>
                  <span className="font-medium text-stone-700">{b.type}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
