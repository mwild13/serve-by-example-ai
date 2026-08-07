"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Search, Sparkles, Bell } from "lucide-react";
import type { QuickActionId, SearchResult } from "@/components/mission-control/manager-types";
import { QuickActionMenu } from "@/components/mission-control/QuickActionMenu";

interface VenueOption {
  id: string;
  name: string;
}

interface ManagementTopbarProps {
  breadcrumbs: string[];
  venueName: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchResults: SearchResult[];
  onResultClick: (result: SearchResult) => void;
  onActionSelect: (actionId: QuickActionId) => void;
  // Venue switcher (Figma: top-header dropdown, replacing the sidebar's
  // venue block) — same selectedVenueId/setSelectedVenueId state that
  // already drives the rest of ManagerControlCenter, just relocated.
  venues: VenueOption[];
  selectedVenueId: string;
  onVenueChange: (venueId: string) => void;
  isMultiVenue: boolean;
  onGroupAnalytics: () => void;
  onAICoach: () => void;
  displayName?: string;
}

export function ManagementTopbar({
  breadcrumbs,
  venueName,
  searchQuery,
  onSearchChange,
  searchResults,
  onResultClick,
  onActionSelect,
  venues,
  selectedVenueId,
  onVenueChange,
  isMultiVenue,
  onGroupAnalytics,
  onAICoach,
  displayName,
}: ManagementTopbarProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [venueMenuOpen, setVenueMenuOpen] = useState(false);
  const venueMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!venueMenuOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (venueMenuRef.current && !venueMenuRef.current.contains(e.target as Node)) {
        setVenueMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [venueMenuOpen]);

  const handleResultClick = (result: SearchResult) => {
    onResultClick(result);
    onSearchChange("");
  };

  const initials = (displayName ?? venueName)
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="mc-topbar">
      {/* Left: venue switcher */}
      <div className="mc-topbar-left" ref={venueMenuRef}>
        <button
          type="button"
          className="mc-venue-btn"
          onClick={() => setVenueMenuOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={venueMenuOpen}
        >
          {venueName}
          <ChevronDown size={14} strokeWidth={2} />
        </button>

        {venueMenuOpen && (
          <div className="mc-venue-menu" role="menu">
            {venues.map((venue) => (
              <button
                key={venue.id}
                type="button"
                role="menuitem"
                className={`mc-venue-menu-item${venue.id === selectedVenueId ? " active" : ""}`}
                onClick={() => {
                  onVenueChange(venue.id);
                  setVenueMenuOpen(false);
                }}
              >
                {venue.name}
              </button>
            ))}
            {isMultiVenue && venues.length > 0 && (
              <>
                <div className="mc-venue-menu-divider" />
                <button
                  type="button"
                  className="mc-venue-menu-action"
                  onClick={() => {
                    onGroupAnalytics();
                    setVenueMenuOpen(false);
                  }}
                >
                  Group analytics →
                </button>
              </>
            )}
          </div>
        )}

        {breadcrumbs.length > 0 && (
          <span style={{ marginLeft: 10, fontSize: "0.8rem", color: "var(--mc-text-muted)" }}>
            / {breadcrumbs[breadcrumbs.length - 1]}
          </span>
        )}
      </div>

      {/* Right: search + AI coach + notifications + create + avatar */}
      <div className="mc-topbar-right">
        <div className="mc-search-wrap" style={{ position: "relative" }}>
          <Search size={14} strokeWidth={2} />
          <input
            ref={searchInputRef}
            className="mc-search-input"
            type="search"
            placeholder="Search staff, scenarios… (Cmd+K)"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Global search"
          />
          {searchResults.length > 0 && (
            <ul className="ops-search-results" role="listbox" style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 210 }}>
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

        <button type="button" className="mc-ai-btn" onClick={onAICoach}>
          <Sparkles size={15} strokeWidth={1.75} />
          Ask AI Coach
        </button>

        <QuickActionMenu onActionSelect={onActionSelect} />

        <button className="mc-topbar-icon-btn" aria-label="Notifications" type="button">
          <Bell size={16} />
        </button>

        <div className="mc-topbar-avatar" title={displayName ?? undefined}>{initials || "M"}</div>
      </div>
    </div>
  );
}
