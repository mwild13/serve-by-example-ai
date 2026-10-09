import { Suspense } from "react";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SuccessContent } from "./success-content";

export const metadata: Metadata = {
  title: "Toolkit Ready | Serve By Example",
  robots: "noindex",
};

export default function SuccessPage() {
  return (
    <div className="page-shell">
      <Navbar />
      <main className="sbe-mkt-confirm-page">
        <div className="container">
          <Suspense>
            <SuccessContent />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
}
