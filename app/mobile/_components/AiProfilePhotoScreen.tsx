"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Zap, Loader2, Camera, X } from "lucide-react";
import { useMobileSession } from "../_lib/mobile-session-context";

// Phase C file 08, Half B — real generation via app/api/profile-photo/generate
// and app/api/profile-photo/save. Style environments moved to static base
// plate images (see the API route's Phase D comment) — this file only needs
// id/label/image per style/gender for the UI and to select a style+gender
// server-side.
// See v4-migration-plan/08-onboarding-diagnostic-and-profile.md.
//
// Live-QA fix (2026-08-19): reported "No place to take photo on ai photo
// page." True at the time — generation was text-to-image only (a style
// prompt, no reference to the user at all), so a camera control would have
// had nothing to feed. Closed 2026-08-19: capture/upload now feeds a real
// selfie into the generate call as an identity reference (see the route's
// header comment for the current model). The raw selfie itself is never
// persisted anywhere in Supabase — it's downscaled client-side, sent once
// to the generate route, and only the resulting URL (either a fal.media
// result or one of our own static base-plate URLs — see
// app/api/profile-photo/save/route.ts's isAllowedPhotoUrl check) is ever
// eligible to be saved as profiles.profile_photo_url.
//
// Diagnostic fix (2026-08-19): reported "AI photo generation not working."
// See app/api/profile-photo/generate/route.ts's own comment for the root
// cause and server-side fix — this file's only change is surfacing the
// route's optional dev-only `detail` field in the error banner below.
//
// Phase 7 (2026-08-21, v4-migration-plan/00-bug-batch-plan.md, F3) — draft
// cache. Generation only ever fires from handleGenerate's onClick (never an
// effect/re-render), so there was no re-trigger risk — but navigating away
// (back button) and returning lost the generated-but-unsaved preview,
// forcing a wasted, costed re-generation call. DRAFT_KEY below is keyed per
// user so a shared device can't leak one account's preview into another's
// session; it's cleared on both a successful Save and an explicit Skip, so
// nothing stale reappears for a different session later.
//
// Phase D (2026-08-25) — gender selector + locked-environment plates. Each
// style now has a male and a female base portrait
// (public/mobile/men|women/ai-style-<id>.png — see
// app/api/profile-photo/generate/route.ts's header comment for why), so the
// style list is duplicated per gender rather than a single shared thumbnail
// set. genderId also gates which 10 thumbnails render and is sent to the
// generate route alongside styleId.

type StyleOption = { id: string; label: string; image: string };
type GenderId = "male" | "female";

const STYLE_META: { id: string; label: string }[] = [
  { id: "classic-bar", label: "Classic Bar" },
  { id: "fine-dining", label: "Fine Dining" },
  { id: "cocktail-lounge", label: "Cocktail Lounge" },
  { id: "hotel-lobby", label: "Hotel Lobby" },
  { id: "rooftop-bar", label: "Rooftop Bar" },
  { id: "wine-cellar", label: "Wine Cellar" },
  { id: "coffee-house", label: "Coffee House" },
  { id: "beach-club", label: "Beach Club" },
  { id: "speakeasy", label: "Speakeasy" },
  { id: "corporate", label: "Corporate" },
];

const STYLES_BY_GENDER: Record<GenderId, StyleOption[]> = {
  male: STYLE_META.map((s) => ({ ...s, image: `/mobile/men/ai-style-${s.id}.png` })),
  female: STYLE_META.map((s) => ({ ...s, image: `/mobile/women/ai-style-${s.id}.png` })),
};

const PLACEHOLDER_AVATAR = "/mobile/ai-portrait-main.png";

// Downscales a captured/selected photo client-side before it ever leaves the
// device — a phone camera photo can be several MB; the model only needs a
// modest reference image, and keeping the request small matters more here
// than on a text-only prompt. Caps the longest edge at 768px, re-encodes as
// JPEG at 0.85 quality.
async function downscaleImage(file: File): Promise<string> {
  const dataUrl: string = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Couldn't read the photo."));
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new window.Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error("Couldn't read the photo."));
    el.src = dataUrl;
  });

  const maxEdge = 768;
  const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.85);
}

