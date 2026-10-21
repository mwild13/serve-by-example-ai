"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

// A bottom sheet, as in iPhone apps (docs/STAFF_MOBILE_REDESIGN_PLAN.md
// section 2.3). A native <dialog> opened with showModal(), so focus stays
// inside, Escape closes it and the page behind can't be tapped. Mount it to
// open it; every way of closing (the button, Escape, a tap above the sheet)
// ends in `onClose`, where the parent unmounts it. Styles: .sm-sheet in
// app/styles/staff.css.

export default function Sheet({
  title,
  kicker,
  media,
  onClose,
  children,
}: {
  title: string;
  /** Small capitals above the title. */
  kicker?: ReactNode;
  /** Above the title, such as a photo. */
  media?: ReactNode;
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog || dialog.open) return;
    dialog.showModal();
    // Start on the sheet itself, not its first button, so a screen reader
    // reads the title first and no focus ring shows on Close.
    dialog.focus();
  }, []);

  return (
    <dialog
      ref={ref}
      className="sm-sheet"
      tabIndex={-1}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => {
        // A tap on the dimmed page lands on the dialog itself, outside its box.
        const box = ref.current?.getBoundingClientRect();
        if (box && e.target === ref.current && (e.clientY < box.top || e.clientX < box.left || e.clientX > box.right)) {
          ref.current?.close();
        }
      }}
    >
      <div className="sm-sheet-grabber" aria-hidden="true" />
      {media}
      <div className="sm-sheet-head">
        <div className="sm-sheet-heading">
          {kicker && <p className="sm-kicker">{kicker}</p>}
          <h2 id={titleId} className="sm-sheet-title">
            {title}
          </h2>
        </div>
        <button type="button" className="sm-icon-btn sm-sheet-close" aria-label="Close" onClick={() => ref.current?.close()}>
          <X size={18} strokeWidth={2.6} aria-hidden="true" />
        </button>
      </div>
      {children}
    </dialog>
  );
}
