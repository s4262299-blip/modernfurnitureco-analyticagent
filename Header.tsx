import React from "react";
import { Search, Database, FileText, ShieldCheck } from "lucide-react";

export type AppPage = "search" | "general";

interface HeaderProps {
  currentPage: AppPage;
  onPageChange: (page: AppPage) => void;
  onOpenReport: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  onPageChange,
  onOpenReport
}) => {
  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-30 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo */}
          <div
            id="brand-logo-button"
            onClick={() => onPageChange("search")}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <div className="w-10 h-10 rounded-lg bg-stone-900 text-stone-100 flex items-center justify-center font-serif text-xl font-bold tracking-tight group-hover:bg-stone-800 transition-colors">
              MF
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-semibold text-lg text-stone-900 tracking-tight">
                  ModernFurniture Co.
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-3 h-3 mr-1" />
                  Grounded Data
                </span>
              </div>
              <p className="text-[11px] text-stone-500 hidden md:block">
                Managerial Intelligence Platform
              </p>
            </div>
          </div>

          {/* Clean 2-Page Toggle */}
          <div className="flex items-center p-1 bg-stone-100 rounded-xl border border-stone-200">
            <button
              id="nav-search-page"
              type="button"
              onClick={() => onPageChange("search")}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                currentPage === "search"
                  ? "bg-stone-900 text-stone-100 shadow-xs"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-200/60"
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Search & Ask AI</span>
            </button>

            <button
              id="nav-general-page"
              type="button"
              onClick={() => onPageChange("general")}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                currentPage === "general"
                  ? "bg-stone-900 text-stone-100 shadow-xs"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-200/60"
              }`}
            >
              <Database className="w-4 h-4" />
              <span>General Data & Orders</span>
            </button>
          </div>

          {/* Report Button */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              id="header-open-report-btn"
              type="button"
              onClick={onOpenReport}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-lg border border-stone-200 transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-stone-600" />
              <span className="hidden sm:inline">Executive Report</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
