"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Camera, LogOut, Settings } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { useMobileSession } from "../../_lib/mobile-session-context";

// The profile photo on the Me screen's header (2026-10-14). Pressing it opens
// a small menu: Settings, Change photo, and Log out. It replaced the separate
// Settings button and the pencil badge that used to sit on the photo.

const ITEM_STYLE: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  width: "100%",
  minHeight: 44,
  padding: "0 14px",
  background: "none",
  border: "none",
  fontFamily: "var(--font-body)",
  fontSize: 14,
  fontWeight: 600,
  color: "var(--text-mobile)",
  textDecoration: "none",
  textAlign: "left",
  cursor: "pointer",
};

export default function ProfileMenu() {
  const session = useMobileSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close on a tap outside the menu, or on Escape (focus goes back to the photo).
  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  async function handleSignOut() {
    setSigningOut(true);
    await createSupabaseBrowserClient().auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div ref={wrapRef} style={{ position: "relative", flexShrink: 0 }}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        style={{
          display: "block",
          width: 48,
          height: 48,
          padding: 0,
          borderRadius: "var(--radius-pill)",
          border: `2px solid ${open ? "var(--gold-mobile)" : "var(--border-mobile)"}`,
          background: "var(--surface-mobile)",
          overflow: "hidden",
          cursor: "pointer",
        }}
      >
        <Image
          src={session.profilePhotoUrl ?? "/mobile/avatar-large.webp"}
          alt=""
          width={48}
          height={48}
          unoptimized={!!session.profilePhotoUrl}
          style={{ objectFit: "cover", width: "100%", height: "100%" }}
        />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Account"
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            zIndex: 60,
            width: 200,
            padding: "6px 0",
            borderRadius: "var(--radius-md)",
            background: "var(--surface-mobile)",
            border: "1px solid var(--border-mobile)",
            boxShadow: "0 12px 32px rgba(0,0,0,0.45)",
          }}
        >
          <Link href="/mobile/settings" role="menuitem" style={ITEM_STYLE} onClick={() => setOpen(false)}>
            <Settings size={18} strokeWidth={2} color="var(--text-mobile-muted)" aria-hidden="true" />
            Settings
          </Link>
          <Link href="/mobile/ai-photo" role="menuitem" style={ITEM_STYLE} onClick={() => setOpen(false)}>
            <Camera size={18} strokeWidth={2} color="var(--text-mobile-muted)" aria-hidden="true" />
            Change photo
          </Link>
          <div style={{ height: 1, margin: "6px 0", background: "var(--border-mobile)" }} />
          <button
            type="button"
            role="menuitem"
            onClick={handleSignOut}
            disabled={signingOut}
            style={{ ...ITEM_STYLE, color: "var(--red-mobile)", opacity: signingOut ? 0.6 : 1 }}
          >
            <LogOut size={18} strokeWidth={2} color="var(--red-mobile)" aria-hidden="true" />
            {signingOut ? "Logging out…" : "Log out"}
          </button>
        </div>
      )}
    </div>
  );
}
