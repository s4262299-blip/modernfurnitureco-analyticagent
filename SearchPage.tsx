import React from "react";
import { Search, Sparkles, HelpCircle, ArrowRight, Loader2 } from "lucide-react";
import { AIInsightCard, AIInsightResponse } from "./AIInsightCard";

interface SearchPageProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
  currentQuery: string;
  insight: AIInsightResponse | null;
  onGoToGeneralData: () => void;
}

const SAMPLE_QUESTIONS = [
  "What was our biggest bottleneck last quarter?",
  "Which product type is most profitable?",
  "What is our quarterly cash flow and net margin?",
  "What were our timber inventory levels and stockout risks?",
  "How did staff resignations impact manufacturing lead times?"
];

export const SearchPage: React.FC<SearchPageProps> = ({
  onSearch,
  isLoading,
  currentQuery,
  insight,
  onGoToGeneralData
}) => {
  const [inputValue, setInputValue] = React.useState(currentQuery);

  React.useEffect(() => {
    setInputValue(currentQuery);
  }, [currentQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSearch(inputValue.trim());
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 py-2 sm:py-4">
      {/* Intro Heading & Search Box */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Managerial Natural Language Query Engine</span>
        </div>
        <h1 className="font-serif font-bold text-2xl sm:text-3xl text-stone-900 tracking-tight">
          Ask Key Analytical Insights in Plain English
        </h1>
        <p className="text-stone-500 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
          Ask questions about ModernFurniture Co.&apos;s operations, quarterly bottlenecks, profitability, timber supply, or staffing to pull instant grounded findings.
        </p>
      </div>

      {/* Main Search Bar Form */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="bg-white rounded-2xl p-2 sm:p-2.5 border-2 border-stone-200 focus-within:border-stone-900 shadow-sm transition-all flex items-center gap-2">
          <Search className="w-5 h-5 text-stone-400 ml-3 shrink-0" />
          <input
            id="natural-language-search-input"
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="e.g., What was our biggest bottleneck last quarter? or Which product is most profitable?"
            className="flex-1 bg-transparent py-2 sm:py-2.5 text-sm sm:text-base text-stone-900 placeholder:text-stone-400 focus:outline-hidden"
          />
          <button
            id="submit-search-button"
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 text-stone-100 font-semibold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer flex items-center gap-2 shrink-0 shadow-xs"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-stone-300" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <span>Search</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Recommended Quick Question Chips */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-stone-500 px-1">
          <span className="flex items-center gap-1 font-medium">
            <HelpCircle className="w-3.5 h-3.5 text-stone-400" />
            Quick managerial questions to try:
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              id={`quick-question-chip-${idx}`}
              type="button"
              onClick={() => onSearch(q)}
              className="text-xs text-stone-700 hover:text-stone-950 bg-white hover:bg-stone-50 border border-stone-200 hover:border-stone-400 px-3.5 py-2 rounded-xl transition-all shadow-2xs text-left cursor-pointer flex items-center gap-1.5"
            >
              <span>{q}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs animate-pulse space-y-4">
          <div className="h-4 bg-stone-200 rounded-md w-1/4"></div>
          <div className="h-6 bg-stone-200 rounded-md w-3/4"></div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="h-16 bg-stone-100 rounded-xl"></div>
            <div className="h-16 bg-stone-100 rounded-xl"></div>
            <div className="h-16 bg-stone-100 rounded-xl"></div>
            <div className="h-16 bg-stone-100 rounded-xl"></div>
          </div>
          <div className="h-48 bg-stone-100 rounded-xl"></div>
        </div>
      )}

      {/* Pulled AI Insight Result */}
      {!isLoading && insight && (
        <section className="animate-in fade-in duration-200">
          <AIInsightCard
            insight={insight}
            onSelectFollowUp={onSearch}
            onGoToGeneralData={onGoToGeneralData}
          />
        </section>
      )}

      {/* Bottom Switch to General Page Banner */}
      <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-600">
        <div>
          <span className="font-semibold text-stone-900 block">
            Prefer browsing raw tables and complete order logs?
          </span>
          <span className="text-stone-500">
            View all 160 custom orders, filter by timber or status, and inspect unit cost breakdowns.
          </span>
        </div>
        <button
          id="search-bottom-go-to-general"
          type="button"
          onClick={onGoToGeneralData}
          className="px-4 py-2 bg-white hover:bg-stone-100 border border-stone-200 text-stone-900 font-semibold rounded-xl transition-colors cursor-pointer shrink-0 shadow-2xs flex items-center gap-1.5"
        >
          <span>Open General Data & Orders</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
