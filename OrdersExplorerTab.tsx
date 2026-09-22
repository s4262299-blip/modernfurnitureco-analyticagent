import React, { useState } from "react";
import { Search, Filter, CheckCircle2, Clock, X, Eye, ArrowUpDown } from "lucide-react";
import { OrderRecord } from "../data/furnitureData";

interface OrdersExplorerTabProps {
  orders: OrderRecord[];
}

export const OrdersExplorerTab: React.FC<OrdersExplorerTabProps> = ({ orders }) => {
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
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by Order #, Customer ID, Product, or Designer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-stone-50 rounded-xl text-xs sm:text-sm border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Product type filter */}
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-700 font-medium"
          >
            <option value="ALL">All Products</option>
            {productTypes.map((pt) => (
              <option key={pt} value={pt}>
                {pt}
              </option>
            ))}
          </select>

          {/* Material filter */}
          <select
            value={selectedMaterial}
            onChange={(e) => setSelectedMaterial(e.target.value)}
            className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-700 font-medium"
          >
            <option value="ALL">All Timber Types</option>
            {materials.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-700 font-medium"
          >
            <option value="ALL">All Statuses</option>
            <option value="DELIVERED">Delivered</option>
            <option value="IN_PRODUCTION">In Production</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-stone-200 flex items-center justify-between text-xs text-stone-500">
          <span>
            Showing <strong>{filteredOrders.length}</strong> of {orders.length} orders
          </span>
          <span className="text-stone-400">Click any row to inspect unit cost breakdown</span>
        </div>

        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead className="sticky top-0 bg-stone-50 text-stone-600 font-semibold border-b border-stone-200 z-10">
              <tr>
                <th className="py-3 px-3">Order #</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Product Line</th>
                <th className="py-3 px-3">Timber Spec</th>
                <th className="py-3 px-3">Revenue</th>
                <th className="py-3 px-3">Est. Margin</th>
                <th className="py-3 px-3">Lead Time</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredOrders.map((o) => (
                <tr
                  key={o.id}
                  onClick={() => setInspectedOrder(o)}
                  className="hover:bg-stone-50/80 transition-colors cursor-pointer"
                >
                  <td className="py-3 px-3 font-mono font-bold text-stone-900">
                    #{o.id}
                  </td>
                  <td className="py-3 px-3 text-stone-600 font-mono text-xs">
                    {o.customerId}
                  </td>
                  <td className="py-3 px-3 font-semibold text-stone-900">
                    {o.productType}
                  </td>
                  <td className="py-3 px-3 text-stone-600">
                    {o.materialType} ({o.materialQty} m³)
                  </td>
                  <td className="py-3 px-3 font-mono font-medium text-stone-900">
                    ${Math.round(o.actualRevenue).toLocaleString()}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center px-1.5 py-0.5 rounded-sm text-xs font-semibold ${
                        o.profitMargin >= 55
                          ? "bg-emerald-100 text-emerald-800"
                          : o.profitMargin >= 45
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-800"
                      }`}
                    >
                      {o.profitMargin}%
                    </span>
                  </td>
                  <td className="py-3 px-3 text-stone-600">
                    <span className={o.leadTimeDays > 14 ? "text-amber-700 font-medium" : ""}>
                      {o.leadTimeDays} days
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        o.status === "DELIVERED"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {o.status === "DELIVERED" ? "Delivered" : "In Production"}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      type="button"
                      className="p-1 text-stone-400 hover:text-stone-900 transition-colors"
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

      {/* Order Details Modal Drawer */}
      {inspectedOrder && (
        <div className="fixed inset-0 bg-stone-950/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-stone-200 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={() => setInspectedOrder(null)}
              className="absolute right-4 top-4 text-stone-400 hover:text-stone-700 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-sm font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
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
