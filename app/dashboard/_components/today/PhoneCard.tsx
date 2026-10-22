"use client";

import { useEffect, useMemo, useState } from "react";
import qrcode from "qrcode-generator";

// "Train on your phone" on the staff desktop's Today
// (docs/zHistorical/STAFF_MOBILE_REDESIGN_PLAN.md section 4.3): a QR code to the mobile
// app, where the pre-shift drill and reminders live. Hide keeps it hidden on
// this computer. The code is always dark on white, as some phone cameras
// can't read a light-on-dark one.

const HIDDEN_KEY = "sbe-phone-card-hidden";

export default function PhoneCard() {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let hidden = false;
    try {
      hidden = localStorage.getItem(HIDDEN_KEY) === "1";
    } catch {
      // No storage: show it.
    }
    // Read in the browser, so the code points at this site, preview or live.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!hidden) setUrl(`${window.location.origin}/mobile/home`);
  }, []);

  const qr = useMemo(() => {
    if (!url) return null;
    const code = qrcode(0, "M");
    code.addData(url);
    code.make();
    const size = code.getModuleCount();
    let path = "";
    for (let row = 0; row < size; row += 1) {
      for (let col = 0; col < size; col += 1) {
        if (code.isDark(row, col)) path += `M${col + 4},${row + 4}h1v1h-1z`;
      }
    }
    return { path, box: size + 8 };
  }, [url]);

  if (!url || !qr) return null;

  function hide() {
    try {
      localStorage.setItem(HIDDEN_KEY, "1");
    } catch {
      // Hidden for this visit only.
    }
    setUrl(null);
  }

  return (
    <section className="sd-panel sd-col-12 sd-phone" aria-labelledby="sd-phone-title">
      <div className="sd-phone-text">
        <p className="sd-label">On your phone</p>
        <h2 id="sd-phone-title" className="sd-h2">Train on your phone</h2>
        <p className="sd-note">
          Point your phone&apos;s camera at the code to open Serve By Example there. The pre-shift drill and shift reminders are made
          for your phone, and it adds to your Home Screen in three taps.
        </p>
        <button type="button" className="sd-textlink" onClick={hide}>
          Hide
        </button>
      </div>
      <svg className="sd-phone-qr" viewBox={`0 0 ${qr.box} ${qr.box}`} role="img" aria-label="QR code to open Serve By Example on your phone" shapeRendering="crispEdges">
        <rect width={qr.box} height={qr.box} className="sd-phone-qr-bg" />
        <path d={qr.path} className="sd-phone-qr-dots" />
      </svg>
    </section>
  );
}
