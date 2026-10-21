import Link from "next/link";
import { TabIcon, type TabIconName } from "./icons";

// The four tabs (docs/STAFF_MOBILE_REDESIGN_PLAN.md section 1). Fixed to the
// bottom with the safe area under it, see-through with a blur, as on
// iPhone. The spacer in front keeps the last of a screen's content clear of
// it, so no screen has to reserve the height itself. Replaced BottomNav.tsx
// and its drawn-in home bar (the phone draws its own).

export type MobileNavTab = TabIconName;

const TABS: { id: MobileNavTab; label: string; href: string }[] = [
  { id: "home", label: "Home", href: "/mobile/home" },
  { id: "learn", label: "Learn", href: "/mobile/learn" },
  { id: "practise", label: "Practise", href: "/mobile/practise" },
  { id: "me", label: "Me", href: "/mobile/progress" },
];

export default function TabBar({ active }: { active: MobileNavTab }) {
  return (
    <>
      <div className="sm-tabbar-spacer" aria-hidden="true" />
      <nav className="sm-tabbar" aria-label="Main">
        {TABS.map((tab) => {
          const isActive = tab.id === active;
          return (
            <Link key={tab.id} href={tab.href} className="sm-tab" aria-current={isActive ? "page" : undefined}>
              <TabIcon name={tab.id} active={isActive} />
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
