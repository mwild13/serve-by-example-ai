import { Zap, GlassWater, Shield } from "lucide-react";

export type ModuleSummary = {
  id: number;
  title: string;
  category: "technical" | "service" | "compliance";
  mastered: boolean;
  attempted: boolean;
};

export type TrainingData = {
  modules: ModuleSummary[];
  reviewDue: number;
  totalSessions: number;
  badgesEarned: number;
  totalBadgeCount: number;
  bestModuleMastery: number;
  scores: { bartending: number; sales: number; management: number };
  skillLevel: number;
  scenarioStats: {
    sessions: { bartending: number; sales: number; management: number };
    scores: { bartending: number; sales: number; management: number };
  };
  arenaProgress: Record<number, { attempts: number; bestScore: number; passed: boolean }>;
  challengesCompleted: number[];
};

export const EMPTY: TrainingData = {
  modules: [],
  reviewDue: 0,
  totalSessions: 0,
  badgesEarned: 0,
  totalBadgeCount: 14,
  bestModuleMastery: 0,
  scores: { bartending: 0, sales: 0, management: 0 },
  skillLevel: 1,
  scenarioStats: {
    sessions: { bartending: 0, sales: 0, management: 0 },
    scores: { bartending: 0, sales: 0, management: 0 },
  },
  arenaProgress: {},
  challengesCompleted: [],
};

export type CategoryCert = {
  category: "technical" | "service" | "compliance";
  label: string;
  mastered: number;
  total: number;
  certified: boolean;
  nextModule: ModuleSummary | null;
};

export const CATEGORY_LABELS: Record<string, string> = {
  technical: "Technical",
  service: "Service",
  compliance: "Compliance",
};

export const CATEGORY_CERT_LABELS: Record<string, string> = {
  technical: "Technical Specialist",
  service: "Service Expert",
  compliance: "Compliance Ready",
};

export const CATEGORY_ICONS: Record<string, React.ElementType> = {
  technical: Zap,
  service: GlassWater,
  compliance: Shield,
};
