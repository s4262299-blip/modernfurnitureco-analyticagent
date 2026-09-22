import React from "react";
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Building,
  Calendar,
  Sparkles
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { QuarterlyFinancialRecord, MonthlyFinancialRecord } from "../data/furnitureData";

interface FinancialsTabProps {
  quarterlyData: QuarterlyFinancialRecord[];
  monthlyData: MonthlyFinancialRecord[];
  totals: {
    totalRevenue: number;
    totalCosts: number;
    netCashFlow: number;
  };
  onAskQuestion: (q: string) => void;
}

export const FinancialsTab: React.FC<FinancialsTabProps> = ({
  quarterlyData,
  monthlyData,
  totals,
  onAskQuestion
}) => {
  const chartData = monthlyData.map((m) => ({
    name: m.month,
    Revenue: m.revenue,
    "Total Costs": m.costs,
    "Wages": m.wages,
    "Timber Spend": m.timber,
    "Overheads": m.overheads,
    "Net Cash": m.netCash
  }));

  return (
    <div className="space-y-6">
      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
          <div className="text-xs font-semibold uppercase tracking-wider text-stone-500">
            Total Revenue
          </div>
          <div className="text-2xl font-serif font-bold text-stone-900 mt-1">
            ${Math.round(totals.totalRevenue).toLocaleString()}
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Deposits (50% upfront) and final payments on completion
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
          <div className="text-xs font-semibold uppercase tracking-wider text-stone-500">
            Total Operating Costs
          </div>
          <div className="text-2xl font-serif font-bold text-stone-900 mt-1">
            ${Math.round(totals.totalCosts).toLocaleString()}
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Daily labor wages, $300/day workshop overheads, timber reorders
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
          <div className="text-xs font-semibold uppercase tracking-wider text-stone-500">
            Net Cash Balance
          </div>
          <div className="text-2xl font-serif font-bold text-emerald-700 mt-1">
            +${Math.round(totals.netCashFlow).toLocaleString()}
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Cumulative net margin: +3.9% across 242 operating days
          </p>
        </div>
      </div>

      {/* Monthly Cash Trend Chart */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="font-serif font-semibold text-stone-900 text-base">
              Monthly Cash Inflow vs Outflow Trajectory (2025)
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Net cash flows fluctuate based on customer order volume and upfront bulk timber reorders
            </p>
          </div>
          <button
            id="ask-cashflow-ai-btn"
            type="button"
            onClick={() => onAskQuestion("What was our monthly cash flow trend and how did timber purchases affect it?")}
            className="text-xs font-medium text-stone-800 bg-amber-100 hover:bg-amber-200/80 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer border border-amber-300"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            <span>Ask AI Cash Breakdown</span>
          </button>
        </div>

        <div className="h-72 sm:h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#78716C" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#78716C" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7E5E4" />
              <XAxis dataKey="name" stroke="#78716C" fontSize={11} tickLine={false} />
              <YAxis
                stroke="#78716C"
                fontSize={11}
                tickLine={false}
                tickFormatter={(v) => `$${v / 1000}k`}
              />
              <Tooltip
                formatter={(val: unknown) => [`$${Number(val || 0).toLocaleString()}`, ""]}
                contentStyle={{
                  backgroundColor: "#1C1917",
                  borderRadius: "12px",
                  color: "#F5F5F4",
                  border: "none",
                  fontSize: "12px"
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
              <Area
                type="monotone"
                dataKey="Revenue"
                stroke="#059669"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRev)"
              />
              <Area
                type="monotone"
                dataKey="Total Costs"
                stroke="#78716C"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorCost)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quarterly Performance Table */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 border-b border-stone-200">
          <h3 className="font-serif font-semibold text-stone-900 text-base">
            Quarterly Financial Breakdown (2025)
          </h3>
          <p className="text-xs text-stone-500">
            Categorization of revenue, labor wages, overhead expenses, and raw timber material purchases
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-stone-50 text-stone-600 font-semibold border-b border-stone-200">
                <th className="py-3 px-4">Quarter</th>
                <th className="py-3 px-4">Revenue</th>
                <th className="py-3 px-4">Daily Wages</th>
                <th className="py-3 px-4">Overheads ($300/d)</th>
                <th className="py-3 px-4">Timber Purchases</th>
                <th className="py-3 px-4">Total Costs</th>
                <th className="py-3 px-4">Net Profit</th>
                <th className="py-3 px-4">Net Margin</th>
                <th className="py-3 px-4">Completed Orders</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {quarterlyData.map((q, idx) => (
                <tr key={idx} className="hover:bg-stone-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-stone-900">
                    {q.quarter}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-emerald-800 font-medium">
                    ${Math.round(q.revenue).toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-stone-600">
                    ${Math.round(q.wages).toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-stone-600">
                    ${Math.round(q.overheads).toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-stone-600">
                    ${Math.round(q.timberCost).toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-medium text-stone-900">
                    ${Math.round(q.totalCosts).toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold">
                    <span
                      className={
                        q.netProfit >= 0 ? "text-emerald-700" : "text-rose-600"
                      }
                    >
                      {q.netProfit >= 0 ? "+" : ""}${Math.round(q.netProfit).toLocaleString()}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md font-semibold text-xs ${
                        q.profitMargin >= 8
                          ? "bg-emerald-100 text-emerald-800"
                          : q.profitMargin >= 0
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-rose-50 text-rose-700"
                      }`}
                    >
                      {q.profitMargin}%
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-stone-700 font-medium">
                    {q.ordersCompleted} orders
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