export default function AiProfilePhotoScreen() {
  const router = useRouter();
  const session = useMobileSession();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [genderId, setGenderId] = useState<GenderId>("male");
  const [selectedStyle, setSelectedStyle] = useState<StyleOption>(STYLES_BY_GENDER.male[0]);
  const [avatarUrl, setAvatarUrl] = useState<string>(PLACEHOLDER_AVATAR);
  const [selfieDataUrl, setSelfieDataUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  // Seeded from the layout's server-fetched profile row (see
  // mobile-session-context.tsx) so the button shows the correct count on
  // first paint; kept in local state after that so a fresh generate
  // response can update it without a page navigation.
  const [remaining, setRemaining] = useState<number>(session.profilePhotoGenerationsRemaining);

  const activeStyles = STYLES_BY_GENDER[genderId];

  // Requirement F3: cache an unsaved generated preview so back-navigation
  // doesn't lose it and force a wasted (costed) re-generation call.
  const draftKey = `sbe-ai-portrait-draft:${session.userEmail}`;

  // Keep the two useState lines above exactly as they are (PLACEHOLDER_AVATAR
  // / null) — do NOT read localStorage in the initializer. This route is
  // SSR'd like every other app/mobile screen, and reading localStorage
  // during a lazy-init function would make the client's first render
  // diverge from the server-rendered HTML — the same hydration-mismatch
  // class already found and fixed in MatchPairsScreen.tsx. Load the cached
  // draft in a mount effect instead, same SSR-safe pattern used everywhere
  // else in app/mobile for localStorage reads (e.g. BadgesGalleryScreen.tsx).
  useEffect(() => {
    try {
      const cached = JSON.parse(localStorage.getItem(draftKey) ?? "null");
      if (cached?.avatarUrl) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setAvatarUrl(cached.avatarUrl);
        if (cached?.selfieDataUrl) setSelfieDataUrl(cached.selfieDataUrl);
        if (cached?.genderId === "male" || cached?.genderId === "female") {
          setGenderId(cached.genderId);
          setSelectedStyle(
            STYLES_BY_GENDER[cached.genderId as GenderId].find((s) => s.id === cached?.styleId)
              ?? STYLES_BY_GENDER[cached.genderId as GenderId][0],
          );
        }
      } else if (session.profilePhotoUrl) {
        // No unsaved draft — fall back to the user's existing saved
        // portrait instead of leaving PLACEHOLDER_AVATAR, so re-opening this
        // screen after a save shows what's actually saved, not an empty
        // state (F5 fix, 2026-08-25).
        setAvatarUrl(session.profilePhotoUrl);
      }
    } catch {
      // corrupt/unreadable cache — ignore, stays on PLACEHOLDER_AVATAR
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasGenerated = avatarUrl !== PLACEHOLDER_AVATAR;

  const handlePhotoSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please choose an image file.");
      return;
    }
    try {
      setErrorMsg(null);
      setSelfieDataUrl(await downscaleImage(file));
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Couldn't read the photo.");
    }
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/profile-photo/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({
          styleId: selectedStyle.id,
          genderId,
          ...(selfieDataUrl ? { selfieImage: selfieDataUrl } : {}),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.url) {
        // The daily-cap 429 (see generate/route.ts) always includes
        // `remaining: 0` — sync it locally even though the seeded value
        // from session should already agree, in case the tab was left open
        // across the UTC day boundary or another tab used up the cap first.
        if (typeof data.remaining === "number") setRemaining(data.remaining);
        // route.ts only ever includes `detail` outside production — append
        // it when present so a local/dev tester sees the actual cause
        // (missing FAL_KEY, a Fal validation rejection, etc.) instead of
        // just the generic user-facing message.
        const message = data.error || "Failed to generate photo";
        throw new Error(data.detail ? `${message} (${data.detail})` : message);
      }

      setAvatarUrl(data.url);
      if (typeof data.remaining === "number") setRemaining(data.remaining);
      localStorage.setItem(draftKey, JSON.stringify({ avatarUrl: data.url, selfieDataUrl, genderId, styleId: selectedStyle.id }));
    } catch (err) {
      console.error("Failed to generate avatar:", err);
      setErrorMsg(err instanceof Error ? err.message : "Generation failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!hasGenerated) {
      router.push("/mobile/home");
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/profile-photo/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({ url: avatarUrl }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save portrait");
      }

      localStorage.removeItem(draftKey);
      // F5 fix (2026-08-25): profilePhotoUrl is seeded once by the shared
      // server layout (app/mobile/layout.tsx) into MobileSessionContext,
      // which has no client-side setter for it. A bare router.push between
      // sibling routes under that same layout segment does NOT re-run it,
      // so Home/Me kept showing the stale (often null) value until a hard
      // reload — router.refresh() forces the layout to re-fetch before we
      // navigate, matching the pattern SettingsScreen.tsx already uses
      // after its own profile mutations.
      router.refresh();
      router.push("/mobile/home");
    } catch (err) {
      console.error("Failed to save avatar:", err);
      setErrorMsg(err instanceof Error ? err.message : "Couldn't save your portrait. Please try again.");
      setIsSaving(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
        maxWidth: 390,
        margin: "0 auto",
        minHeight: "100dvh",
        background: "var(--bg-mobile-dark)",
        fontFamily: "var(--font-body)",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 14, width: "100%" }}>
        {/* header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px 0" }}>
          <button
            type="button"
            aria-label="Back"
            onClick={() => router.back()}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 10,
              borderRadius: "var(--radius-pill)",
              background: "var(--surface-mobile)",
              border: "1px solid var(--border-mobile)",
              cursor: "pointer",
            }}
          >
            <ArrowLeft size={16} strokeWidth={2} color="var(--text-mobile)" aria-hidden="true" />
          </button>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              borderRadius: "var(--radius-pill)",
              background: "var(--green-mobile-bg)",
            }}
          >
            <Zap size={12} strokeWidth={2} color="var(--text-mobile)" fill="var(--text-mobile)" aria-hidden="true" />
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-mobile)" }}>
              {/* Incidental fix alongside Phase 7 (same bug already fixed in
                  HomeScreen.tsx under Phase 6, item 12): this was reading
                  TrainingProgress.bestCorrectStreak — a server-tracked
                  quiz-answer-accuracy streak, not a daily login streak — and
                  mislabeling it "Streak" here too. session.streakCount is
                  the real client-side daily-login streak (lib/streak.ts). */}
              {session.streakCount !== null ? `${session.streakCount} Streak` : "—"}
            </span>
          </div>
        </div>

        {/* prompt-header */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "4px 24px 0" }}>
          <p style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "var(--text-mobile)" }}>Your AI Portrait</p>
          <p style={{ margin: 0, fontSize: 14, color: "var(--text-mobile-muted)" }}>
            {selfieDataUrl
              ? "Pick a style — we'll generate a portrait using your photo"
              : "Take a photo or pick a style, we'll generate your portrait"}
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="user"
          onChange={handlePhotoSelected}
          style={{ display: "none" }}
        />

        {/* preview-container */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "4px 0" }}>
          {/* gender-toggle — positioned directly above the preview photo per
              product request. Swaps both the 10-thumbnail style scroller
              below and which base plate the next generation uses. */}
          <div
            role="group"
            aria-label="Portrait gender"
            style={{
              display: "flex",
              padding: 3,
              marginBottom: 12,
              borderRadius: "var(--radius-pill)",
              background: "var(--surface-mobile)",
              border: "1px solid var(--border-mobile)",
            }}
          >
            {(["male", "female"] as const).map((g) => {
              const isActive = genderId === g;
              return (
                <button
                  key={g}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => {
                    if (g === genderId) return;
                    setGenderId(g);
                    const match = STYLES_BY_GENDER[g].find((s) => s.id === selectedStyle.id);
                    setSelectedStyle(match ?? STYLES_BY_GENDER[g][0]);
                  }}
                  style={{
                    padding: "6px 20px",
                    borderRadius: "var(--radius-pill)",
                    border: "none",
                    background: isActive ? "var(--gold-mobile)" : "none",
                    cursor: "pointer",
                  }}
                >
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: isActive ? "var(--bg-mobile-dark)" : "var(--text-mobile-muted)",
                    }}
                  >
                    {g === "male" ? "Male" : "Female"}
                  </span>
                </button>
              );
            })}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 176,
              height: 176,
              padding: 4,
              borderRadius: "var(--radius-pill)",
              border: "2px solid var(--gold-mobile)",
              boxShadow: "0px 8px 24px 0px rgba(242, 175, 52, 0.2)",
              position: "relative",
            }}
          >
            <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: "var(--radius-pill)", overflow: "hidden" }}>
              <Image src={avatarUrl} alt="AI Portrait Preview" fill style={{ objectFit: "cover" }} unoptimized={avatarUrl.startsWith("http")} />
              {isLoading && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(0, 0, 0, 0.65)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  <Loader2 size={28} className="mobile-spin" color="var(--gold-mobile)" />
                  <span style={{ fontSize: 12, color: "var(--text-mobile)", fontWeight: 600 }}>Generating...</span>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              aria-label={selfieDataUrl ? "Retake photo" : "Take or upload a photo"}
              style={{
                position: "absolute",
                bottom: 2,
                right: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 36,
                height: 36,
                borderRadius: "var(--radius-pill)",
                background: "var(--gold-mobile)",
                border: "2px solid var(--bg-mobile-dark)",
                cursor: "pointer",
              }}
            >
              <Camera size={16} strokeWidth={2} color="var(--bg-mobile-dark)" aria-hidden="true" />
            </button>
          </div>

          {selfieDataUrl && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
              <div style={{ position: "relative", width: 28, height: 28, borderRadius: "var(--radius-pill)", overflow: "hidden", border: "1px solid var(--border-mobile)" }}>
                <Image src={selfieDataUrl} alt="Your photo" fill style={{ objectFit: "cover" }} unoptimized />
              </div>
              <span style={{ fontSize: 12, color: "var(--text-mobile-muted)" }}>Your photo will guide the AI portrait</span>
              <button
                type="button"
                onClick={() => setSelfieDataUrl(null)}
                aria-label="Remove photo"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 22,
                  height: 22,
                  borderRadius: "var(--radius-pill)",
                  background: "var(--surface-mobile)",
                  border: "1px solid var(--border-mobile)",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                <X size={12} strokeWidth={2} color="var(--text-mobile-muted)" aria-hidden="true" />
              </button>
            </div>
          )}

          {errorMsg && (
            <p style={{ margin: "8px 24px 0", fontSize: 12, color: "var(--red-mobile)", textAlign: "center" }}>
              {errorMsg}
            </p>
          )}
        </div>

        {/* category-label */}
        <div style={{ padding: "0 24px" }}>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "var(--gold-mobile)", textTransform: "uppercase" }}>
            Hospitality Styles
          </p>
        </div>

        {/* styles-scroller */}
        <div style={{ display: "flex", gap: 12, padding: "0 24px", overflowX: "auto" }}>
          {activeStyles.map((style) => {
            const isSelected = style.label === selectedStyle.label;
            return (
              <button
                key={style.label}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setSelectedStyle(style)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                  width: 76,
                  flexShrink: 0,
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 64,
                    height: 64,
                    padding: 3,
                    borderRadius: "var(--radius-pill)",
                    border: isSelected ? "2px solid var(--gold-mobile)" : "1px solid var(--border-mobile)",
                  }}
                >
                  <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: "var(--radius-pill)", overflow: "hidden" }}>
                    <Image src={style.image} alt="" fill style={{ objectFit: "cover" }} />
                  </div>
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: 11,
                    fontWeight: isSelected ? 600 : 400,
                    color: isSelected ? "var(--gold-mobile)" : "var(--text-mobile-muted)",
                    textAlign: "center",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    width: "100%",
                  }}
                >
                  {style.label}
                </p>
              </button>
            );
          })}
        </div>

      </div>

      {/* footer-dock */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          padding: "14px 24px",
          background: "var(--surface-mobile)",
          borderTop: "1px solid var(--border-mobile)",
          borderTopLeftRadius: "var(--radius-xl)",
          borderTopRightRadius: "var(--radius-xl)",
        }}
      >
        <div style={{ display: "flex", gap: 12 }}>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isLoading || remaining <= 0}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "14px 0",
              borderRadius: "var(--radius-pill)",
              background: "none",
              border: "1px solid var(--border-mobile)",
              cursor: isLoading || remaining <= 0 ? "not-allowed" : "pointer",
              opacity: isLoading || remaining <= 0 ? 0.6 : 1,
            }}
          >
            <span style={{ fontSize: 15, fontWeight: 600, color: "var(--text-mobile)" }}>
              {isLoading
                ? "Generating..."
                : remaining <= 0
                  ? "No portraits left today"
                  : `Generate Portrait (${remaining})`}
            </span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "14px 0",
              borderRadius: "var(--radius-pill)",
              background: "var(--gold-mobile)",
              border: "none",
              cursor: isSaving ? "not-allowed" : "pointer",
              opacity: isSaving ? 0.6 : 1,
            }}
          >
            <span style={{ fontSize: 15, fontWeight: 700, color: "var(--bg-mobile-dark)" }}>
              {isSaving ? "Saving..." : "Save Portrait"}
            </span>
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <Link
            href="/mobile/home"
            onClick={() => localStorage.removeItem(draftKey)}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              fontFamily: "var(--font-body)",
              fontSize: 13,
              fontWeight: 600,
              color: "var(--text-mobile-muted)",
              textDecoration: "underline",
            }}
          >
            Skip for now
          </Link>
          <div style={{ width: 120, height: 5, borderRadius: 10, background: "var(--text-mobile-faint)" }} />
        </div>
      </div>
    </div>
  );
}