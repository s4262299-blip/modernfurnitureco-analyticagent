import React, { useState } from "react";
import {
  DollarSign,
  TrendingUp,
  Package,
  Users,
  Search,
  Eye,
  X,
  FileText,
  Clock,
  TreePine,
  AlertOctagon,
  Award
} from "lucide-react";
import analyticsStore, { OrderRecord, AnalyticsStoreType } from "../data/furnitureData";

interface GeneralDataPageProps {
  data: AnalyticsStoreType;
  onOpenReport: () => void;
}

export const GeneralDataPage: React.FC<GeneralDataPageProps> = ({
  data,
  onOpenReport
}) => {
  const { totals, orders, productProfitability, bottlenecks, materialSummary, employees } = data;

  // Search and Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("ALL");
  const [selectedMaterial, setSelectedMaterial] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [inspectedOrder, setInspectedOrder] = useState<OrderRecord | null>(null);

  const productTypes = Array.from(new Set(orders.map((o) => o.productType)));
  const materials = Array.from(new Set(orders.map((o) => o.materialType)));

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      searchTerm === "" ||
      o.id.toString().includes(searchTerm) ||
      o.customerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.designerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.productType.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesProduct = selectedProduct === "ALL" || o.productType === selectedProduct;
    const matchesMaterial = selectedMaterial === "ALL" || o.materialType === selectedMaterial;
    const matchesStatus = selectedStatus === "ALL" || o.status === selectedStatus;

    return matchesSearch && matchesProduct && matchesMaterial && matchesStatus;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header & Executive Summary Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
        <div>
          <h1 className="font-serif font-bold text-xl text-stone-900">
            General Business & Operations Records
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Scroll through ModernFurniture Co.&apos;s complete custom orders, product profitability, bottleneck logs, and timber inventory.
          </p>
        </div>

        <button
          id="general-page-generate-report-btn"
          type="button"
          onClick={onOpenReport}
          className="flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-100 text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <FileText className="w-4 h-4" />
          <span>Generate Executive Report</span>
        </button>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
              Total Revenue
            </span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-serif font-bold text-stone-900 mt-1">
            ${Math.round(totals.totalRevenue).toLocaleString()}
          </div>
          <div className="text-[11px] text-stone-500 mt-0.5">
            160 custom orders billed
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
              Net Cash Flow
            </span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl sm:text-2xl font-serif font-bold text-emerald-700 mt-1">
            +${Math.round(totals.netCashFlow).toLocaleString()}
          </div>
          <div className="text-[11px] text-stone-500 mt-0.5">
            After wages, timber & overheads
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
              Orders Status
            </span>
            <Package className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl sm:text-2xl font-serif font-bold text-stone-900 mt-1">
            {totals.deliveredOrders} Delivered
          </div>
          <div className="text-[11px] text-stone-500 mt-0.5">
            8 remaining in workshop production
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
              Staff Capacity
            </span>
            <Users className="w-4 h-4 text-stone-600" />
          </div>
          <div className="text-xl sm:text-2xl font-serif font-bold text-stone-900 mt-1">
            {totals.activeStaff} Active
          </div>
          <div className="text-[11px] text-stone-500 mt-0.5">
            {totals.resignedStaff} historical resignations
          </div>
        </div>
      </div>

      {/* 1. All Orders Explorer (As shown in the User's Photo) */}
      <section className="space-y-4">
        {/* Search & Dropdown Filter Bar */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            <input
              id="general-orders-search-input"
              type="text"
              placeholder="Search by Order #, Customer ID, Product, or Designer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-stone-50 rounded-xl text-xs sm:text-sm border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-stone-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <select
              id="filter-product-dropdown"
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-700 font-medium cursor-pointer"
            >
              <option value="ALL">All Products</option>
              {productTypes.map((pt) => (
                <option key={pt} value={pt}>
                  {pt}
                </option>
              ))}
            </select>

            <select
              id="filter-material-dropdown"
              value={selectedMaterial}
              onChange={(e) => setSelectedMaterial(e.target.value)}
              className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-700 font-medium cursor-pointer"
            >
              <option value="ALL">All Timber Types</option>
              {materials.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>

            <select
              id="filter-status-dropdown"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-700 font-medium cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="DELIVERED">Delivered</option>
              <option value="IN_PRODUCTION">In Production</option>
            </select>
          </div>
        </div>

        {/* Orders Table Container */}
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-stone-200 flex items-center justify-between text-xs text-stone-500 bg-stone-50/50">
            <span>
              Showing <strong>{filteredOrders.length}</strong> of {orders.length} orders
            </span>
            <span className="text-stone-400 hidden sm:inline">
              Click any row to inspect unit cost breakdown
            </span>
          </div>

          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead className="sticky top-0 bg-stone-50 text-stone-600 font-semibold border-b border-stone-200 z-10">
                <tr>
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Product Line</th>
                  <th className="py-3 px-4">Timber Spec</th>
                  <th className="py-3 px-4">Revenue</th>
                  <th className="py-3 px-4">Est. Margin</th>
                  <th className="py-3 px-4">Lead Time</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredOrders.map((o) => (
                  <tr
                    key={o.id}
                    onClick={() => setInspectedOrder(o)}
                    className="hover:bg-stone-50/80 transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-stone-900">
                      #{o.id}
                    </td>
                    <td className="py-3.5 px-4 text-stone-600 font-mono text-xs">
                      {o.customerId}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-stone-900">
                      {o.productType}
                    </td>
                    <td className="py-3.5 px-4 text-stone-600">
                      {o.materialType} ({o.materialQty} m³)
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-stone-900">
                      ${Math.round(o.actualRevenue).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${
                          o.profitMargin >= 55
                            ? "bg-emerald-100 text-emerald-800"
                            : o.profitMargin >= 48
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-800"
                        }`}
                      >
                        {o.profitMargin}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-stone-600">
                      {o.leadTimeDays} days
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          o.status === "DELIVERED"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {o.status === "DELIVERED" ? "Delivered" : "In Production"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        className="p-1 text-stone-400 hover:text-stone-800 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 2. Product Profitability Summary Section */}
      <section className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif font-bold text-base sm:text-lg text-stone-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-600" />
              Product Lines Profitability Overview
            </h2>
            <p className="text-xs text-stone-500">
              Aggregated margins and revenues across all custom manufactured product categories
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-stone-50 text-stone-600 font-semibold border-b border-stone-200">
                <th className="py-2.5 px-3">Product Line</th>
                <th className="py-2.5 px-3">Orders</th>
                <th className="py-2.5 px-3">Total Revenue</th>
                <th className="py-2.5 px-3">Material Cost</th>
                <th className="py-2.5 px-3">Labor Cost</th>
                <th className="py-2.5 px-3">Gross Profit</th>
                <th className="py-2.5 px-3">Gross Margin</th>
                <th className="py-2.5 px-3">Avg Lead Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {productProfitability.map((p, idx) => (
                <tr key={idx} className="hover:bg-stone-50/80 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-stone-900">
                    {p.productType}
                  </td>
                  <td className="py-2.5 px-3 text-stone-600">
                    {p.orderCount}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-medium text-stone-900">
                    ${Math.round(p.totalRevenue).toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-stone-600">
                    ${Math.round(p.materialCost).toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-stone-600">
                    ${Math.round(p.laborCost).toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-stone-900">
                    ${Math.round(p.grossProfit).toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                      {p.profitMargin}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-stone-600">
                    {p.avgLeadTime} days
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. Operational Bottlenecks Log */}
      <section className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-2xs space-y-4">
        <div>
          <h2 className="font-serif font-bold text-base sm:text-lg text-stone-900 flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-rose-600" />
            Operational Bottlenecks & Timeline
          </h2>
          <p className="text-xs text-stone-500">
            Chronological log of supply chain stockouts, designer departures, and workshop delays
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {bottlenecks.map((b, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border text-xs space-y-2 ${
                b.severity === "CRITICAL"
                  ? "bg-rose-50/50 border-rose-200"
                  : b.severity === "HIGH"
                  ? "bg-amber-50/50 border-amber-200"
                  : "bg-blue-50/50 border-blue-200"
              }`}
            >
              <div className="flex items-center justify-between font-bold text-stone-900">
                <span>{b.title}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white font-mono uppercase">
                  {b.quarter}
                </span>
              </div>
              <p className="text-stone-700">
                <strong>Cause:</strong> {b.rootCause}
              </p>
              <p className="text-stone-600">
                <strong>Impact:</strong> {b.operationalImpact}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Timber & Staffing Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Timber Summary */}
        <section className="bg-white rounded-2xl p-5 border border-stone-200 shadow-2xs space-y-3">
          <h3 className="font-serif font-bold text-base text-stone-900 flex items-center gap-2">
            <TreePine className="w-4 h-4 text-stone-700" />
            Timber Inventory & Species
          </h3>
          <div className="space-y-2 text-xs">
            {materialSummary.map((m, idx) => (
              <div
                key={idx}
                className="p-3 bg-stone-50 rounded-xl flex items-center justify-between border border-stone-100"
              >
                <div>
                  <div className="font-bold text-stone-900">{m.material}</div>
                  <div className="text-stone-500 text-[11px]">
                    ${m.unitCost}/m³ • {m.totalConsumedM3} m³ consumed • {m.totalReorderedM3} m³ reordered
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-stone-900">
                    ${Math.round(m.totalSpent).toLocaleString()}
                  </div>
                  {m.criticalLowEvents > 0 && (
                    <span className="text-[10px] text-rose-700 font-semibold">
                      {m.criticalLowEvents} low-stock alerts
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Staffing Summary */}
        <section className="bg-white rounded-2xl p-5 border border-stone-200 shadow-2xs space-y-3">
          <h3 className="font-serif font-bold text-base text-stone-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-stone-700" />
            Staffing Roster & Resignations
          </h3>
          <div className="space-y-2 text-xs">
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 flex items-center justify-between">
              <span>Total Historical Employees Tracked</span>
              <span className="font-bold text-stone-900">{employees.length} Staff</span>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-between text-emerald-900">
              <span>Active Staff (Designers & Makers)</span>
              <span className="font-bold">{totals.activeStaff} Active</span>
            </div>
            <div className="p-3 bg-rose-50 rounded-xl border border-rose-100 flex items-center justify-between text-rose-900">
              <span>Resignations (Inc. 3 July 2025 Designers)</span>
              <span className="font-bold">{totals.resignedStaff} Departures</span>
            </div>
          </div>
        </section>
      </div>

      {/* Order Details Modal Drawer */}
      {inspectedOrder && (
        <div className="fixed inset-0 bg-stone-950/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-stone-200 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={() => setInspectedOrder(null)}
              className="absolute right-4 top-4 text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-sm font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                Order #{inspectedOrder.id}
              </span>
              <span className="text-xs text-stone-500 font-mono">
                {inspectedOrder.customerId}
              </span>
            </div>

            <h3 className="font-serif font-bold text-xl text-stone-900 mb-4">
              {inspectedOrder.productType}
            </h3>

            {/* Financials grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
                <div className="text-[10px] uppercase font-semibold text-stone-500">
                  Total Quoted & Billed
                </div>
                <div className="text-lg font-mono font-bold text-stone-900 mt-0.5">
                  ${Math.round(inspectedOrder.actualRevenue).toLocaleString()}
                </div>
              </div>
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                <div className="text-[10px] uppercase font-semibold text-emerald-800">
                  Gross Profit ({inspectedOrder.profitMargin}%)
                </div>
                <div className="text-lg font-mono font-bold text-emerald-700 mt-0.5">
                  ${Math.round(inspectedOrder.grossProfit).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Cost breakdown */}
            <div className="space-y-2 text-xs text-stone-600 mb-4 p-3.5 bg-stone-50 rounded-xl border border-stone-200">
              <div className="font-semibold text-stone-900 border-b border-stone-200 pb-1 mb-1">
                Cost Breakdown
              </div>
              <div className="flex justify-between">
                <span>Raw Timber ({inspectedOrder.materialType} • {inspectedOrder.materialQty} m³):</span>
                <span className="font-mono font-medium text-stone-900">
                  ${Math.round(inspectedOrder.materialCost).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Workshop Labor ({inspectedOrder.totalLaborHours} hrs total):</span>
                <span className="font-mono font-medium text-stone-900">
                  ${Math.round(inspectedOrder.estimatedLaborCost).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Labor hours breakdown */}
            <div className="space-y-1.5 text-xs text-stone-600 mb-4">
              <div className="font-semibold text-stone-900">Labor Stages Allocation:</div>
              <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
                <div className="bg-stone-100 p-2 rounded-lg">
                  <div className="text-stone-500">Design</div>
                  <div className="font-bold text-stone-900 mt-0.5">{inspectedOrder.designHours}h</div>
                </div>
                <div className="bg-stone-100 p-2 rounded-lg">
                  <div className="text-stone-500">Milling</div>
                  <div className="font-bold text-stone-900 mt-0.5">{inspectedOrder.millingHours}h</div>
                </div>
                <div className="bg-stone-100 p-2 rounded-lg">
                  <div className="text-stone-500">Joinery</div>
                  <div className="font-bold text-stone-900 mt-0.5">{inspectedOrder.joineryHours}h</div>
                </div>
                <div className="bg-stone-100 p-2 rounded-lg">
                  <div className="text-stone-500">Finishing</div>
                  <div className="font-bold text-stone-900 mt-0.5">{inspectedOrder.finishingHours}h</div>
                </div>
              </div>
            </div>

            {/* Production Dates & Lead time */}
            <div className="text-xs text-stone-600 pt-3 border-t border-stone-200 flex items-center justify-between">
              <div>
                <span>Started: <strong>{inspectedOrder.startDate}</strong></span>
                {inspectedOrder.completionDate && (
                  <span className="ml-3">Delivered: <strong>{inspectedOrder.completionDate}</strong></span>
                )}
              </div>
              <div className="font-medium">
                Lead Time: <span className="font-bold text-stone-900">{inspectedOrder.leadTimeDays} days</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
