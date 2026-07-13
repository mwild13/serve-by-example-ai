"use client";

export default function HelpModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="sbe-help-overlay" onClick={onClose}>
      <div className="sbe-help-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Keyboard shortcuts</h3>
        <ul className="sbe-shortcut-list">
          <li><kbd>Ctrl</kbd>+<kbd>Enter</kbd> <span>Submit / check response</span></li>
          <li><kbd>Esc</kbd> <span>Dismiss result / exit focus</span></li>
          <li><kbd>?</kbd> <span>Toggle this help panel</span></li>
        </ul>
        <button className="btn btn-primary" onClick={onClose}>Got it</button>
      </div>
    </div>
  );
}
