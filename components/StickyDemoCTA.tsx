'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';

export default function StickyDemoCTA({ heroRef }: { heroRef: React.RefObject<HTMLElement | null> }) {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    const hero = heroRef.current;
    if (!bar || !hero) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          bar.classList.add('is-visible');
          bar.setAttribute('aria-hidden', 'false');
        } else {
          bar.classList.remove('is-visible');
          bar.setAttribute('aria-hidden', 'true');
        }
      },
      { threshold: 0 }
    );

    observer.observe(hero);
    return () => observer.disconnect();
  }, [heroRef]);

  return (
    <div ref={barRef} className="sticky-demo-bar" aria-hidden="true">
      <Link href="/demo" className="btn btn-primary sticky-demo-btn">
        Try the Demo
      </Link>
    </div>
  );
}
