"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, Copy, Download, Smartphone } from "lucide-react";
import Screen from "./ui/Screen";
import { Card } from "./ui/parts";
import StepPicture from "./install/StepPicture";
import { trackInstall, useInstall } from "../_lib/use-install";
import { INSTALL_STEPS, PICKABLE_PLATFORMS, PLATFORM_LABEL, isIosPlatform, type InstallPlatform } from "@/lib/install-platform";

// /mobile/install: how to put Serve By Example on this phone's Home Screen
// (docs/zHistorical/STAFF_MOBILE_REDESIGN_PLAN.md section 4.2). The phone and browser
// are detected (lib/install-platform.ts), with "Different phone?" to pick
// another. Reached from onboarding, the drill finish, the Home banner,
// Settings and the shift reminder (`?from=` says which, for the way back
// and the tracking).

const BACK: Record<string, { href: string; label: string }> = {
  settings: { href: "/mobile/settings", label: "Settings" },
  reminder: { href: "/mobile/settings", label: "Settings" },
};
const HOME = { href: "/mobile", label: "Home" };

export default function InstallScreen() {
  const router = useRouter();
  const from = useSearchParams().get("from") ?? "direct";
  const back = BACK[from] ?? HOME;
  const { platform: detected, installed, canPrompt, prompt } = useInstall();
  const [picked, setPicked] = useState<InstallPlatform | null>(null);
  const [choosing, setChoosing] = useState(false);
  const [host, setHost] = useState("servebyexample.co");
  const platform = picked ?? detected;

  const tracked = useRef(false);
  useEffect(() => {
    if (!detected || tracked.current) return;
    tracked.current = true;
    trackInstall("shown", `guide-${from}`, detected);
    setHost(window.location.host);
  }, [detected, from]);

  function done() {
    if (platform) trackInstall("done", `guide-${from}`, platform);
    router.push(back.href);
  }

  async function installNow() {
    if (!platform) return;
    trackInstall("tap", `guide-${from}`, platform);
    if (await prompt()) router.push(back.href);
  }

  return (
    <Screen title="Add to Home Screen" back={back}>
      <div className="sm-install">
        {!platform ? (
          <div className="sm-skel" style={{ height: 420 }} aria-label="Loading" />
        ) : installed && !picked ? (
          <Card>
            <div className="sm-install-done">
              <span className="sm-icon-circle" aria-hidden="true">
                <Check size={20} strokeWidth={2.6} />
              </span>
              <h2 className="sm-install-title">It&apos;s on your Home Screen</h2>
              <p className="sm-install-sub">You&apos;re in the app now. Open it from your Home Screen from here on.</p>
            </div>
          </Card>
        ) : platform === "desktop" ? (
          <Card>
            <div className="sm-install-done">
              <span className="sm-icon-circle" aria-hidden="true">
                <Smartphone size={20} strokeWidth={2.2} />
              </span>
              <h2 className="sm-install-title">Open this on your phone</h2>
              <p className="sm-install-sub">
                Go to {host}/mobile/install on your phone. The steps for your phone show there.
              </p>
            </div>
          </Card>
        ) : platform === "in-app-ios" || platform === "in-app-android" ? (
          <InAppSteps ios={platform === "in-app-ios"} host={host} />
        ) : (
          <>
            <div className="sm-install-head">
              <span className="sm-pill sm-pill--accent">
                <Smartphone size={14} strokeWidth={2.4} aria-hidden="true" />
                {PLATFORM_LABEL[platform]}
              </span>
              <h2 className="sm-install-title">Add SBE to your Home Screen</h2>
              <p className="sm-install-sub">
                Three taps.{" "}
                <button type="button" className="sm-install-switch" aria-expanded={choosing} onClick={() => setChoosing((c) => !c)}>
                  Different phone?
                </button>
              </p>
            </div>

            {choosing && (
              <div className="sm-card sm-rows sm-install-pick" role="radiogroup" aria-label="Your phone and browser">
                {PICKABLE_PLATFORMS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    role="radio"
                    aria-checked={p === platform}
                    className="sm-row"
                    onClick={() => {
                      setPicked(p);
                      setChoosing(false);
                    }}
                  >
                    <span className="sm-row-text">
                      <span className="sm-row-label">{PLATFORM_LABEL[p]}</span>
                    </span>
                    {p === platform && <Check size={18} strokeWidth={2.6} aria-hidden="true" className="sm-install-tick" />}
                  </button>
                ))}
              </div>
            )}

            {platform === "android-chrome" && canPrompt && !picked && (
              <div className="sm-install-now">
                <button type="button" className="sm-btn sm-btn--primary sm-btn--block" onClick={() => void installNow()}>
                  <Download size={18} strokeWidth={2.4} aria-hidden="true" />
                  Install the app
                </button>
                <p className="sm-install-sub">Or from the menu:</p>
              </div>
            )}

            <ol className="sm-install-steps">
              {INSTALL_STEPS[platform].map((step, i) => (
                <li key={step.title} className="sm-card sm-install-step">
                  <p className="sm-install-step-title">
                    <span className="sm-install-num" aria-hidden="true">
                      {i + 1}
                    </span>
                    {step.title}
                  </p>
                  <StepPicture pic={step.pic} host={host} />
                </li>
              ))}
            </ol>

            {isIosPlatform(platform) && (
              <p className="sm-install-note">You&apos;ll sign in once more inside the app. That&apos;s normal on iPhone.</p>
            )}

            <div className="sm-install-actions">
              <button type="button" className="sm-btn sm-btn--primary sm-btn--block" onClick={done}>
                I&apos;ve added it
              </button>
            </div>
          </>
        )}
      </div>
    </Screen>
  );
}

/** Instagram, Facebook and the like: open the page in the phone's browser first. */
function InAppSteps({ ios, host }: { ios: boolean; host: string }) {
  const [copied, setCopied] = useState(false);
  const browser = ios ? "Safari" : "Chrome";

  async function copy() {
    try {
      await navigator.clipboard.writeText(`https://${host}/mobile/install`);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <>
      <div className="sm-install-head">
        <h2 className="sm-install-title">Open this in {browser} first</h2>
        <p className="sm-install-sub">
          This app opened the link in its own browser, which can&apos;t add apps to your Home Screen.
        </p>
      </div>
      <ol className="sm-install-steps">
        <li className="sm-card sm-install-step">
          <p className="sm-install-step-title">
            <span className="sm-install-num" aria-hidden="true">1</span>
            Tap the menu, the three dots in a corner
          </p>
        </li>
        <li className="sm-card sm-install-step">
          <p className="sm-install-step-title">
            <span className="sm-install-num" aria-hidden="true">2</span>
            Tap Open in {browser}, or Open in browser
          </p>
        </li>
      </ol>
      <p className="sm-install-note">No menu? Copy the link and paste it into {browser}.</p>
      <div className="sm-install-actions">
        <button type="button" className="sm-btn sm-btn--secondary sm-btn--block" onClick={() => void copy()}>
          {copied ? <Check size={18} strokeWidth={2.6} aria-hidden="true" /> : <Copy size={18} strokeWidth={2.2} aria-hidden="true" />}
          {copied ? "Link copied" : "Copy the link"}
        </button>
      </div>
    </>
  );
}
