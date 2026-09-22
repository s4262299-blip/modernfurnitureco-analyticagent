import React from "react";
import { Users, UserMinus, UserCheck, ShieldAlert, Sparkles, Calendar } from "lucide-react";
import { AnalyticsStoreType } from "../data/furnitureData";

interface StaffingTabProps {
  employees: AnalyticsStoreType["employees"];
  hrEvents: AnalyticsStoreType["hrEvents"];
  onAskQuestion: (q: string) => void;
}

export const StaffingTab: React.FC<StaffingTabProps> = ({
  employees,
  hrEvents,
  onAskQuestion
}) => {
  const resignations = hrEvents.filter((e) => e.event === "Resignation");
  const activeCount = employees.filter((e) => e.status === "Active").length;
  const resignedCount = employees.filter((e) => e.status === "Resigned").length;

  const designers = employees.filter((e) => e.role.toLowerCase().includes("designer"));
  const makers = employees.filter((e) => e.role.toLowerCase().includes("maker"));

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Total Roster
            </span>
            <Users className="w-4 h-4 text-stone-500" />
          </div>
          <div className="text-2xl font-serif font-bold text-stone-900 mt-2">
            {employees.length} Staff
          </div>
          <div className="text-xs text-stone-500 mt-1">
            {designers.length} Designers • {makers.length} Makers
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Active Personnel
            </span>
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-serif font-bold text-emerald-700 mt-2">
            {activeCount} Active
          </div>
          <div className="text-xs text-stone-500 mt-1">
            50% of historical staff active
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Total Resignations
            </span>
            <UserMinus className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-serif font-bold text-rose-700 mt-2">
            {resignedCount} Departures
          </div>
          <div className="text-xs text-stone-500 mt-1">
            Across 2025 - 2026 timeline
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Wage Scales
            </span>
            <span className="text-xs font-mono font-bold text-stone-600">$45 / $30</span>
          </div>
          <div className="text-sm font-semibold text-stone-900 mt-2">
            High Skill: $45/hr ($360/day)
          </div>
          <div className="text-xs text-stone-500 mt-0.5">
            Low Skill: $30/hr ($240/day)
          </div>
        </div>
      </div>

      {/* July 2025 Designer Exodus Callout */}
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-rose-900 text-base">
              Critical July 2025 Designer Exodus
            </h3>
            <p className="text-xs text-rose-800 mt-0.5 max-w-3xl leading-relaxed">
              Three designers resigned within 12 days: <strong>D14</strong> (July 15), <strong>D5</strong> (July 22), and top senior designer <strong>D2</strong> (July 27). This halved design bandwidth, causing client order backlogs and delaying downstream manufacturing stages.
            </p>
          </div>
        </div>

        <button
          id="ask-staffing-impact-ai"
          type="button"
          onClick={() => onAskQuestion("How did the July 2025 designer resignations impact our production lead times?")}
          className="bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>Ask AI Analysis</span>
        </button>
      </div>

      {/* Roster and Resignations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resignations Log */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-serif font-semibold text-stone-900 text-base flex items-center gap-2">
              <Calendar className="w-4 h-4 text-stone-500" />
              Chronological Resignation Log
            </h3>
            <span className="text-xs font-medium text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md">
              {resignations.length} Events
            </span>
          </div>

          <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
            {resignations.map((r, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-stone-500 text-[11px] bg-white px-2 py-0.5 rounded-sm border border-stone-200">
                    {r.date}
                  </span>
                  <div>
                    <span className="font-bold text-stone-900">Employee {r.employeeId}</span>
                    <span className="text-stone-500 ml-1.5">({r.details})</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm bg-rose-100 text-rose-800">
                  Resigned
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Staff Table */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs">
          <h3 className="font-serif font-semibold text-stone-900 text-base mb-3">
            Employee Directory & Roles
          </h3>

          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-50 text-stone-600 font-semibold border-b border-stone-200">
                  <th className="py-2 px-3">ID</th>
                  <th className="py-2 px-3">Role</th>
                  <th className="py-2 px-3">Skill Level</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3">Wage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {employees.map((emp, idx) => (
                  <tr key={idx} className="hover:bg-stone-50 transition-colors">
                    <td className="py-2 px-3 font-mono font-bold text-stone-900">
                      {emp.employeeId}
                    </td>
                    <td className="py-2 px-3 text-stone-700">
                      {emp.role}
                    </td>
                    <td className="py-2 px-3">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded-sm text-[10px] font-semibold ${
                          emp.skillLevel === "high"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-stone-100 text-stone-700"
                        }`}
                      >
                        {emp.skillLevel}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider ${
                          emp.status === "Active"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-stone-200 text-stone-600"
                        }`}
                      >
                        {emp.status}
                      </span>
                    </td>
                    <td className="py-2 px-3 font-mono text-stone-600">
                      ${emp.wage}/hr
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
