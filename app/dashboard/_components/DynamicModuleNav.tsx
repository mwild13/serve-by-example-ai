"use client";

import { useEffect, useState } from "react";
import { Module, AvailableModulesResponse } from "@/lib/modules";
import SharedTrainingCard from "@/app/dashboard/_components/common/SharedTrainingCard";

interface DynamicModuleNavProps {
  userId: string;
  userEmail: string;
  userToken: string;
  onModuleSelect: (moduleId: number) => void;
  selectedModuleId?: number;
  initialCategory?: "technical" | "service" | "compliance"; // retained for call-site compatibility
}

function getDifficultyLabel(level: number): string {
  if (level <= 2) return "Beginner";
  if (level === 3) return "Intermediate";
  return "Advanced";
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

            const topBadge = module.recommended ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontSize: "0.7rem", fontWeight: 800, color: "var(--status-warn-text)", background: "var(--status-warn-bg)", border: `1px solid var(--status-warn)`, borderRadius: "999px", padding: "3px 10px", letterSpacing: "0.05em", textTransform: "uppercase", width: "fit-content" }}>
                  ★ Recommended
                </span>
                {module.recommendation_reason && (
                  <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontStyle: "italic", lineHeight: 1.4 }}>
                    {module.recommendation_reason}
                  </span>
                )}
              </div>
            ) : undefined;

            const footerAction = (
              <span className="btn-secondary" style={{ fontSize: "0.78rem", padding: "4px 12px" }}>
                {isSelected ? "Selected ✓" : module.mastery_pct >= 100 ? "Review →" : module.mastery_pct > 0 ? "Continue →" : "Start →"}
              </span>
            );

            return (
              <SharedTrainingCard
                key={module.id}
                topBadge={topBadge}
                title={module.title}
                description={module.description || `Train and master ${module.title.toLowerCase()} skills.`}
                progressValue={module.mastery_pct}
                progressLabel={`${module.mastery_pct}% mastery`}
                metaRight={getDifficultyLabel(module.difficulty_level)}
                footerAction={footerAction}
                onClick={() => onModuleSelect(module.id)}
                selected={isSelected}
              />
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
