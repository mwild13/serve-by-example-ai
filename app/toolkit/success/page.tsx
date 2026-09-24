import { Suspense } from 'react';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SuccessContent } from './success-content';

export const metadata: Metadata = {
  title: 'Toolkit Ready — Serve By Example',
  robots: 'noindex',
};

export default function SuccessPage() {
  return (
    <div className="page-shell">
    <Navbar />
    <main
      style={{
        flex: 1,
        minHeight: '60vh',
        backgroundColor: 'var(--bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem 1.5rem',
      }}
    >
      <Suspense>
        <SuccessContent />
      </Suspense>
    </main>
    <Footer />
    </div>
  );
}
