import React, { useState } from "react";
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
import { ArrowUpDown, HelpCircle, Sparkles, Filter } from "lucide-react";
import { ProductProfitabilityRecord } from "../data/furnitureData";

interface ProfitabilityTabProps {
  products: ProductProfitabilityRecord[];
  onAskQuestion: (q: string) => void;
}

export const ProfitabilityTab: React.FC<ProfitabilityTabProps> = ({
  products,
  onAskQuestion
}) => {
  const [sortBy, setSortBy] = useState<"profitMargin" | "grossProfit" | "totalRevenue" | "orderCount">("profitMargin");
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  const sortedProducts = [...products].sort((a, b) => {
    const factor = sortAsc ? 1 : -1;
    return (a[sortBy] - b[sortBy]) * factor;
  });

  const handleSort = (field: "profitMargin" | "grossProfit" | "totalRevenue" | "orderCount") => {
    if (sortBy === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(field);
      setSortAsc(false);
    }
  };

  const chartData = products.map((p) => ({
    name: p.productType,
    "Margin %": p.profitMargin,
    "Gross Profit ($k)": Math.round(p.grossProfit / 1000),
    "Revenue ($k)": Math.round(p.totalRevenue / 1000),
    "Material Cost ($k)": Math.round(p.materialCost / 1000),
    "Labor Cost ($k)": Math.round(p.laborCost / 1000)
  }));

  const topMargin = products.reduce((max, p) => (p.profitMargin > max.profitMargin ? p : max), products[0]);
  const topProfit = products.reduce((max, p) => (p.grossProfit > max.grossProfit ? p : max), products[0]);
  const topRevenue = products.reduce((max, p) => (p.totalRevenue > max.totalRevenue ? p : max), products[0]);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
          <div className="text-xs font-semibold uppercase tracking-wider text-stone-500">
            Highest Gross Margin %
          </div>
          <div className="text-2xl font-serif font-bold text-stone-900 mt-1">
            {topMargin.productType}
          </div>
          <div className="text-sm font-bold text-emerald-700 mt-1">
            {topMargin.profitMargin}% Margin
          </div>
          <p className="text-xs text-stone-500 mt-1">
            ${Math.round(topMargin.grossProfit).toLocaleString()} profit on ${Math.round(topMargin.totalRevenue).toLocaleString()} revenue ({topMargin.orderCount} units)
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
          <div className="text-xs font-semibold uppercase tracking-wider text-stone-500">
            Highest Total Dollar Profit
          </div>
          <div className="text-2xl font-serif font-bold text-stone-900 mt-1">
            {topProfit.productType}
          </div>
          <div className="text-sm font-bold text-emerald-700 mt-1">
            ${Math.round(topProfit.grossProfit).toLocaleString()} Profit
          </div>
          <p className="text-xs text-stone-500 mt-1">
            {topProfit.profitMargin}% margin on ${Math.round(topProfit.totalRevenue).toLocaleString()} revenue across {topProfit.orderCount} orders
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
          <div className="text-xs font-semibold uppercase tracking-wider text-stone-500">
            Top Revenue Producer
          </div>
          <div className="text-2xl font-serif font-bold text-stone-900 mt-1">
            {topRevenue.productType}
          </div>
          <div className="text-sm font-bold text-stone-900 mt-1">
            ${Math.round(topRevenue.totalRevenue).toLocaleString()} Revenue
          </div>
          <p className="text-xs text-stone-500 mt-1">
            {topRevenue.orderCount} orders • Average quote: ${Math.round(topRevenue.totalRevenue / topRevenue.orderCount).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Chart: Margin vs Volume Comparison */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="font-serif font-semibold text-stone-900 text-base">
              Product Type Profit Margin vs Revenue Breakdown
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Comparison of Gross Margin (%) against absolute Revenue and Material/Labor Costs ($k)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="ask-profitability-ai"
              type="button"
              onClick={() => onAskQuestion("Which product type is most profitable and why?")}
              className="text-xs font-medium text-stone-800 bg-amber-100 hover:bg-amber-200/80 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer border border-amber-300"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>Ask AI Insights</span>
            </button>
          </div>
        </div>

        <div className="h-72 sm:h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7E5E4" />
              <XAxis
                dataKey="name"
                stroke="#78716C"
                fontSize={11}
                tickLine={false}
                angle={-15}
                textAnchor="end"
              />
              <YAxis
                stroke="#78716C"
                fontSize={11}
                tickLine={false}
                tickFormatter={(v) => `${v}`}
              />
              <Tooltip
                formatter={(val: unknown, name: string | undefined) => [
                  name === "Margin %" ? `${val}%` : `$${Number(val || 0) * 1000}`,
                  name || ""
                ]}
                contentStyle={{
                  backgroundColor: "#1C1917",
                  borderRadius: "12px",
                  color: "#F5F5F4",
                  border: "none",
                  fontSize: "12px"
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }} />
              <Bar dataKey="Margin %" fill="#059669" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Gross Profit ($k)" fill="#D97706" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Revenue ($k)" fill="#78716C" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Interactive Products Table */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-serif font-semibold text-stone-900 text-base">
              Product Lines Profitability Matrix
            </h3>
            <p className="text-xs text-stone-500">
              Click any column header to sort. Total order count, costs, gross profit, and cycle time.
            </p>
          </div>

          <div className="text-xs text-stone-500 bg-stone-50 px-3 py-1.5 rounded-lg border border-stone-200">
            Sorted by: <span className="font-semibold text-stone-900 uppercase">{sortBy}</span> ({sortAsc ? "Ascending" : "Descending"})
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-stone-50 text-stone-600 font-semibold border-b border-stone-200">
                <th className="py-3 px-4">Product Type</th>
                <th
                  onClick={() => handleSort("orderCount")}
                  className="py-3 px-4 cursor-pointer hover:bg-stone-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Orders</span>
                    <ArrowUpDown className="w-3 h-3 text-stone-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("totalRevenue")}
                  className="py-3 px-4 cursor-pointer hover:bg-stone-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Total Revenue</span>
                    <ArrowUpDown className="w-3 h-3 text-stone-400" />
                  </div>
                </th>
                <th className="py-3 px-4">Material Cost</th>
                <th className="py-3 px-4">Est. Labor</th>
                <th
                  onClick={() => handleSort("grossProfit")}
                  className="py-3 px-4 cursor-pointer hover:bg-stone-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Gross Profit</span>
                    <ArrowUpDown className="w-3 h-3 text-stone-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("profitMargin")}
                  className="py-3 px-4 cursor-pointer hover:bg-stone-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Gross Margin</span>
                    <ArrowUpDown className="w-3 h-3 text-stone-400" />
                  </div>
                </th>
                <th className="py-3 px-4">Avg Lead Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {sortedProducts.map((p, idx) => (
                <tr
                  key={idx}
                  className={`hover:bg-stone-50/80 transition-colors ${
                    selectedProduct === p.productType ? "bg-amber-50/50" : ""
                  }`}
                  onClick={() => setSelectedProduct(p.productType)}
                >
                  <td className="py-3.5 px-4 font-semibold text-stone-900">
                    {p.productType}
                  </td>
                  <td className="py-3.5 px-4 text-stone-700">
                    {p.orderCount} units
                  </td>
                  <td className="py-3.5 px-4 font-mono font-medium text-stone-900">
                    ${Math.round(p.totalRevenue).toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-stone-600">
                    ${Math.round(p.materialCost).toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-stone-600">
                    ${Math.round(p.laborCost).toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-stone-900">
                    ${Math.round(p.grossProfit).toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md font-semibold text-xs ${
                        p.profitMargin >= 55
                          ? "bg-emerald-100 text-emerald-800"
                          : p.profitMargin >= 50
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-800"
                      }`}
                    >
                      {p.profitMargin}%
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-stone-600">
                    {p.avgLeadTime} days
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
