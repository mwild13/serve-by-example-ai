"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { QuickActionId } from "@/components/mission-control/manager-types";

// Extracted from ManagementTopbar.tsx (Phase 5, Task 2) so the "+ Create New"
// menu is its own modular unit under components/mission-control/. Also wires
// in "Assign training" and "Create program" — both already existed as
// QuickActionId values and were already handled by openAction() in
// ManagerControlCenter.tsx, but were never rendered as menu items, so the
// only way to reach "assign training" was to open a staff member's coaching
// drawer individually (Phase 5 execution brief, Friction #2).

interface QuickActionMenuProps {
  onActionSelect: (actionId: QuickActionId) => void;
}

const QUICK_ACTION_ITEMS: { id: QuickActionId; label: string }[] = [
  { id: "add-staff", label: "Add staff" },
  { id: "assign-training", label: "Assign training" },
  { id: "create-program", label: "Create program" },
  { id: "add-inventory", label: "Add inventory" },
];

export function QuickActionMenu({ onActionSelect }: QuickActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  function handleSelect(actionId: QuickActionId) {
    onActionSelect(actionId);
    setIsOpen(false);
  }

  return (
    <div className="ops-create-dropdown-wrapper" ref={wrapperRef}>
      <button
        className="ops-create-dropdown-trigger"
        onClick={() => setIsOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        type="button"
      >
        <span>+ Create New</span>
        <ChevronDown
          size={16}
          style={{
            transition: "transform 0.25s var(--ease-out)",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>

      {isOpen && (
        <div className="ops-create-dropdown-menu" role="menu">
          {QUICK_ACTION_ITEMS.map((item) => (
            <button
              key={item.id}
              className="ops-create-dropdown-item"
              role="menuitem"
              type="button"
              onClick={() => handleSelect(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
