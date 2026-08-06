"use client";

import { useRef } from "react";
import { Search, Bell } from "lucide-react";
import type { QuickActionId, SearchResult } from "@/components/mission-control/manager-types";
import { QuickActionMenu } from "@/components/mission-control/QuickActionMenu";

interface ManagementTopbarProps {
  breadcrumbs: string[];
  venueName: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchResults: SearchResult[];
  onResultClick: (result: SearchResult) => void;
  onActionSelect: (actionId: QuickActionId) => void;
}

export function ManagementTopbar({
  breadcrumbs,
  venueName,
  searchQuery,
  onSearchChange,
  searchResults,
  onResultClick,
  onActionSelect,
}: ManagementTopbarProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleResultClick = (result: SearchResult) => {
    onResultClick(result);
    onSearchChange("");
  };

  return (
    <div className="ops-topbar">
      {/* Left slot: breadcrumb */}
      <div className="ops-topbar-slot ops-topbar-left">
        <div className="ops-topbar-breadcrumb">
          <span className="ops-topbar-venue">{venueName}</span>
          {breadcrumbs.length > 0 && <span className="ops-topbar-separator">/</span>}
          {breadcrumbs.length > 0 && (
            <span className="ops-topbar-section">{breadcrumbs[breadcrumbs.length - 1]}</span>
          )}
        </div>
      </div>

      {/* Center slot: search */}
      <div className="ops-topbar-slot ops-topbar-center">
        <div className="ops-topbar-search-wrapper">
          <Search className="ops-topbar-search-icon" size={16} />
          <input
            ref={searchInputRef}
            className="ops-topbar-search-input"
            type="search"
            placeholder="Search staff, scenarios, programs…"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Global search"
          />
          {searchResults.length > 0 && (
            <ul className="ops-search-results" role="listbox">
              {searchResults.map((result) => (
                <li
                  key={result.id}
                  className="ops-search-result-item"
                  role="option"
                  aria-selected={false}
                  onClick={() => handleResultClick(result)}
                >
                  <span className={`ops-search-cat-badge ops-cat-${result.category}`}>
                    {result.category}
                  </span>
                  <span className="ops-search-result-label">{result.label}</span>
                  {result.sublabel && (
                    <span className="ops-search-result-sub">{result.sublabel}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Right slot: Create New dropdown + notification bell */}
      <div className="ops-topbar-slot ops-topbar-right">
        <QuickActionMenu onActionSelect={onActionSelect} />

        <button
          className="ops-topbar-notification-btn"
          aria-label="Notifications"
          type="button"
        >
          <Bell size={18} />
        </button>
      </div>
    </div>
  );
}
