"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

interface ActionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  isDirty?: boolean;
}

export function ActionDrawer({ isOpen, onClose, title, children, isDirty = false }: ActionDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const [focusTrapActive, setFocusTrapActive] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setFocusTrapActive(true);
    }
    return () => {
      document.body.style.overflow = "";
      setFocusTrapActive(false);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
      if (focusTrapActive && e.key === "Tab" && drawerRef.current) {
        const focusableElements = drawerRef.current.querySelectorAll(
          "button, [href], input, select, textarea, [tabindex]:not([tabindex=\"-1\"])"
        );
        const focusableArray = Array.from(focusableElements) as HTMLElement[];
        if (focusableArray.length === 0) return;

        const firstElement = focusableArray[0];
        const lastElement = focusableArray[focusableArray.length - 1];
        const activeElement = document.activeElement as HTMLElement;

        if (e.shiftKey) {
          if (activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      if (drawerRef.current) {
        const focusableElements = drawerRef.current.querySelectorAll(
          "button, [href], input, select, textarea, [tabindex]:not([tabindex=\"-1\"])"
        );
        const firstFocusable = focusableElements[0] as HTMLElement;
        if (firstFocusable) {
          setTimeout(() => firstFocusable.focus(), 0);
        }
      }
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, focusTrapActive]);

  function handleClose() {
    if (isDirty) {
      const confirmed = window.confirm(
        "You have unsaved changes. Are you sure you want to discard them?"
      );
      if (!confirmed) return;
    }
    onClose();
  }

  return (
    <>
      <div
        className={`ops-action-drawer-backdrop ${isOpen ? "ops-action-drawer-open" : ""}`}
        onClick={handleClose}
        aria-hidden="true"
      />
      <div
        className={`ops-action-drawer ${isOpen ? "ops-action-drawer-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        ref={drawerRef}
      >
        <div className="ops-action-drawer-header">
          <h2 style={{ fontSize: "1.1rem", fontFamily: "var(--font-heading)", color: "var(--green-deep)", margin: 0 }}>
            {title}
          </h2>
          <button
            type="button"
            className="ops-action-drawer-close"
            onClick={handleClose}
            aria-label="Close drawer"
          >
            <X size={18} />
          </button>
        </div>
        <div className="ops-action-drawer-body" key={isOpen ? title : "closed"}>
          {children}
        </div>
      </div>
    </>
  );
}
