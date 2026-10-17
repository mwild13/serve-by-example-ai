"use client";

import { useCallback, useEffect, useRef } from "react";
import { X } from "lucide-react";

interface ActionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function ActionDrawer({ isOpen, onClose, title, children }: ActionDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

  // No discard prompt: the forms live in the parent and keep what was typed
  // until a save succeeds, so closing loses nothing.
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
      if (isOpen && e.key === "Tab" && drawerRef.current) {
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
        // Start in the first form field, falling back to the close button.
        const firstFocusable = (drawerRef.current.querySelector(
          ".ops-action-drawer-body input:not([readonly]), .ops-action-drawer-body select, .ops-action-drawer-body textarea"
        ) ?? drawerRef.current.querySelector("button")) as HTMLElement | null;
        if (firstFocusable) {
          setTimeout(() => firstFocusable.focus(), 0);
        }
      }
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleClose]);

  return (
    <>
      <div
        className={`ops-action-drawer-backdrop ${isOpen ? "ops-action-drawer-open" : ""}`}
        onClick={handleClose}
        aria-hidden="true"
      />
      <div
        className={`ops-action-drawer mc-drawer ${isOpen ? "ops-action-drawer-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        ref={drawerRef}
      >
        <header className="mc-drawer-head">
          <h2 className="mc-drawer-title">{title}</h2>
          <button type="button" className="mc-icon-btn" onClick={handleClose} aria-label="Close">
            <X size={18} aria-hidden="true" />
          </button>
        </header>
        <div className="ops-action-drawer-body mc-drawer-body" key={isOpen ? title : "closed"}>
          {children}
        </div>
      </div>
    </>
  );
}
