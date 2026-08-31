import type { LucideIcon } from "lucide-react";
import type { ManagerSection } from "@/lib/management/types";

export type QuickActionId = "add-staff" | "add-inventory" | "create-program";

type NavItem = {
  id: ManagerSection;
  label: string;
  icon: LucideIcon;
};

export type NavGroup = {
  label: string;
  collapsible?: boolean;
  items: NavItem[];
};

export type SearchResult = {
  id: string;
  category: "staff" | "scenario" | "program" | "inventory" | "report";
  label: string;
  sublabel?: string;
  section: ManagerSection;
};
