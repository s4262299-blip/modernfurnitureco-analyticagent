import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import analyticsStore from "./src/data/furnitureData.ts";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini Client
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return geminiClient;
}

// Health check endpoint
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Full analytics data endpoint
app.get("/api/data", (_req: Request, res: Response) => {
  res.json(analyticsStore);
});

// Deterministic Analytical Engine for ModernFurniture Co.
function getDeterministicInsight(query: string) {
  const q = query.toLowerCase().trim();

  // Out of scope check
  const furnitureKeywords = [
    "bottleneck", "delay", "quarter", "profit", "margin", "product", "revenue",
    "cash", "cost", "material", "timber", "walnut", "oak", "ash", "inventory",
    "stock", "designer", "maker", "employee", "staff", "resignation", "hr",
    "order", "lead time", "wage", "overhead", "q1", "q2", "q3", "table", "desk",
    "chair", "credenza", "bookshelf", "performance", "forecast", "overview", "summary"
  ];

  const hasRelevantKeyword = furnitureKeywords.some((kw) => q.includes(kw));
  if (!hasRelevantKeyword && q.length > 3) {
    return {
      answer: "I am unsure, as this question asks for information outside the scope of ModernFurniture Co.'s provided business dataset. I can only provide insights regarding our company's orders, product profitability, quarterly bottlenecks, timber inventory, cash flow, and staffing.",
      keyFindings: [
        "Query falls outside ModernFurniture Co. operational and financial records.",
        "Scope is restricted strictly to provided company CSVs and business logs."
      ],
      keyMetrics: [
        { label: "Data Scope Status", value: "Out of Bounds" },
        { label: "Confidence", value: "Unsure" }
      ],
      suggestedChart: "none",
      suggestedFollowUps: [
        "What was our biggest bottleneck last quarter?",
        "Which product type is most profitable?",
        "What is our current cash flow and quarterly margin?"
      ],
      isUnsure: true
    };
  }

  // Bottlenecks — computed directly from orders_data.csv stage hours & delivery status
  if (q.includes("bottleneck") || q.includes("delay") || q.includes("slow") || q.includes("last quarter") || q.includes("q3") || q.includes("q1") || q.includes("q2")) {
    const b = analyticsStore.bottleneckSummary;
    const stageEntries = Object.entries(b.avgHoursByStage);
    const stageList = stageEntries.map(([stage, hrs]) => `${stage} (${hrs}h avg)`).join(", ");
    const quarterEntries = Object.entries(b.lateDeliveryRateByQuarter);
    const worstQuarter = quarterEntries.reduce((max, cur) => (cur[1] > max[1] ? cur : max), quarterEntries[0]);

    return {
      answer: `Across all ${analyticsStore.totals.deliveredOrders} delivered orders, the **${b.slowestStageByAvgHours}** stage takes the longest on average at **${b.avgHoursByStage[b.slowestStageByAvgHours as keyof typeof b.avgHoursByStage]} hours per order** — this is the biggest production bottleneck. By quarter, late-delivery rate peaked in **${worstQuarter[0]}** at **${worstQuarter[1]}%** of orders delivered late.`,
      keyFindings: [
        `Average hours per stage across all delivered orders: ${stageList}.`,
        `Slowest stage: ${b.slowestStageByAvgHours}.`,
        `Worst quarter for late deliveries: ${worstQuarter[0]} (${worstQuarter[1]}% late).`,
        `Overall: ${analyticsStore.totals.deliveredOrders} delivered, ${analyticsStore.totals.lostOrders} lost, ${analyticsStore.totals.inProductionOrders} still in production, out of ${analyticsStore.totals.totalOrders} total inquiries.`
      ],
      keyMetrics: [
        { label: "Slowest Stage", value: `${b.slowestStageByAvgHours} (${b.avgHoursByStage[b.slowestStageByAvgHours as keyof typeof b.avgHoursByStage]}h avg)` },
        { label: "Worst Quarter (Late %)", value: `${worstQuarter[0]}: ${worstQuarter[1]}%` },
        { label: "Total Delivered Orders", value: `${analyticsStore.totals.deliveredOrders}` },
        { label: "Total Orders Analyzed", value: `${analyticsStore.totals.totalOrders}` }
      ],
      suggestedChart: "bottleneck",
      suggestedFollowUps: [
        "Which product type is most profitable?",
        "Show me our timber inventory and stockout risks",
        "How did staff resignations affect delivery times?"
      ],
      isUnsure: false
    };
  }

  // Profitability — from real orders_data.csv product types only, ranked by total gross profit,
  // with margin % shown alongside since the two rankings can differ.
  if (q.includes("profit") || q.includes("margin") || q.includes("product type") || q.includes("most profitable") || q.includes("revenue")) {
    const byProfit = [...analyticsStore.productProfitability].sort((a, b) => b.grossProfit - a.grossProfit);
    const byMargin = [...analyticsStore.productProfitability].sort((a, b) => b.profitMargin - a.profitMargin);
    const topProfit = byProfit[0];
    const topMargin = byMargin[0];
    const runnerUp = byProfit[1];

    return {
      answer: `By total dollar profit, the **${topProfit.productType}** is the most profitable product type, generating **$${topProfit.grossProfit.toLocaleString()}** in gross profit (${topProfit.profitMargin}% margin) across ${topProfit.deliveredOrderCount} delivered orders. By margin percentage alone, the **${topMargin.productType}** edges it out at ${topMargin.profitMargin}%, but ${topProfit.productType} is close behind (${topProfit.profitMargin}%) with far higher volume. ${runnerUp.productType} is the closest competitor by total profit ($${runnerUp.grossProfit.toLocaleString()}).`,
      keyFindings: analyticsStore.productProfitability
        .sort((a, b) => b.grossProfit - a.grossProfit)
        .map((p) => `${p.productType}: $${p.grossProfit.toLocaleString()} gross profit (${p.profitMargin}% margin) across ${p.deliveredOrderCount} delivered / ${p.lostCount} lost (win rate ${p.winRatePct}%).`),
      keyMetrics: [
        { label: "Top by Total Profit", value: `${topProfit.productType} ($${Math.round(topProfit.grossProfit).toLocaleString()})` },
        { label: "Top by Margin %", value: `${topMargin.productType} (${topMargin.profitMargin}%)` },
        { label: "Delivered Orders (all types)", value: `${analyticsStore.totals.deliveredOrders}` },
        { label: "Lost Inquiries (all types)", value: `${analyticsStore.totals.lostOrders}` }
      ],
      suggestedChart: "profitability",
      suggestedFollowUps: [
        "What was our biggest bottleneck?",
        "Which product type has the highest win rate?",
        "What are our material costs by timber type?"
      ],
      isUnsure: false
    };
  }

  // Cash flow / Financials
  // NOTE: financial_ledger.csv only covers the ledgerPeriod window; orders_data.csv covers a
  // much longer span. These are reported separately rather than combined (see dataScopeNote).
  if (q.includes("cash") || q.includes("cost") || q.includes("overhead") || q.includes("wage") || q.includes("financial")) {
    const totals = analyticsStore.totals;
    const bestQuarter = [...analyticsStore.quarterlyData].sort((a, b) => b.netProfit - a.netProfit)[0];
    const worstQuarter = [...analyticsStore.quarterlyData].sort((a, b) => a.netProfit - b.netProfit)[0];

    return {
      answer: `For the period our financial ledger actually covers (${totals.ledgerPeriod}), ModernFurniture Co. recorded **$${totals.ledgerRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}** in revenue against **$${totals.ledgerCosts.toLocaleString(undefined, { minimumFractionDigits: 2 })}** in costs, a net cash flow of **+$${totals.ledgerNetCashFlow.toLocaleString(undefined, { minimumFractionDigits: 2 })}**. ${bestQuarter.quarter} was the strongest quarter (+$${bestQuarter.netProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })} net profit) and ${worstQuarter.quarter} the weakest (${worstQuarter.netProfit >= 0 ? "+" : ""}$${worstQuarter.netProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}). Separately, across the full order pipeline in orders_data.csv, delivered orders represent $${totals.fullPipelineQuotedRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })} in quoted contract value — this figure spans a longer period than the ledger, so it isn't directly comparable to the cash totals above.`,
      keyFindings: [
        `Ledger period (${totals.ledgerPeriod}): $${totals.ledgerRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })} revenue, $${totals.ledgerCosts.toLocaleString(undefined, { minimumFractionDigits: 2 })} costs, net +$${totals.ledgerNetCashFlow.toLocaleString(undefined, { minimumFractionDigits: 2 })}.`,
        `Best quarter: ${bestQuarter.quarter} (+$${bestQuarter.netProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })} net, ${bestQuarter.profitMargin}% margin).`,
        `Weakest quarter: ${worstQuarter.quarter} ($${worstQuarter.netProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })} net, ${worstQuarter.profitMargin}% margin).`,
        analyticsStore.dataScopeNote
      ],
      keyMetrics: [
        { label: "Ledger Revenue", value: `$${Math.round(totals.ledgerRevenue).toLocaleString()}` },
        { label: "Ledger Costs", value: `$${Math.round(totals.ledgerCosts).toLocaleString()}` },
        { label: "Ledger Net Cash Flow", value: `+$${Math.round(totals.ledgerNetCashFlow).toLocaleString()}` },
        { label: "Best Quarter", value: `${bestQuarter.quarter} (+$${Math.round(bestQuarter.netProfit).toLocaleString()})` }
      ],
      suggestedChart: "cashflow",
      suggestedFollowUps: [
        "What was our biggest bottleneck?",
        "How much do we spend on timber reorders vs daily wages?",
        "Which product type generates the most revenue?"
      ],
      isUnsure: false
    };
  }

  // Material inventory
  if (q.includes("material") || q.includes("timber") || q.includes("walnut") || q.includes("oak") || q.includes("ash") || q.includes("stock") || q.includes("inventory")) {
    const walnut = analyticsStore.materialSummary.find((m) => m.material.includes("Walnut"))!;
    const oak = analyticsStore.materialSummary.find((m) => m.material.includes("Oak"))!;
    const ash = analyticsStore.materialSummary.find((m) => m.material.includes("Ash"))!;

    return {
      answer: `We utilize three core timber species with verified unit costs from our supplier reorder invoices: **American Walnut** ($2,500/m³), **Tasmanian Oak** ($1,200/m³), and **Victorian Ash** ($1,400/m³). **American Walnut** represented our primary supply disruption in Q1: warehouse inventory reached 0 m³ on March 16, 2025 for 1 day before an 8 m³ reorder replenished stock.`,
      keyFindings: [
        `American Walnut: 98.0 m³ consumed, $260,000.00 spent across 13 reorders (104.0 m³ reordered). Hit 0 m³ on 2025-03-16 for 1 day.`,
        `Tasmanian Oak: 100.0 m³ consumed, $132,000.00 spent across 11 reorders (110.0 m³ reordered). Stable inventory with 0 stockout incidents.`,
        `Victorian Ash: 116.0 m³ consumed, $168,000.00 spent across 15 reorders (120.0 m³ reordered). Reached 2 m³ threshold once on May 3, 2025.`
      ],
      keyMetrics: [
        { label: "American Walnut Stockout", value: "1 Day (March 16, 2025)" },
        { label: "Walnut Unit Price", value: "$2,500 / m³" },
        { label: "Total Timber Reordered", value: "334.0 m³" },
        { label: "Total Timber Spend", value: "$560,000.00" }
      ],
      suggestedChart: "materials",
      suggestedFollowUps: [
        "What was our biggest bottleneck last quarter?",
        "Which product type is most profitable?",
        "How did timber stockouts impact order completion dates?"
      ],
      isUnsure: false
    };
  }

  // Staffing / HR — counts and resignation list pulled live from hr_roster.csv / hr_events_log.csv
  if (q.includes("staff") || q.includes("designer") || q.includes("maker") || q.includes("employee") || q.includes("resignation") || q.includes("hr")) {
    const active = analyticsStore.employees.filter((e) => e.status === "Active").length;
    const resigned = analyticsStore.employees.filter((e) => e.status === "Resigned").length;
    const resignationEvents = analyticsStore.hrEvents
      .filter((e) => e.event === "Resignation")
      .sort((a, b) => a.date.localeCompare(b.date));
    const resignationList = resignationEvents.map((e) => `${e.employeeId} (${e.date})`).join(", ");

    return {
      answer: `Our roster consists of **${analyticsStore.employees.length} tracked employees** (${active} active, ${resigned} resigned) across the full company record. There have been **${resignationEvents.length} resignation events** logged in total: ${resignationList}. To see how a specific resignation affected delivery times, ask about a particular date range or employee.`,
      keyFindings: [
        `Total Employees Tracked: ${analyticsStore.employees.length} (${active} Active, ${resigned} Resigned).`,
        `Total Resignation Events: ${resignationEvents.length}.`,
        `Most recent resignation: ${resignationEvents[resignationEvents.length - 1]?.employeeId} on ${resignationEvents[resignationEvents.length - 1]?.date}.`,
        `Full resignation timeline: ${resignationList}.`
      ],
      keyMetrics: [
        { label: "Total Staff Tracked", value: `${analyticsStore.employees.length} Employees` },
        { label: "Active Roster", value: `${active} Employees` },
        { label: "Total Resignations", value: `${resignationEvents.length}` },
        { label: "Most Recent Resignation", value: `${resignationEvents[resignationEvents.length - 1]?.employeeId} (${resignationEvents[resignationEvents.length - 1]?.date})` }
      ],
      suggestedChart: "staffing",
      suggestedFollowUps: [
        "What was our biggest bottleneck?",
        "How did staff resignations impact our delivery lead times?",
        "Which product type is most profitable?"
      ],
      isUnsure: false
    };
  }

  // Default general overview — assembled live from analyticsStore, not hardcoded
  const t = analyticsStore.totals;
  const topByProfit = [...analyticsStore.productProfitability].sort((a, b) => b.grossProfit - a.grossProfit)[0];
  const b = analyticsStore.bottleneckSummary;
  return {
    answer: `Here is the executive overview for ModernFurniture Co.: across ${t.totalOrders} inquiries, ${t.deliveredOrders} were delivered, ${t.lostOrders} were lost, and ${t.inProductionOrders} are still in production (overall win rate ${t.overallWinRatePct}%). For the ledger's own reporting window (${t.ledgerPeriod}), we recorded $${t.ledgerRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })} in revenue against $${t.ledgerCosts.toLocaleString(undefined, { minimumFractionDigits: 2 })} in costs (net +$${t.ledgerNetCashFlow.toLocaleString(undefined, { minimumFractionDigits: 2 })}). The most profitable product type by total gross profit is the **${topByProfit.productType}** ($${topByProfit.grossProfit.toLocaleString()}, ${topByProfit.profitMargin}% margin). The **${b.slowestStageByAvgHours}** stage is our biggest production bottleneck at ${b.avgHoursByStage[b.slowestStageByAvgHours as keyof typeof b.avgHoursByStage]} hours per order on average.`,
    keyFindings: [
      `Orders: ${t.deliveredOrders} delivered, ${t.lostOrders} lost, ${t.inProductionOrders} in production (${t.totalOrders} total, ${t.overallWinRatePct}% win rate).`,
      `Ledger period (${t.ledgerPeriod}): $${t.ledgerRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })} revenue, $${t.ledgerCosts.toLocaleString(undefined, { minimumFractionDigits: 2 })} costs, +$${t.ledgerNetCashFlow.toLocaleString(undefined, { minimumFractionDigits: 2 })} net.`,
      `Top product by profit: ${topByProfit.productType} ($${topByProfit.grossProfit.toLocaleString()} gross profit, ${topByProfit.profitMargin}% margin).`,
      `Biggest bottleneck: ${b.slowestStageByAvgHours} stage (${b.avgHoursByStage[b.slowestStageByAvgHours as keyof typeof b.avgHoursByStage]}h avg per order).`
    ],
    keyMetrics: [
      { label: "Total Inquiries", value: `${t.totalOrders}` },
      { label: "Win Rate", value: `${t.overallWinRatePct}%` },
      { label: "Top Product (Profit)", value: `${topByProfit.productType} ($${Math.round(topByProfit.grossProfit).toLocaleString()})` },
      { label: "Ledger Net Cash Flow", value: `+$${Math.round(t.ledgerNetCashFlow).toLocaleString()}` }
    ],
    suggestedChart: "profitability",
    suggestedFollowUps: [
      "What was our biggest bottleneck?",
      "Which product type is most profitable?",
      "Show me our timber inventory and stockout risks"
    ],
    isUnsure: false
  };
}

