import React from "react";
import {
  AlertTriangle,
  AlertOctagon,
  Clock,
  UserX,
  PackageX,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  CheckCircle
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { BottleneckRecord, OrderRecord } from "../data/furnitureData";

interface BottlenecksTabProps {
  bottlenecks: BottleneckRecord[];
  orders: OrderRecord[];
  onAskQuestion: (q: string) => void;
}

export const BottlenecksTab: React.FC<BottlenecksTabProps> = ({
  bottlenecks,
  orders,
  onAskQuestion
}) => {
  // Lead time distribution
  const leadTimeBuckets: { [key: string]: number } = {
    "6-8 days": 0,
    "9-10 days": 0,
    "11-12 days": 0,
    "13-14 days": 0,
    "15-17 days": 0,
    "18-21 days": 0
  };

  orders.forEach((o) => {
    const days = o.leadTimeDays;
    if (days <= 8) leadTimeBuckets["6-8 days"]++;
    else if (days <= 10) leadTimeBuckets["9-10 days"]++;
    else if (days <= 12) leadTimeBuckets["11-12 days"]++;
    else if (days <= 14) leadTimeBuckets["13-14 days"]++;
    else if (days <= 17) leadTimeBuckets["15-17 days"]++;
    else leadTimeBuckets["18-21 days"]++;
  });

  const leadTimeChartData = Object.entries(leadTimeBuckets).map(([bucket, count]) => ({
    name: bucket,
    Orders: count
  }));

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-stone-900 text-stone-100 rounded-2xl p-6 border border-stone-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <h2 className="text-lg font-serif font-bold text-stone-100">
              Operational Bottlenecks & Capacity Diagnostics
            </h2>
          </div>
          <p className="text-xs text-stone-400 mt-1 max-w-2xl">
            Systemic operational friction points identified by cross-referencing HR departure logs, timber stock levels, and order lead times.
          </p>
        </div>

        <button
          id="ask-bottlenecks-diagnostics-btn"
          type="button"
          onClick={() => onAskQuestion("What was our biggest bottleneck last quarter and what caused it?")}
          className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>Ask AI Analysis</span>
        </button>
      </div>

      {/* 3 Major Quarterly Bottlenecks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {bottlenecks.map((b, idx) => (
          <div
            key={idx}
            className={`rounded-2xl p-5 sm:p-6 border transition-all ${
              b.severity === "CRITICAL"
                ? "bg-rose-50/40 border-rose-200"
                : b.severity === "HIGH"
                ? "bg-amber-50/40 border-amber-200"
                : "bg-blue-50/40 border-blue-200"
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-3">
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                  b.severity === "CRITICAL"
                    ? "bg-rose-100 text-rose-800"
                    : b.severity === "HIGH"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {b.quarter}
              </span>
              <span className="text-xs text-stone-500 font-medium">
                {b.type}
              </span>
            </div>

            <h3 className="font-serif font-bold text-base text-stone-900 mb-2">
              {b.title}
            </h3>

            <div className="space-y-2 text-xs text-stone-700 mb-4">
              <div>
                <strong className="text-stone-900 block font-semibold">
                  Root Cause:
                </strong>
                <span>{b.rootCause}</span>
              </div>
              <div>
                <strong className="text-stone-900 block font-semibold">
                  Operational Impact:
                </strong>
                <span>{b.operationalImpact}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-200/80 text-[11px] text-stone-600 flex items-center gap-1.5 font-medium">
              <AlertOctagon className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span>Metric: {b.metrics}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Lead Time Distribution Chart & Staffing Impact */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead time histogram */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-xs">
          <div className="mb-4">
            <h3 className="font-serif font-semibold text-stone-900 text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-stone-600" />
              Order Lead Time Distribution (Target: 14 Days)
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Days elapsed from 50% deposit acceptance to completion and final payment
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leadTimeChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7E5E4" />
                <XAxis dataKey="name" stroke="#78716C" fontSize={11} tickLine={false} />
                <YAxis stroke="#78716C" fontSize={11} tickLine={false} />
                <Tooltip
                  formatter={(val: unknown) => [`${val} Orders`, "Volume"]}
                  contentStyle={{
                    backgroundColor: "#1C1917",
                    borderRadius: "12px",
                    color: "#F5F5F4",
                    border: "none",
                    fontSize: "12px"
                  }}
                />
                <Bar dataKey="Orders" fill="#D97706" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <span>Average lead time: <strong>12.0 days</strong></span>
            <span className="text-rose-700 font-medium">Outlier delays reached 18-21 days</span>
          </div>
        </div>

        {/* Managerial Remediation Checklist */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-serif font-semibold text-stone-900 text-base mb-1">
              Managerial Remediation Playbook
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Strategic recommendations derived from ModernFurniture Co.&apos;s bottleneck records:
            </p>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-start gap-2.5">
                <PackageX className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-stone-900">
                    Increase American Walnut Safety Stock Buffer
                  </div>
                  <div className="text-stone-600 mt-0.5">
                    Walnut reorder trigger should be raised from 2 m³ to 5 m³. Reorders take several days to arrive; holding higher inventory avoids luxury order work-stops.
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-start gap-2.5">
                <UserX className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-stone-900">
                    Rebalance Senior Designer Bandwidth
                  </div>
                  <div className="text-stone-600 mt-0.5">
                    The departure of D2 and D14 concentrated high-complexity orders on D3 and D1. Cross-training junior designers and makers reduces single-point-of-failure risks.
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-stone-900">
                    Workshop Staggering for Victorian Ash
                  </div>
                  <div className="text-stone-600 mt-0.5">
                    Schedule milling and joinery batches in coordination with supplier timber drops to eliminate queue idle time.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-stone-100 mt-4">
            <button
              id="ask-bottlenecks-followup-btn"
              type="button"
              onClick={() => onAskQuestion("How did designer resignations impact our wage costs and production?")}
              className="w-full text-xs font-medium text-stone-700 hover:text-stone-950 bg-stone-100 hover:bg-stone-200 py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Explore HR & Resignation Impact</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
