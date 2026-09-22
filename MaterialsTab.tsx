import React from "react";
import { TreePine, AlertTriangle, RefreshCw, DollarSign, Sparkles } from "lucide-react";
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
import { MaterialSummaryRecord } from "../data/furnitureData";

interface MaterialsTabProps {
  materials: MaterialSummaryRecord[];
  onAskQuestion: (q: string) => void;
}

export const MaterialsTab: React.FC<MaterialsTabProps> = ({
  materials,
  onAskQuestion
}) => {
  const chartData = materials.map((m) => ({
    name: m.material,
    "Consumed (m³)": m.totalConsumedM3,
    "Reordered (m³)": m.totalReorderedM3,
    "Spend ($k)": Math.round(m.totalSpent / 1000)
  }));

  const totalSpend = materials.reduce((sum, m) => sum + m.totalSpent, 0);

  return (
    <div className="space-y-6">
      {/* 3 Timber Species Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {materials.map((m, idx) => {
          const isWalnut = m.material.includes("Walnut");
          const isAsh = m.material.includes("Ash");
          return (
            <div
              key={idx}
              className={`rounded-2xl p-5 sm:p-6 border shadow-xs transition-all ${
                isWalnut
                  ? "bg-amber-50/40 border-amber-300"
                  : isAsh
                  ? "bg-stone-50 border-stone-200"
                  : "bg-emerald-50/40 border-emerald-200"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-stone-900 text-stone-100 flex items-center justify-center">
                    <TreePine className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-stone-900 text-base">
                      {m.material}
                    </h3>
                    <div className="text-[11px] text-stone-500 font-mono">
                      Unit Cost: ${m.unitCost.toLocaleString()} / m³
                    </div>
                  </div>
                </div>

                {isWalnut && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 uppercase tracking-wider">
                    High Stockout Risk
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 my-4 pt-3 border-t border-stone-200/80">
                <div className="bg-white/80 rounded-xl p-2.5 border border-stone-200/60">
                  <div className="text-[10px] uppercase font-semibold text-stone-500">
                    Total Consumed
                  </div>
                  <div className="text-lg font-bold text-stone-900 font-mono">
                    {m.totalConsumedM3} m³
                  </div>
                </div>
                <div className="bg-white/80 rounded-xl p-2.5 border border-stone-200/60">
                  <div className="text-[10px] uppercase font-semibold text-stone-500">
                    Total Reordered
                  </div>
                  <div className="text-lg font-bold text-stone-900 font-mono">
                    {m.totalReorderedM3} m³
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Reorder Batches:</span>
                  <span className="font-semibold text-stone-900">{m.reorderCount} batches (8 m³ each)</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Capital Spent:</span>
                  <span className="font-semibold text-stone-900 font-mono">${Math.round(m.totalSpent).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Critical Low Alerts:</span>
                  <span className={`font-semibold ${m.criticalLowEvents > 0 ? "text-rose-700" : "text-emerald-700"}`}>
                    {m.criticalLowEvents} events (&le; 2 m³)
                  </span>
                </div>
                {m.stockoutDates.length > 0 && (
                  <div className="pt-2 border-t border-stone-200/60 text-rose-700 text-[11px] font-medium flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>Zero stock recorded on: {m.stockoutDates.join(", ")}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Recharts Chart: Timber Volumes & Spend */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="font-serif font-semibold text-stone-900 text-base">
              Timber Consumption, Reorders, and Capital Expenditure
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Total raw timber expenditure: ${Math.round(totalSpend).toLocaleString()} across all workshops
            </p>
          </div>
          <button
            id="ask-materials-ai-btn"
            type="button"
            onClick={() => onAskQuestion("What was our timber inventory situation and why did Walnut run out?")}
            className="text-xs font-medium text-stone-800 bg-amber-100 hover:bg-amber-200/80 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer border border-amber-300"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            <span>Ask AI Inventory Status</span>
          </button>
        </div>

        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7E5E4" />
              <XAxis dataKey="name" stroke="#78716C" fontSize={12} tickLine={false} />
              <YAxis stroke="#78716C" fontSize={12} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1C1917",
                  borderRadius: "12px",
                  color: "#F5F5F4",
                  border: "none",
                  fontSize: "12px"
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
              <Bar dataKey="Consumed (m³)" fill="#059669" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Reordered (m³)" fill="#D97706" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Spend ($k)" fill="#78716C" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
