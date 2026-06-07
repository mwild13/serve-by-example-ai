import type { ReactNode } from "react";

interface WorkspaceHeaderProps {
  title: string;
  description?: string;
  meta?: string;
  actions?: ReactNode;
}

export function WorkspaceHeader({ title, description, meta, actions }: WorkspaceHeaderProps) {
  return (
    <div className="ops-card-head">
      <div>
        <h3>{title}</h3>
        {description && <p className="ops-section-desc">{description}</p>}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {meta && <span>{meta}</span>}
        {actions}
      </div>
    </div>
  );
}
