import { Suspense } from 'react';
import type { Metadata } from 'next';
import { SuccessContent } from './success-content';

export const metadata: Metadata = {
  title: 'Toolkit Ready — Serve By Example',
  robots: 'noindex',
};

export default function SuccessPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
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
  );
}
