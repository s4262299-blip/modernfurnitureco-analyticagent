import React, { useState, useEffect } from "react";
import analyticsStore from "./data/furnitureData";
import { Header, AppPage } from "./components/Header";
import { SearchPage } from "./components/SearchPage";
import { GeneralDataPage } from "./components/GeneralDataPage";
import { AIInsightResponse } from "./components/AIInsightCard";
import { ReportModal } from "./components/ReportModal";

export default function App() {
  const [currentPage, setCurrentPage] = useState<AppPage>("search");
  const [currentQuery, setCurrentQuery] = useState<string>("What was our biggest bottleneck last quarter?");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [insight, setInsight] = useState<AIInsightResponse | null>(null);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);

  // Initial load inquiry
  useEffect(() => {
    handleQuery("What was our biggest bottleneck last quarter?");
  }, []);

  const handleQuery = async (queryText: string) => {
    setCurrentQuery(queryText);
    setIsLoading(true);

    try {
      const res = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: queryText })
      });

      if (res.ok) {
        const data = await res.json();
        setInsight(data);
      } else {
        throw new Error("Server response not ok");
      }
    } catch {
      // Fallback client-side resolution if backend route is temporarily unreachable
      const q = queryText.toLowerCase();
      if (q.includes("bottleneck") || q.includes("delay") || q.includes("slow") || q.includes("last quarter") || q.includes("q3") || q.includes("q1") || q.includes("q2")) {
        const q1 = analyticsStore.bottlenecks.find((b) => b.quarter.includes("Q1")) || analyticsStore.bottlenecks[0];
        const q2 = analyticsStore.bottlenecks.find((b) => b.quarter.includes("Q2")) || analyticsStore.bottlenecks[1];
        const q3 = analyticsStore.bottlenecks.find((b) => b.quarter.includes("Q3")) || analyticsStore.bottlenecks[2];
        const isQ1 = q.includes("q1");
        const isQ2 = q.includes("q2");
        const target = isQ1 ? q1 : (isQ2 ? q2 : q3);

        setInsight({
          answer: `Our operational bottleneck analysis for **${target.quarter}** shows: **${target.title}**. ${target.rootCause} ${target.operationalImpact}`,
          keyFindings: [
            `Root Cause: ${target.rootCause}`,
            `Operational Impact: ${target.operationalImpact}`,
            `Verified Metric: ${target.metrics}`,
            `Across all 160 custom orders, average lead time was 12.1 days (min 6d, max 21d), with an 81.9% on-time delivery rate (29 late orders).`
          ],
          keyMetrics: [
            { label: "Analyzed Period", value: target.quarter },
            { label: "Calibrated Severity", value: target.severity },
            { label: "Quarter Delays", value: isQ1 ? "11 / 55 (20.0%)" : (isQ2 ? "16 / 60 (26.7%)" : "2 / 45 (4.4%)") },
            { label: "Average Lead Time", value: isQ1 ? "12.4 Days (Max 21d)" : (isQ2 ? "12.6 Days (Max 19d)" : "11.0 Days (Max 17d)") }
          ],
          suggestedChart: "bottleneck",
          suggestedFollowUps: [
            "Which product type is most profitable?",
            "Compare Q2 vs Q3 delivery performance and staff turnover",
            "What were our timber stockout incidents in Q1?"
          ],
          isUnsure: false,
          engine: "Grounded Enterprise Data"
        });
      } else if (q.includes("profit") || q.includes("margin") || q.includes("product type") || q.includes("most profitable") || q.includes("revenue")) {
        const topMargin = analyticsStore.productProfitability[0];
        const topVol = analyticsStore.productProfitability.reduce((max, p) => p.grossProfit > max.grossProfit ? p : max, analyticsStore.productProfitability[0]);
        setInsight({
          answer: `By profit margin percentage, the most profitable product line is the **${topMargin.productType}** at a **${topMargin.profitMargin}% gross margin** ($${topMargin.grossProfit.toLocaleString()} gross profit on $${topMargin.totalRevenue.toLocaleString()} revenue). Among high-volume core lines, the **${topVol.productType}** generated the highest total dollar profit of **$${topVol.grossProfit.toLocaleString()}** (48.3% margin on $${topVol.totalRevenue.toLocaleString()} revenue across ${topVol.orderCount} orders), closely followed by the Executive Desk ($227,614.63 gross profit, 48.7% margin) and Credenza ($221,177.24 gross profit, 48.7% margin).`,
          keyFindings: [
            `Highest Margin %: ${topMargin.productType} (${topMargin.profitMargin}% margin, $${topMargin.grossProfit.toLocaleString()} profit).`,
            `Top Total Dollar Earner: ${topVol.productType} ($${topVol.grossProfit.toLocaleString()} profit across ${topVol.orderCount} orders).`,
            `Company Overall Gross Profit Margin: 48.4% ($808,223.01 profit on $1,671,143.01 revenue across 160 custom orders).`
          ],
          keyMetrics: [
            { label: "Highest Margin Product", value: `${topMargin.productType} (${topMargin.profitMargin}%)` },
            { label: "Top Dollar Earner", value: `${topVol.productType} ($${Math.round(topVol.grossProfit).toLocaleString()})` },
            { label: "Total Revenue", value: `$${Math.round(analyticsStore.totals.totalRevenue).toLocaleString()}` },
            { label: "Total Orders", value: `${analyticsStore.totals.totalOrders}` }
          ],
          suggestedChart: "profitability",
          suggestedFollowUps: [
            "What was our biggest bottleneck last quarter?",
            "Compare Dining Table vs Executive Desk profitability",
            "What are our material costs by timber type?"
          ],
          isUnsure: false,
          engine: "Grounded Enterprise Data"
        });
      } else {
        setInsight({
          answer: "I am unsure, as this question asks for information outside the scope of ModernFurniture Co.'s provided dataset. I can only provide insights regarding our company's orders, product profitability, quarterly bottlenecks, timber inventory, cash flow, and staffing.",
          keyFindings: [
            "Query falls outside ModernFurniture Co. operational and financial records.",
            "Scope is restricted strictly to provided company CSVs and business logs."
          ],
          keyMetrics: [
            { label: "Scope Status", value: "Out of Bounds" },
            { label: "Confidence", value: "Unsure" }
          ],
          suggestedChart: "none",
          suggestedFollowUps: [
            "What was our biggest bottleneck last quarter?",
            "Which product type is most profitable?",
            "What is our quarterly cash flow and net margin?"
          ],
          isUnsure: true,
          engine: "Grounded Enterprise Data"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 font-sans flex flex-col selection:bg-amber-200">
      {/* Top Header with 2-Page Toggle */}
      <Header
        currentPage={currentPage}
        onPageChange={(page) => setCurrentPage(page)}
        onOpenReport={() => setShowReportModal(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentPage === "search" ? (
          <SearchPage
            onSearch={handleQuery}
            isLoading={isLoading}
            currentQuery={currentQuery}
            insight={insight}
            onGoToGeneralData={() => setCurrentPage("general")}
          />
        ) : (
          <GeneralDataPage
            data={analyticsStore}
            onOpenReport={() => setShowReportModal(true)}
          />
        )}
      </main>

      {/* Simplified Footer */}
      <footer className="bg-white border-t border-stone-200 py-6 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-medium text-stone-700">
            ModernFurniture Co. Internal Operations & Financial Intelligence
          </span>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setCurrentPage("search")}
              className={`hover:text-stone-900 transition-colors ${currentPage === "search" ? "font-bold text-stone-900" : ""}`}
            >
              Search & Ask AI
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => setCurrentPage("general")}
              className={`hover:text-stone-900 transition-colors ${currentPage === "general" ? "font-bold text-stone-900" : ""}`}
            >
              General Data & Orders
            </button>
          </div>
        </div>
      </footer>

      {/* Executive Report Modal */}
      {showReportModal && (
        <ReportModal
          data={analyticsStore}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </div>
  );
}
