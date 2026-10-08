import type { ReactNode } from "react";
import { PRODUCT_FONT_CLASS } from "@/app/fonts/product-fonts";

// Keeps the staff dashboard on Fraunces/Manrope (see app/fonts/product-fonts.ts).
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className={PRODUCT_FONT_CLASS} style={{ display: "contents" }}>
      {children}
    </div>
  );
}