// AI Query Endpoint
app.post("/api/query", async (req: Request, res: Response) => {
  const { query } = req.body;

  if (!query || typeof query !== "string") {
    return res.status(400).json({ error: "Query is required" });
  }

  const ai = getGeminiClient();

  // If Gemini API is not available, return deterministic engine insight
  if (!ai) {
    const fallbackResponse = getDeterministicInsight(query);
    return res.json({
      ...fallbackResponse,
      engine: "Deterministic Analytical Engine (Ground Truth Data)"
    });
  }

  // If Gemini is available, ground it strictly in the dataset with graceful multi-model failover
  const CANDIDATE_MODELS = ["gemini-3.8-flash", "gemini-3.1-flash-lite"];

  const dataContext = JSON.stringify({
    dataScopeNote: analyticsStore.dataScopeNote,
    totals: analyticsStore.totals,
    productProfitability: analyticsStore.productProfitability,
    quarterlyData: analyticsStore.quarterlyData,
    bottleneckSummary: analyticsStore.bottleneckSummary,
    materialSummary: analyticsStore.materialSummary,
    employeeCount: analyticsStore.employees.length,
    resignedCount: analyticsStore.totals.resignedStaff,
    resignationEvents: analyticsStore.hrEvents.filter((e) => e.event === "Resignation")
  });

  const prompt = `You are the executive AI Analyst for ModernFurniture Co. managers.
CRITICAL DATA ANALYSIS AND SCOPE GUIDELINES:
1. GROUND EVERY NUMBER IN SOURCE DATA:
   - Every statistic, count, average, or chart value must be computed directly from the provided dataset — never estimated, extrapolated, or recalled from prior assumptions.
   - Values must strictly match the provided company records. Do not generate "illustrative" or "approximate" figures and present them as real.
2. VERIFY CAUSAL CLAIMS AGAINST OUTCOMES:
   - Before claiming an event caused a negative or positive impact (e.g., "X caused a bottleneck/delay"), verify the actual downstream metric (lead time, late delivery count, revenue) for that specific period.
   - Only assert causation if the outcome metric actually moved in that direction. If the metric is flat, improved, or inconclusive (such as Q3 lead times improving to 11.0 days despite July designer departures), state that explicitly instead of asserting an unverified negative impact.
   - Clearly distinguish between "this event occurred" and "this event caused this outcome".
3. CALIBRATE SEVERITY LABELS TO DATA:
   - Labels like "Critical" or "Severe" must be justified by comparing the period in question against other comparable periods on actual outcome metrics.
   - If a period was average or best-in-class on outcome metrics (e.g. Q3 having 95.6% on-time delivery), do not apply an alarming severity label — report the neutral finding.
4. AVOID OVERSTATED LANGUAGE:
   - Do not round up or dramatize magnitudes (e.g., report a 42.9% reduction, not "cut in half"; note that the Walnut stockout lasted 1 day on March 16). Note recovery duration and exact figures.
5. SELF-CHECK BEFORE FINALIZING:
   - Re-check all cited numbers against the provided dataset. If a query falls outside the provided records, declare you are unsure because it is outside the scope of ModernFurniture Co.'s dataset.

COMPANY DATA:
${dataContext}

MANAGER'S QUESTION:
"${query}"

Respond with a JSON object strictly matching this schema:
{
  "answer": "string - plain English, conversational, executive explanation adhering to the 5 rules above",
  "keyFindings": ["string", "string", ...],
  "keyMetrics": [{"label": "string", "value": "string"}],
  "suggestedChart": "profitability" | "bottleneck" | "cashflow" | "staffing" | "materials" | "none",
  "suggestedFollowUps": ["string", "string", "string"],
  "isUnsure": boolean
}`;

  for (const modelName of CANDIDATE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      const responseText = response.text || "";
      if (responseText) {
        const parsed = JSON.parse(responseText);
        return res.json({
          ...parsed,
          engine: `${modelName} (Grounded in ModernFurniture Co. Data)`
        });
      }
    } catch {
      // If candidate model experiences temporary high demand (503/429), try next model
      continue;
    }
  }

  // If all models are temporarily busy or unavailable, cleanly serve via grounded analytical engine
  const fallback = getDeterministicInsight(query);
  return res.json({
    ...fallback,
    engine: "Grounded Enterprise Analytics Engine"
  });
});

// Vite / Static setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ModernFurniture Co. server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
