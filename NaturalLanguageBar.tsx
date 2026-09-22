import React, { useState } from "react";
import { Search, Sparkles, ArrowRight, Loader2, HelpCircle } from "lucide-react";

interface NaturalLanguageBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
  currentQuery: string;
}

const PRESET_QUERIES = [
  { label: "Biggest Bottleneck Last Quarter?", query: "What was our biggest bottleneck last quarter?" },
  { label: "Most Profitable Product?", query: "Which product type is most profitable?" },
  { label: "Cash Flow & Margins?", query: "What is our quarterly cash flow and revenue breakdown?" },
  { label: "Staff Resignations Impact?", query: "How did employee resignations affect production and delivery?" },
  { label: "Timber Stockouts?", query: "What were our timber inventory levels and stockout risks?" },
  { label: "Out of Scope Test", query: "What is the capital of France?", outOfScope: true }
];

export const NaturalLanguageBar: React.FC<NaturalLanguageBarProps> = ({
  onSearch,
  isLoading,
  currentQuery
}) => {
  const [inputVal, setInputVal] = useState(currentQuery);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim() && !isLoading) {
      onSearch(inputVal.trim());
    }
  };

  const handleChipClick = (queryText: string) => {
    setInputVal(queryText);
    onSearch(queryText);
  };

  return (
    <div className="w-full bg-stone-900 text-stone-100 rounded-2xl p-5 sm:p-6 shadow-md border border-stone-800">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-4 h-4 text-amber-400" />
        <h2 className="text-sm font-semibold tracking-wide uppercase text-stone-300">
          Executive Natural Language Query
        </h2>
      </div>
      <p className="text-xs text-stone-400 mb-4 max-w-3xl">
        Ask any analytical question in plain English. The platform references only ModernFurniture Co.&apos;s internal data (Orders, Financials, Materials, and HR). If a query goes beyond company records, it will state it is unsure.
      </p>

      <form onSubmit={handleSubmit} className="relative flex items-center mb-3">
        <div className="absolute left-4 text-stone-400">
          <Search className="w-5 h-5" />
        </div>
        <input
          id="manager-question-input"
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="e.g., 'What was our biggest bottleneck last quarter?' or 'Which product type is most profitable?'"
          className="w-full bg-stone-800/90 text-stone-100 placeholder-stone-400 text-sm sm:text-base rounded-xl pl-12 pr-32 py-3.5 border border-stone-700 focus:outline-hidden focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
        />
        <button
          id="submit-question-button"
          type="submit"
          disabled={isLoading || !inputVal.trim()}
          className="absolute right-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:bg-stone-700 disabled:text-stone-500 text-stone-950 font-semibold rounded-lg text-xs sm:text-sm flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <span>Ask</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Suggested chips */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="text-xs text-stone-400 flex items-center gap-1 font-medium mr-1">
          <HelpCircle className="w-3.5 h-3.5 text-stone-500" />
          Quick inquiries:
        </span>
        {PRESET_QUERIES.map((preset, idx) => (
          <button
            key={idx}
            id={`preset-query-${idx}`}
            type="button"
            onClick={() => handleChipClick(preset.query)}
            className={`text-xs px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
              preset.outOfScope
                ? "bg-stone-800/40 text-stone-400 border-stone-700 hover:border-red-400/50 hover:text-red-300"
                : "bg-stone-800 text-stone-200 border-stone-700 hover:border-amber-400/70 hover:bg-stone-700"
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
};
