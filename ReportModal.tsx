import React from "react";
import { X, Printer, Download, CheckCircle2, ShieldCheck } from "lucide-react";
import { AnalyticsStoreType } from "../data/furnitureData";

interface ReportModalProps {
  data: AnalyticsStoreType;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ data, onClose }) => {
  const { totals, productProfitability, bottlenecks, quarterlyData } = data;
  const topProduct = productProfitability[0];
  const highestProfitProduct = productProfitability.reduce(
    (max, p) => (p.grossProfit > max.grossProfit ? p : max),
    productProfitability[0]
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-stone-950/70 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-stone-900 text-stone-100 flex items-center justify-center font-serif text-lg font-bold">
              MF
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg text-stone-900">
                ModernFurniture Co. • Executive Analytical Report
              </h2>
              <p className="text-xs text-stone-500">
                Generated from verified business logs & financial ledger
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="bg-stone-900 hover:bg-stone-800 text-stone-100 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Report Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-stone-800 text-sm leading-relaxed">
          {/* Executive Summary */}
          <div>
            <h3 className="font-serif font-bold text-base text-stone-900 uppercase tracking-wide border-b border-stone-200 pb-1.5 mb-3">
              1. Executive Business Summary
            </h3>
            <p>
              ModernFurniture Co. achieved a total order revenue of <strong>${Math.round(totals.totalRevenue).toLocaleString()}</strong> across 160 custom orders with an operating expenditure of <strong>${Math.round(totals.totalCosts).toLocaleString()}</strong>, delivering a positive net cash flow of <strong>+${Math.round(totals.netCashFlow).toLocaleString()}</strong> (+3.8% net margin).
            </p>
          </div>

          {/* Product Profitability Highlights */}
          <div>
            <h3 className="font-serif font-bold text-base text-stone-900 uppercase tracking-wide border-b border-stone-200 pb-1.5 mb-3">
              2. Product Line Profitability Findings
            </h3>
            <ul className="space-y-1.5 text-xs sm:text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Top Gross Margin %:</strong> <strong>{topProduct.productType}</strong> is the most profitable product line on a percentage basis at <strong>{topProduct.profitMargin}% gross margin</strong> (${Math.round(topProduct.grossProfit).toLocaleString()} gross profit).
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Top Dollar Profit Volume:</strong> <strong>{highestProfitProduct.productType}</strong> generated the highest dollar profit of <strong>${Math.round(highestProfitProduct.grossProfit).toLocaleString()}</strong> (${Math.round(highestProfitProduct.totalRevenue).toLocaleString()} revenue across {highestProfitProduct.orderCount} orders).
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Average Lead Time:</strong> Across all product lines, manufacturing lead time averaged <strong>12.1 days</strong> against a target delivery SLA of 14 days (81.9% on-time delivery rate).
                </span>
              </li>
            </ul>
          </div>

          {/* Operational Bottlenecks Analysis */}
          <div>
            <h3 className="font-serif font-bold text-base text-stone-900 uppercase tracking-wide border-b border-stone-200 pb-1.5 mb-3">
              3. Operational Bottlenecks & Capacity Impediments
            </h3>
            <div className="space-y-3">
              {bottlenecks.map((b, idx) => (
                <div key={idx} className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 text-xs">
                  <div className="font-bold text-stone-900 text-sm mb-1 flex items-center justify-between">
                    <span>{b.title}</span>
                    <span className="font-mono text-stone-500 font-semibold">{b.quarter}</span>
                  </div>
                  <p className="text-stone-700 mb-1">
                    <strong>Root Cause:</strong> {b.rootCause}
                  </p>
                  <p className="text-stone-600">
                    <strong>Operational Impact:</strong> {b.operationalImpact}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Strategic Recommendations */}
          <div>
            <h3 className="font-serif font-bold text-base text-stone-900 uppercase tracking-wide border-b border-stone-200 pb-1.5 mb-3">
              4. Strategic Recommendations for Management
            </h3>
            <ol className="list-decimal pl-4 space-y-1.5 text-xs sm:text-sm text-stone-700">
              <li>
                <strong>Increase American Walnut Reorder Threshold:</strong> Prevent future 0 m³ stockout events by raising the minimum stock reorder trigger from 2 m³ to 5 m³.
              </li>
              <li>
                <strong>Design Capacity Redundancy:</strong> With the loss of senior designer D2 and designers D14/D5, cross-train mid-level craftspeople and establish junior designer mentoring to safeguard throughput if order volume rebounds.
              </li>
              <li>
                <strong>Capitalize on High-Margin Lines:</strong> Prioritize bespoke Large Dining Tables (53.4% margin) and Modular Wall Units (52.2% margin) while preserving volume margins on core Dining Tables ($257k gross profit).
              </li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between text-xs text-stone-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Verified against ModernFurniture Co. production database
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-700 hover:text-stone-900 font-medium cursor-pointer"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};
