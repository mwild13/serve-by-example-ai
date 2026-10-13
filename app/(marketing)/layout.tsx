import type { ReactNode } from "react";
import "../styles/marketing.css";

// Route group for the public site. It adds no URL segment; it exists so the
// marketing stylesheet loads on these pages only. Shared rules stay in
// app/globals.css, which the root layout loads first.
export default function MarketingLayout({ children }: { children: ReactNode }) {
  return children;
}
