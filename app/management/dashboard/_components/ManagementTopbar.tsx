"use client";

import { useRef, useState } from "react";
import { ChevronDown, Search, Bell } from "lucide-react";
import type { QuickActionId, SearchResult } from "@/components/mission-control/manager-types";

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
  const [isCreateDropdownOpen, setIsCreateDropdownOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleResultClick = (result: SearchResult) => {
    onResultClick(result);
    onSearchChange("");
  };

  const handleCreateActionClick = (actionId: QuickActionId) => {
    onActionSelect(actionId);
    setIsCreateDropdownOpen(false);
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
        <div className="ops-create-dropdown-wrapper" ref={dropdownRef}>
          <button
            className="ops-create-dropdown-trigger"
            onClick={() => setIsCreateDropdownOpen(!isCreateDropdownOpen)}
            aria-haspopup="menu"
            aria-expanded={isCreateDropdownOpen}
          >
            <span>+ Create New</span>
            <ChevronDown
              size={16}
              style={{
                transition: "transform 0.25s var(--ease-out)",
                transform: isCreateDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
              }}
            />
          </button>

          {isCreateDropdownOpen && (
            <div className="ops-create-dropdown-menu">
              <button
                className="ops-create-dropdown-item"
                onClick={() => handleCreateActionClick("add-staff")}
              >
                Add staff
              </button>
              <button
                className="ops-create-dropdown-item"
                onClick={() => handleCreateActionClick("add-inventory")}
              >
                Add inventory
              </button>
            </div>
          )}
        </div>

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
