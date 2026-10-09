"use client";

import type { ManagementSnapshot, StaffRole } from "@/lib/management/types";
import { EmptyState } from "./manager-ui";
import { BarCell, ExportButton, PageHead, Panel, downloadCsv, percent } from "./console-ui";
import { needsAttention } from "@/lib/management/needs-attention";

// The Teams tab. Pure presentational: all team and role math is derived here
// from already-fetched venueStaff, no data-fetching or API routes.
//
// It also carries the per-role readiness table that used to be the separate
// Roles & Permissions tab (removed October 2026). That tab's second table, a
// fixed list of what managers, supervisors and staff can access, was dropped:
// it described rules a manager cannot change.

export interface TeamsPerformancePanelProps {
  venueStaff: ManagementSnapshot["staff"];
  selectedVenueName: string | undefined;
  onAssignStaffToTeam: () => void;
  onResolveSkillGap: (prompt: string) => void;
}

const TEAM_DEFS: { label: string; roles: StaffRole[] }[] = [
  { label: "Bar team", roles: ["Bartender"] },
  { label: "Floor team", roles: ["Floor", "New Staff"] },
  { label: "Leadership", roles: ["Supervisor", "Manager"] },
];

// The modules each role is expected to complete. Fixed by Serve By Example.
const REQUIRED_MODULES: Record<StaffRole, string[]> = {
  Bartender: ["Bartending", "Sales"],
  Floor: ["Sales"],
  Supervisor: ["Sales", "Management"],
  Manager: ["Sales", "Management"],
  "New Staff": ["Sales"],
};
const ROLE_ORDER: StaffRole[] = ["Bartender", "Floor", "Supervisor", "Manager", "New Staff"];
const READY_AT = 80;

function average(values: number[]): number {
  return values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;
}

export function TeamsPerformancePanel({
  venueStaff,
  selectedVenueName,
  onAssignStaffToTeam,
  onResolveSkillGap,
}: TeamsPerformancePanelProps) {
  const teams = TEAM_DEFS.map((def) => {
    const members = venueStaff.filter((s) => def.roles.includes(s.role));
    const skills: [string, number][] = [
      ["Service", average(members.map((s) => s.serviceScore))],
      ["Sales", average(members.map((s) => s.salesScore))],
      ["Product knowledge", average(members.map((s) => s.productScore))],
    ];
    return {
      ...def,
      members,
      avgProgress: average(members.map((s) => s.progress)),
      avgScore: average(members.map((s) => Math.round((s.serviceScore + s.salesScore + s.productScore) / 3))),
      // Same rule the Overview tab's "Needs attention" card uses.
      attention: members.filter(needsAttention),
      weakest: members.length ? [...skills].sort((a, b) => a[1] - b[1])[0][0] : null,
    };
  });

  const roles = ROLE_ORDER.map((role) => {
    const members = venueStaff.filter((s) => s.role === role);
    return {
      role,
      members,
      avgProgress: average(members.map((s) => s.progress)),
      ready: members.filter((s) => s.progress >= READY_AT).length,
    };
  });

  const followUp = teams.flatMap((team) => team.attention.map((member) => ({ member, team: team.label })));

  function handleExport() {
    downloadCsv(`team-report-${selectedVenueName ?? "venue"}.csv`, [
      ["Team", "Members", "Training completed", "Average score", "Needs follow-up"],
      ...teams.map((t) => [t.label, String(t.members.length), `${t.avgProgress}%`, `${t.avgScore}%`, String(t.attention.length)]),
    ]);
  }

  return (
    <div className="mc-page">
      <PageHead
        title="Teams"
        description="How each team is tracking, and what each role is expected to complete."
        actions={venueStaff.length > 0 ? <ExportButton label="Export team report" onClick={handleExport} /> : undefined}
      />

      {venueStaff.length === 0 ? (
        <Panel>
          <EmptyState copy="Add staff to see how each team is tracking." ctaLabel="+ Add staff" onCtaClick={onAssignStaffToTeam} />
        </Panel>
      ) : (
        <>
          <Panel title="Team performance" description="Teams are grouped by role." flush>
            <div className="mc-table-wrap">
              <table className="mc-table">
                <thead>
                  <tr>
                    <th>Team</th>
                    <th className="is-num">Members</th>
                    <th>Training completed</th>
                    <th className="is-num">Average score</th>
                    <th>Weakest area</th>
                    <th className="is-num">Needs follow-up</th>
                    <th><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map((team) => (
                    <tr key={team.label}>
                      <td className="is-main">{team.label}</td>
                      <td className="is-num">{team.members.length}</td>
                      <td>{team.members.length ? <BarCell value={team.avgProgress} /> : <span className="is-soft">No members</span>}</td>
                      <td className="is-num">{team.members.length ? percent(team.avgScore) : "–"}</td>
                      <td className="is-soft">{team.weakest ?? "–"}</td>
                      <td className="is-num">{team.members.length ? team.attention.length : "–"}</td>
                      <td className="is-num">
                        {team.weakest ? (
                          <button
                            type="button"
                            className="mc-link"
                            onClick={() => onResolveSkillGap(`What specific training should I assign to close the ${team.weakest} skill gap for my ${team.label}?`)}
                          >
                            Ask AI Coach
                          </button>
                        ) : (
                          <button type="button" className="mc-link" onClick={onAssignStaffToTeam}>Add staff</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          <Panel title="By role" description={`A person counts as ready once they have completed ${READY_AT}% of their training.`} flush>
            <div className="mc-table-wrap">
              <table className="mc-table">
                <thead>
                  <tr>
                    <th>Role</th>
                    <th className="is-num">Staff</th>
                    <th>Required modules</th>
                    <th>Average progress</th>
                    <th className="is-num">Ready</th>
                  </tr>
                </thead>
                <tbody>
                  {roles.map((row) => (
                    <tr key={row.role}>
                      <td className="is-main">{row.role}</td>
                      <td className="is-num">{row.members.length}</td>
                      <td className="is-soft">{REQUIRED_MODULES[row.role].join(", ")}</td>
                      <td>{row.members.length ? <BarCell value={row.avgProgress} /> : <span className="is-soft">No staff in this role</span>}</td>
                      <td className="is-num">{row.members.length ? `${row.ready} of ${row.members.length}` : "–"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mc-panel-note">Required modules are set by Serve By Example for each role and cannot be changed here.</p>
          </Panel>

          {followUp.length > 0 && (
            <Panel title="Needs follow-up" aside={<span className="mc-panel-count">{followUp.length} {followUp.length === 1 ? "person" : "people"}</span>} flush>
              <ul className="mc-rows">
                {followUp.map(({ member, team }) => (
                  <li key={member.id} className="mc-row">
                    <div className="mc-row-main">
                      <div className="mc-row-title">{member.name}</div>
                      <div className="mc-row-meta">{team} · {member.role} · last active {member.lastActive.toLowerCase()}</div>
                    </div>
                    <span className="mc-row-value">{Math.round(member.progress)}%</span>
                  </li>
                ))}
              </ul>
            </Panel>
          )}
        </>
      )}
    </div>
  );
}
