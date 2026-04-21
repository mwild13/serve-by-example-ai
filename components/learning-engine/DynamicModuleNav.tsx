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
  userId,
  userEmail,
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
  const [sortBy, setSortBy] = useState<"recommended" | "elo" | "title">(
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

  const getCategoryAccent = (category: string) => {
    switch (category) {
      case "technical": return { border: "#bfdbfe", bg: "#eff6ff", badge: "#1d4ed8", badgeBg: "#dbeafe", label: "#1e40af" };
      case "service":   return { border: "#bbf7d0", bg: "#f0fdf4", badge: "#15803d", badgeBg: "#dcfce7", label: "#166534" };
      case "compliance": return { border: "#fecaca", bg: "#fff1f2", badge: "#b91c1c", badgeBg: "#fee2e2", label: "#991b1b" };
      default:          return { border: "#e5e7eb", bg: "#f9fafb", badge: "#374151", badgeBg: "#f3f4f6", label: "#4b5563" };
    }
  };

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
      {/* Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.875rem", fontWeight: 800, color: "#111827", marginBottom: "0.375rem", letterSpacing: "-0.025em" }}>
          Training Modules
        </h2>
        <p style={{ color: "#6b7280", fontSize: "1rem" }}>
          {modules.length > 0
            ? `${modules.length} modules · personalised to your skill level`
            : "Loading your training modules..."}
        </p>
      </div>

      {/* Controls */}
      <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "1.25rem", marginBottom: "1.75rem", display: "flex", flexWrap: "wrap", gap: "1.5rem", alignItems: "flex-start" }}>
        <div>
          <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.625rem" }}>
            Category
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {(["all", "technical", "service", "compliance"] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "8px",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  background: selectedCategory === cat ? "#1d4ed8" : "#f3f4f6",
                  color: selectedCategory === cat ? "white" : "#374151",
                }}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.625rem" }}>
            Sort by
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {(["recommended", "elo", "title"] as const).map((sort) => (
              <button
                key={sort}
                onClick={() => setSortBy(sort)}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "8px",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  background: sortBy === sort ? "#1d4ed8" : "#f3f4f6",
                  color: sortBy === sort ? "white" : "#374151",
                }}
              >
                {sort.charAt(0).toUpperCase() + sort.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", padding: "4rem 0" }}>
          <div style={{ width: "48px", height: "48px", border: "3px solid #e5e7eb", borderTopColor: "#1d4ed8", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 1rem" }} />
          <p style={{ color: "#6b7280", fontSize: "1rem" }}>Loading modules...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* Modules Grid */}
      {!loading && filteredModules.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
            gap: "1.25rem",
          }}
        >
          {filteredModules.map((module) => {
            const accent = getCategoryAccent(module.category);
            const eloDisplay = getEloDisplay(module.current_elo);
            const isSelected = selectedModuleId === module.id;

            return (
              <div
                key={module.id}
                onClick={() => onModuleSelect(module.id)}
                style={{
                  background: isSelected ? "#eff6ff" : "white",
                  border: `2px solid ${isSelected ? "#1d4ed8" : accent.border}`,
                  borderRadius: "14px",
                  padding: "1.75rem",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  boxShadow: isSelected
                    ? "0 0 0 4px rgba(29,78,216,0.15), 0 4px 16px rgba(29,78,216,0.12)"
                    : "0 1px 4px rgba(0,0,0,0.06)",
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.borderColor = "#93c5fd";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.borderColor = accent.border;
                  }
                }}
              >
                {/* Top row: recommended badge + category badge */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
                  {module.recommended ? (
                    <span style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      padding: "0.35rem 0.875rem",
                      background: "#fef3c7",
                      color: "#92400e",
                      fontSize: "0.75rem",
                      fontWeight: 800,
                      borderRadius: "999px",
                      border: "1px solid #fcd34d",
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                    }}>
                      ★ Recommended
                    </span>
                  ) : <span />}

                  <span style={{
                    padding: "0.3rem 0.75rem",
                    background: accent.badgeBg,
                    color: accent.label,
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    borderRadius: "6px",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}>
                    {module.category}
                  </span>
                </div>

                {/* Title */}
                <h3 style={{
                  fontSize: "1.2rem",
                  fontWeight: 800,
                  color: "#111827",
                  marginBottom: "0.625rem",
                  lineHeight: 1.3,
                  letterSpacing: "-0.01em",
                }}>
                  {module.title}
                </h3>

                {/* Description */}
                <p style={{
                  fontSize: "0.9rem",
                  color: "#4b5563",
                  lineHeight: 1.6,
                  marginBottom: "1.25rem",
                  minHeight: "2.8rem",
                }}>
                  {module.description || `Train and master ${module.title.toLowerCase()} skills.`}
                </p>

                {/* Stats */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "0.75rem",
                  background: "#f9fafb",
                  borderRadius: "10px",
                  padding: "1rem",
                  marginBottom: "1.25rem",
                  border: "1px solid #f3f4f6",
                }}>
                  <div style={{ textAlign: "center" }}>
                    <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.3rem" }}>ELO</p>
                    <p style={{ fontSize: "1.1rem", fontWeight: 800, color: eloDisplay.color }}>{module.current_elo}</p>
                    <p style={{ fontSize: "0.65rem", color: eloDisplay.color, fontWeight: 600 }}>{eloDisplay.label}</p>
                  </div>
                  <div style={{ textAlign: "center", borderLeft: "1px solid #e5e7eb", borderRight: "1px solid #e5e7eb" }}>
                    <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.3rem" }}>Mastery</p>
                    <p style={{ fontSize: "1.1rem", fontWeight: 800, color: "#111827" }}>{module.mastery_pct}%</p>
                    <p style={{ fontSize: "0.65rem", color: "#6b7280", fontWeight: 600 }}>of scenarios</p>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.3rem" }}>Done</p>
                    <p style={{ fontSize: "1.1rem", fontWeight: 800, color: "#111827" }}>{module.completion_pct}%</p>
                    <p style={{ fontSize: "0.65rem", color: "#6b7280", fontWeight: 600 }}>completed</p>
                  </div>
                </div>

                {/* Recommendation reason */}
                {module.recommendation_reason && (
                  <p style={{ fontSize: "0.8rem", color: "#6b7280", fontStyle: "italic", marginBottom: "1rem", lineHeight: 1.5 }}>
                    {module.recommendation_reason}
                  </p>
                )}

                {/* Footer: difficulty + CTA */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#9ca3af" }}>Difficulty</span>
                    <div style={{ display: "flex", gap: "4px" }}>
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          style={{
                            width: "10px",
                            height: "10px",
                            borderRadius: "50%",
                            background: i < module.difficulty_level ? "#f97316" : "#e5e7eb",
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <span style={{
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    color: isSelected ? "#1d4ed8" : "#6b7280",
                    padding: "0.3rem 0.75rem",
                    background: isSelected ? "#dbeafe" : "#f3f4f6",
                    borderRadius: "6px",
                    transition: "all 0.15s ease",
                  }}>
                    {isSelected ? "Selected →" : "Start →"}
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
