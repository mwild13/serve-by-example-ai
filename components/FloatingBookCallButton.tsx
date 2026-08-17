'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import BookCallModal from '@/components/BookCallModal';

// Calendar SVG icon — no emojis per design system rules
function CalendarIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

// Routes where the floating button must not appear — authenticated app shells
const APP_ROUTE_PREFIXES = ['/dashboard', '/management'];

export default function FloatingBookCallButton() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Support the #book-call hash from other pages (e.g. links pointing to /#book-call)
  // MUST be called before any conditional return — React Rules of Hooks
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.location.hash === '#book-call') {
      // Mount-only hash check — deliberately deferred so SSR hydrates with `false` first.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOpen(true);
    }
  }, []);

  // Hide on all authenticated app routes — button is for marketing pages only
  // Conditional return is AFTER all hooks
  if (APP_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return null;
  }

  function openModal() {
    setOpen(true);
    window.history.pushState(null, '', '#book-call');
  }

  function closeModal() {
    setOpen(false);
    if (window.location.hash === '#book-call') {
      window.history.pushState(null, '', window.location.pathname);
    }
  }

  return (
    <>
      <button
        onClick={openModal}
        aria-label="Book a free 15-min call"
        style={{
          position: 'fixed',
          bottom: 'var(--fab-bottom, 24px)', /* lifted above the mobile sticky hero CTA via media query in globals.css */
          right: '24px',
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: 'var(--green)',
          color: 'var(--surface-raised)',
          border: '2px solid var(--gold)',
          borderRadius: '9999px',
          padding: '14px 22px',
          fontFamily: 'var(--font-manrope)',
          fontSize: '0.875rem',
          fontWeight: 700,
          cursor: 'pointer',
          boxShadow: 'var(--shadow-xl)',
          transition: 'background-color 0.2s ease, transform 0.15s ease',
          letterSpacing: '0.01em',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--green-deep)';
          (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--green)';
          (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
        }}
      >
        <CalendarIcon />
        {/* Label hidden on smallest mobile — icon only */}
        <span className="floating-btn-label">Book a free 15-min call</span>
      </button>

      <BookCallModal open={open} onClose={closeModal} />
    </>
  );
}
