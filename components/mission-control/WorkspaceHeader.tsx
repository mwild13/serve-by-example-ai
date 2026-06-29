import type { ReactNode } from "react";

interface WorkspaceHeaderProps {
  title: string;
  description?: string;
  meta?: string;
  actions?: ReactNode;
}

export function WorkspaceHeader({ title, description, meta, actions }: WorkspaceHeaderProps) {
  return (
    <div className="ops-card-head" style={{ display: "flex", alignItems: "center", gap: 20, justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
        <h3 style={{ margin: 0, whiteSpace: "nowrap" }}>{title}</h3>
        {description && <p className="ops-section-desc" style={{ margin: 0, whiteSpace: "nowrap" }}>{description}</p>}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        {meta && <span>{meta}</span>}
        {actions}
      </div>
    </div>
  );
}
