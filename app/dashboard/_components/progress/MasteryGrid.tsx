"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { CATEGORY_LABELS, CATEGORY_ICONS, type ModuleSummary, type CategoryCert } from "./progress-types";

type MasteryGridProps = {
  categoryCerts: CategoryCert[];
  categoryGroups: Record<"technical" | "service" | "compliance", ModuleSummary[]>;
  modulesLength: number;
  expandedCategories: Set<string>;
  onToggleCategory: (key: string) => void;
  onSelectModule?: (moduleId: number) => void;
  onNavigate?: (nav: string) => void;
};

export default function MasteryGrid({
  categoryCerts,
  categoryGroups,
  modulesLength,
  expandedCategories,
  onToggleCategory,
  onSelectModule,
  onNavigate,
}: MasteryGridProps) {
  return (
    <div className="progress-tab-panel" style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* Certification & Focus Hub */}
      <div className="progress-cert-hub">
        <h2 className="progress-cert-hub-title">Certification &amp; Focus Hub</h2>
        <p className="progress-cert-hub-sub">
          Master all modules in a category to earn certification. Each card shows your next step.
        </p>
        <div className="progress-cert-hub-grid">
          {categoryCerts.map((cert) => (
            <div key={cert.category} className={`progress-cert-card${cert.certified ? " progress-cert-card--done" : ""}`}>
              {cert.certified ? (
                <>
                  <div>
                    <div className="progress-cert-done-badge">★</div>
                    <div className="progress-cert-card-title">{cert.label}</div>
                  </div>
                  <div className="progress-cert-bar-track">
                    <div className="progress-cert-bar-fill" style={{ width: "100%" }} />
                  </div>
                  <p className="progress-cert-progress-text">{cert.mastered}/{cert.total} mastered</p>
                  <div className="progress-cert-weakness">
                    <span className="progress-cert-done-text">Certified – all modules mastered.</span>
                    {onNavigate && (
                      <button className="progress-cert-btn" onClick={() => onNavigate("scenarios")}>
                        Practice in AI Scenarios &rarr;
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="progress-cert-card-title">{cert.label}</div>
                  <div className="progress-cert-bar-track">
                    <div
                      className="progress-cert-bar-fill"
                      style={{ width: cert.total > 0 ? `${Math.round((cert.mastered / cert.total) * 100)}%` : "0%" }}
                    />
                  </div>
                  <p className="progress-cert-progress-text">{cert.mastered}/{cert.total} mastered</p>
                  {cert.nextModule && (
                    <div className="progress-cert-weakness">
                      <span className="progress-cert-weakness-label">Strengthen your weakness</span>
                      <span className="progress-cert-module-name">{cert.nextModule.title}</span>
                      {onSelectModule && (
                        <button className="progress-cert-btn" onClick={() => onSelectModule(cert.nextModule!.id)}>
                          Strengthen Now &rarr;
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Full Module Mastery List */}
      <div className="progress-mastery-list-v2">
        <h2 className="progress-mastery-list-v2-title">Full Module Mastery List</h2>
        <p className="progress-mastery-list-v2-sub">
          Pass each module verify to mark as mastered. Every module links directly to training or AI Scenarios.
        </p>

        {modulesLength === 0 ? (
          <div
            style={{
              padding: "2rem 1.5rem",
              textAlign: "center",
              border: "1px dashed var(--line)",
              borderRadius: "var(--radius-md)",
              marginTop: "1rem",
            }}
          >
            <p style={{ color: "var(--text-muted)", fontWeight: 600, marginBottom: "0.75rem" }}>
              0 / 40 – Begin your first module
            </p>
            {onNavigate && (
              <button
                onClick={() => onNavigate("module")}
                style={{
                  padding: "0.6rem 1.5rem",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--green)",
                  color: "white",
                  border: "none",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  cursor: "pointer",
                }}
              >
                Browse Modules
              </button>
            )}
          </div>
        ) : (
          (["technical", "service", "compliance"] as const).map((cat) => {
            const Icon = CATEGORY_ICONS[cat];
            const isOpen = expandedCategories.has(cat);
            const masteredInCat = categoryGroups[cat].filter((m) => m.mastered).length;
            return (
              <div key={cat} style={{ marginBottom: 8 }}>
                <button className="progress-accordion-header" onClick={() => onToggleCategory(cat)} aria-expanded={isOpen}>
                  <span className="progress-accordion-icon"><Icon size={13} /></span>
                  <span className="progress-accordion-label">{CATEGORY_LABELS[cat]}</span>
                  <span className="progress-accordion-meta">{masteredInCat}/{categoryGroups[cat].length} mastered</span>
                  {isOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                </button>
                {isOpen && (
                  <div className="progress-accordion-body">
                    {categoryGroups[cat].map((module) => (
                      <div key={module.id} className="progress-mastery-row-v2">
                        <span className="progress-mastery-row-title">{module.title}</span>
                        <span className={`progress-mastery-row-chip${module.mastered ? " progress-mastery-row-chip--mastered" : ""}`}>
                          {module.mastered ? "Mastered" : module.attempted ? "In progress" : "Not started"}
                        </span>
                        {module.mastered ? (
                          <button className="progress-mastery-action" onClick={() => onNavigate?.("scenarios")}>
                            Practice in AI Scenarios
                          </button>
                        ) : module.attempted ? (
                          <button className="progress-mastery-action progress-mastery-action--primary" onClick={() => onSelectModule?.(module.id)}>
                            Continue
                          </button>
                        ) : (
                          <button className="progress-mastery-action progress-mastery-action--primary" onClick={() => onSelectModule?.(module.id)}>
                            Verify Now
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
