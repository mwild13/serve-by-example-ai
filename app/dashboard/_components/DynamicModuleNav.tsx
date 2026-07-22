"use client";

import { useEffect, useState } from "react";
import { Module, AvailableModulesResponse } from "@/lib/modules";

interface DynamicModuleNavProps {
  userId: string;
  userEmail: string;
  userToken: string;
  onModuleSelect: (moduleId: number) => void;
  selectedModuleId?: number;
  initialCategory?: "technical" | "service" | "compliance"; // retained for call-site compatibility
}

export default function DynamicModuleNav({
  userToken,
  onModuleSelect,
  selectedModuleId,
}: DynamicModuleNavProps) {
  const [filteredModules, setFilteredModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy] = useState<"recommended" | "title">("recommended");

  useEffect(() => {
    const fetchModules = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/training/modules?sort=${sortBy}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              ...(userToken ? { Authorization: `Bearer ${userToken}` } : {}),
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch modules");
        }

        const data: AvailableModulesResponse = await response.json();
        console.log("[DynamicModuleNav] Modules loaded:", {
          count: data.modules.length,
          platform_version: data.platform_version,
          user_role: data.user_role,
        });
        setFilteredModules(data.modules);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        console.error("Error fetching modules:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, [sortBy, userToken]);

  const getEloDisplay = (elo: number) => {
    if (elo < 1100) return { color: "var(--status-critical)", label: "Needs Work", tooltip: "ELO below 1100, needs more practice on this module" };
    if (elo < 1200) return { color: "var(--status-warning)", label: "Building", tooltip: "ELO 1100–1199, building skills on this module" };
    if (elo < 1300) return { color: "var(--status-info)", label: "Solid", tooltip: "ELO 1200–1299, solid performance on this module" };
    return { color: "var(--status-success)", label: "Strong", tooltip: "ELO 1300+, strong mastery on this module" };
  };

  if (error) {
    return (
      <div style={{ padding: "1.5rem", background: "var(--status-error-bg)", border: `1px solid var(--status-error)`, borderRadius: "12px" }}>
        <p style={{ color: "var(--status-error-text)", fontWeight: 700, marginBottom: "0.5rem" }}>Error loading modules</p>
        <p style={{ color: "var(--status-error)", fontSize: "0.9rem" }}>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ width: "100%" }}>
      {/* Command bar */}
      <div className="sbe-command-bar sbe-command-bar-active" style={{ color: "white", marginBottom: "1.75rem" }}>
        <div className="sbe-command-text">
          <span className="sbe-command-eyebrow">Training Library</span>
          <strong>Modules</strong>
          <span className="sbe-command-meta">
            {filteredModules.length > 0 ? `${filteredModules.length} modules across Technical, Service & Compliance` : "Browse and master all 40 training modules"}
          </span>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", padding: "4rem 0" }}>
          <div style={{ width: "40px", height: "40px", border: "3px solid var(--viz-neutral-light)", borderTopColor: "var(--green-mid)", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 1rem" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: "var(--color-text-muted)" }}>Loading modules…</p>
        </div>
      )}

      {/* Modules Grid */}
      {!loading && filteredModules.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1rem" }}>
          {filteredModules.map((module) => {
            const isSelected = selectedModuleId === module.id;
            const eloDisplay = getEloDisplay(module.current_elo);

            return (
              <button
                key={module.id}
                onClick={() => onModuleSelect(module.id)}
                aria-pressed={isSelected}
                aria-label={`${module.title}${isSelected ? ", selected" : ""}`}
                style={{
                  background: "var(--surface-raised)",
                  border: isSelected ? `1.5px solid var(--green-mid)` : "1px solid var(--line)",
                  borderRadius: "14px",
                  padding: "1.4rem 1.5rem",
                  cursor: "pointer",
                  transition: "all 0.18s ease",
                  boxShadow: isSelected ? `0 0 0 3px rgba(42, 104, 72, 0.15)` : "none",
                  textAlign: "left",
                  width: "100%",
                  fontFamily: "inherit",
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = "var(--green-mid)";
                    e.currentTarget.style.boxShadow = "0 4px 16px rgba(42, 104, 72, 0.1)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = "var(--line)";
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.transform = "translateY(0)";
                  }
                }}
              >
                {/* Top: recommended + status */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px", gap: "8px" }}>
                  {module.recommended ? (
                    <span style={{ fontSize: "0.7rem", fontWeight: 800, color: "var(--status-warn-text)", background: "var(--status-warn-bg)", border: `1px solid var(--status-warn)`, borderRadius: "999px", padding: "3px 10px", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                      ★ Recommended
                    </span>
                  ) : <span />}
                  <span title={eloDisplay.tooltip} style={{ fontSize: "0.7rem", fontWeight: 700, color: eloDisplay.color, background: "var(--surface)", borderRadius: "6px", padding: "3px 8px", cursor: "help" }}>
                    {eloDisplay.label}
                  </span>
                </div>

                {/* Title */}
                <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--green-deep)", marginBottom: "6px", lineHeight: 1.3, letterSpacing: "-0.01em" }}>
                  {module.title}
                </h3>

                {/* Description */}
                <p style={{ fontSize: "0.85rem", color: "var(--text-soft)", lineHeight: 1.55, marginBottom: "14px" }}>
                  {module.description || `Train and master ${module.title.toLowerCase()} skills.`}
                </p>

                {/* Mastery progress bar */}
                <div style={{ marginBottom: "14px" }}>
                  <div style={{ height: "5px", background: "var(--viz-neutral-light)", borderRadius: "3px", overflow: "hidden" }}>
                    <div style={{ width: `${module.mastery_pct}%`, height: "100%", background: `linear-gradient(90deg, var(--green-mid), var(--green-deep))`, borderRadius: "3px", transition: "width 0.4s ease" }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "5px" }}>
                    <span style={{ fontSize: "0.72rem", color: "var(--color-text-muted)" }}>Mastery</span>
                    <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--green-deep)" }}>{module.mastery_pct}%</span>
                  </div>
                </div>

                {/* Recommendation reason */}
                {module.recommendation_reason && (
                  <p style={{ fontSize: "0.78rem", color: "var(--color-text-muted)", fontStyle: "italic", marginBottom: "14px", lineHeight: 1.5 }}>
                    {module.recommendation_reason}
                  </p>
                )}

                {/* Footer */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div
                    title={`Difficulty: ${module.difficulty_level} / 5`}
                    aria-label={`Difficulty level ${module.difficulty_level} out of 5`}
                    style={{ display: "flex", gap: "3px" }}
                  >
                    {[...Array(5)].map((_, i) => (
                      <div key={i} style={{ width: "7px", height: "7px", borderRadius: "50%", background: i < module.difficulty_level ? "var(--green-deep)" : "var(--viz-neutral-light)" }} />
                    ))}
                  </div>
                  <span className="btn-secondary" style={{ fontSize: "0.78rem", padding: "4px 12px" }}>
                    {isSelected ? "Selected ✓" : module.mastery_pct >= 100 ? "Review →" : module.mastery_pct > 0 ? "Continue →" : "Start →"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredModules.length === 0 && (
        <div style={{ textAlign: "center", padding: "4rem 2rem", background: "var(--surface)", borderRadius: "14px", border: "2px dashed var(--line)" }}>
          <p style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "0.5rem" }}>No modules found</p>
          <p style={{ fontSize: "0.9rem", color: "var(--color-text-muted)" }}>Try a different category or contact support</p>
        </div>
      )}
    </div>
  );
}
