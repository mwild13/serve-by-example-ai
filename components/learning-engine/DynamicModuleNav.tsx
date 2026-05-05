"use client";

import { useEffect, useState } from "react";
import { Module, AvailableModulesResponse } from "@/lib/modules";

interface DynamicModuleNavProps {
  userId: string;
  userEmail: string;
  userToken: string;
  onModuleSelect: (moduleId: number) => void;
  selectedModuleId?: number;
}

export default function DynamicModuleNav({
  userToken,
  onModuleSelect,
  selectedModuleId,
}: DynamicModuleNavProps) {
  const [modules, setModules] = useState<Module[]>([]);
  const [filteredModules, setFilteredModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<
    "all" | "technical" | "service" | "compliance"
  >("all");
  const [sortBy] = useState<"recommended" | "title">(
    "recommended"
  );

  useEffect(() => {
    const fetchModules = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/training/modules?sort=${sortBy}${
            selectedCategory !== "all" ? `&category=${selectedCategory}` : ""
          }`,
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
        setModules(data.modules);

        if (selectedCategory === "all") {
          setFilteredModules(data.modules);
        } else {
          setFilteredModules(
            data.modules.filter((m) => m.category === selectedCategory)
          );
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        console.error("Error fetching modules:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, [selectedCategory, sortBy, userToken]);

  const getEloDisplay = (elo: number) => {
    if (elo < 1100) return { color: "#dc2626", label: "Needs Work" };
    if (elo < 1200) return { color: "#d97706", label: "Building" };
    if (elo < 1300) return { color: "#2563eb", label: "Solid" };
    return { color: "#16a34a", label: "Strong" };
  };

  if (error) {
    return (
      <div style={{ padding: "1.5rem", background: "#fff1f2", border: "1px solid #fecaca", borderRadius: "12px" }}>
        <p style={{ color: "#b91c1c", fontWeight: 700, marginBottom: "0.5rem" }}>Error loading modules</p>
        <p style={{ color: "#dc2626", fontSize: "0.9rem" }}>{error}</p>
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
            {loading ? "Loading your modules…" : `${modules.length} module${modules.length !== 1 ? "s" : ""} · personalised to your skill level`}
          </span>
        </div>
        {/* Category filter pills */}
        {!loading && (
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", justifyContent: "flex-end" }}>
            {(["all", "technical", "service", "compliance"] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: "5px 14px",
                  borderRadius: "999px",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  border: "1.5px solid rgba(255,255,255,0.4)",
                  cursor: "pointer",
                  background: selectedCategory === cat ? "rgba(255,255,255,0.25)" : "transparent",
                  color: "white",
                  letterSpacing: "0.03em",
                  transition: "all 0.15s",
                }}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", padding: "4rem 0" }}>
          <div style={{ width: "40px", height: "40px", border: "3px solid #e5e7eb", borderTopColor: "#2d6a4f", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 1rem" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: "#6b7280" }}>Loading modules…</p>
        </div>
      )}

      {/* Modules Grid */}
      {!loading && filteredModules.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1rem" }}>
          {filteredModules.map((module) => {
            const isSelected = selectedModuleId === module.id;
            const eloDisplay = getEloDisplay(module.current_elo);

            return (
              <div
                key={module.id}
                onClick={() => onModuleSelect(module.id)}
                style={{
                  background: "white",
                  border: `1.5px solid ${isSelected ? "#2d6a4f" : "#e5e7eb"}`,
                  borderRadius: "14px",
                  padding: "1.4rem 1.5rem",
                  cursor: "pointer",
                  transition: "all 0.18s ease",
                  boxShadow: isSelected ? "0 0 0 3px rgba(45,106,79,0.15)" : "0 1px 4px rgba(0,0,0,0.05)",
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = "#40916c";
                    e.currentTarget.style.boxShadow = "0 4px 16px rgba(45,106,79,0.1)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = "#e5e7eb";
                    e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.05)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }
                }}
              >
                {/* Top: recommended + status */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px", gap: "8px" }}>
                  {module.recommended ? (
                    <span style={{ fontSize: "0.7rem", fontWeight: 800, color: "#92400e", background: "#fef3c7", border: "1px solid #fcd34d", borderRadius: "999px", padding: "3px 10px", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                      ★ Recommended
                    </span>
                  ) : <span />}
                  <span style={{ fontSize: "0.7rem", fontWeight: 700, color: eloDisplay.color, background: "#f9fafb", borderRadius: "6px", padding: "3px 8px" }}>
                    {eloDisplay.label}
                  </span>
                </div>

                {/* Title */}
                <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#1b4332", marginBottom: "6px", lineHeight: 1.3, letterSpacing: "-0.01em" }}>
                  {module.title}
                </h3>

                {/* Description */}
                <p style={{ fontSize: "0.85rem", color: "#4b5563", lineHeight: 1.55, marginBottom: "14px" }}>
                  {module.description || `Train and master ${module.title.toLowerCase()} skills.`}
                </p>

                {/* Mastery progress bar */}
                <div style={{ marginBottom: "14px" }}>
                  <div style={{ height: "5px", background: "#f3f4f6", borderRadius: "3px", overflow: "hidden" }}>
                    <div style={{ width: `${module.mastery_pct}%`, height: "100%", background: "linear-gradient(90deg, #40916c, #2d6a4f)", borderRadius: "3px", transition: "width 0.4s ease" }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "5px" }}>
                    <span style={{ fontSize: "0.72rem", color: "#6b7280" }}>Mastery</span>
                    <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#1b4332" }}>{module.mastery_pct}%</span>
                  </div>
                </div>

                {/* Recommendation reason */}
                {module.recommendation_reason && (
                  <p style={{ fontSize: "0.78rem", color: "#6b7280", fontStyle: "italic", marginBottom: "14px", lineHeight: 1.5 }}>
                    {module.recommendation_reason}
                  </p>
                )}

                {/* Footer */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", gap: "3px" }}>
                    {[...Array(5)].map((_, i) => (
                      <div key={i} style={{ width: "7px", height: "7px", borderRadius: "50%", background: i < module.difficulty_level ? "#2d6a4f" : "#e5e7eb" }} />
                    ))}
                  </div>
                  <span style={{ fontSize: "0.78rem", fontWeight: 700, padding: "4px 12px", borderRadius: "6px", transition: "all 0.15s", background: isSelected ? "#d1fae5" : "#f3f4f6", color: isSelected ? "#1b4332" : "#6b7280" }}>
                    {isSelected ? "Selected ✓" : "Start →"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredModules.length === 0 && (
        <div style={{ textAlign: "center", padding: "4rem 2rem", background: "#f9fafb", borderRadius: "14px", border: "2px dashed #d1d5db" }}>
          <p style={{ fontSize: "1.125rem", fontWeight: 700, color: "#374151", marginBottom: "0.5rem" }}>No modules found</p>
          <p style={{ fontSize: "0.9rem", color: "#6b7280" }}>Try a different category or contact support</p>
        </div>
      )}
    </div>
  );
}
