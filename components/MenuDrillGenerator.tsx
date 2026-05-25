"use client";

import { useState, useRef, useCallback, DragEvent } from "react";
import Link from "next/link";

type Drill = {
  scenario: string;
  focus: string;
};

type State = "idle" | "generating" | "results" | "error";

const PLACEHOLDER = `e.g.\nNegroni — Campari, sweet vermouth, gin, orange peel\nOld Fashioned — bourbon, sugar, Angostura bitters, orange\nAperol Spritz — Aperol, prosecco, soda\nHouse Pale Ale — hoppy, tropical notes, 4.8%`;

export default function MenuDrillGenerator() {
  const [menuText, setMenuText] = useState("");
  const [venueName, setVenueName] = useState("");
  const [drills, setDrills] = useState<Drill[]>([]);
  const [state, setState] = useState<State>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (file.type === "text/plain" || file.name.endsWith(".txt")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = (e.target?.result as string) ?? "";
        setMenuText(text.slice(0, 4000));
      };
      reader.readAsText(file);
    } else if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
      setErrorMsg("PDF text extraction isn't available yet — paste your menu text below instead.");
    } else {
      setErrorMsg("Please drop a .txt file or paste your menu text below.");
    }
  }, []);

  const onDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  async function handleGenerate() {
    if (menuText.trim().length < 20) return;
    setState("generating");
    setErrorMsg("");
    setDrills([]);

    try {
      const res = await fetch("/api/demo/generate-drills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ menuText: menuText.trim(), venueName: venueName.trim() }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setErrorMsg(data.error ?? "Something went wrong. Please try again.");
        setState("error");
        return;
      }
      setDrills(data.drills ?? []);
      setState("results");
    } catch {
      setErrorMsg("Connection error. Please check your internet and try again.");
      setState("error");
    }
  }

  function handleReset() {
    setState("idle");
    setDrills([]);
    setMenuText("");
    setVenueName("");
    setErrorMsg("");
  }

  return (
    <section className="section drill-gen-section">
      <div className="container">
        <div className="section-header center">
          <span className="eyebrow">Scenario Builder</span>
          <h2>Drop your menu. Get instant drill scenarios.</h2>
          <p className="drill-gen-sub">
            Paste your cocktail or drinks list and get 3 custom practice drills built around your
            actual menu — ready to use with your team in seconds.
          </p>
        </div>

        {state !== "results" && (
          <div className="drill-gen-card">
            <div
              className={`drill-drop-zone${isDragging ? " drill-drop-zone-active" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              aria-label="Drop a text file or click to browse"
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click(); }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.pdf"
                style={{ display: "none" }}
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
              />
              <span className="drill-drop-icon" aria-hidden="true">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              </span>
              <span className="drill-drop-label">
                {isDragging ? "Drop your file here" : "Drop a .txt file here, or click to browse"}
              </span>
              <span className="drill-drop-hint">Or paste your menu below</span>
            </div>

            <div className="drill-gen-fields">
              <input
                type="text"
                placeholder="Venue name (optional)"
                value={venueName}
                onChange={(e) => setVenueName(e.target.value)}
                className="drill-venue-input"
                maxLength={80}
              />
              <textarea
                placeholder={PLACEHOLDER}
                value={menuText}
                onChange={(e) => setMenuText(e.target.value)}
                className="drill-menu-textarea"
                rows={7}
                maxLength={4000}
              />
              <div className="drill-char-count">{menuText.length} / 4000</div>
            </div>

            {errorMsg && <p className="drill-error">{errorMsg}</p>}

            <button
              className="btn btn-primary drill-gen-btn"
              onClick={handleGenerate}
              disabled={state === "generating" || menuText.trim().length < 20}
            >
              {state === "generating" ? (
                <>
                  <span className="drill-spinner" aria-hidden="true" />
                  Generating your drills&hellip;
                </>
              ) : (
                "Generate My Drills"
              )}
            </button>
          </div>
        )}

        {state === "results" && drills.length > 0 && (
          <div className="drill-results">
            {venueName && (
              <p className="drill-results-venue">
                3 custom drills for <strong>{venueName}</strong>
              </p>
            )}
            <div className="drill-results-list">
              {drills.map((drill, i) => (
                <div key={i} className="drill-result-card">
                  <span className="drill-result-num">{i + 1}</span>
                  <div className="drill-result-body">
                    <span className="drill-result-focus">{drill.focus}</span>
                    <p className="drill-result-scenario">{drill.scenario}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="drill-results-actions">
              <Link href="/demo" className="btn btn-primary">
                Practice these scenarios
              </Link>
              <button className="btn btn-secondary" onClick={handleReset}>
                Generate more drills
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
