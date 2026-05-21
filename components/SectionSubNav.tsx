"use client";

import { useState, useEffect, useRef } from "react";

type NavItem = {
  id: string;
  label: string;
};

interface SectionSubNavProps {
  items: NavItem[];
}

export default function SectionSubNav({ items }: SectionSubNavProps) {
  const [activeId, setActiveId] = useState<string>(items[0]?.id ?? "");
  const [visible, setVisible] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );

    items.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [items]);

  useEffect(() => {
    const sentinel = document.querySelector(".section-subnav-sentinel");
    if (!sentinel) {
      setVisible(true);
      return;
    }
    const obs = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 }
    );
    obs.observe(sentinel);
    return () => obs.disconnect();
  }, []);

  function scrollTo(id: string) {
    const el = document.getElementById(id);
    if (el) {
      const offset = 72;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  }

  return (
    <nav
      ref={navRef}
      className={`section-subnav${visible ? " section-subnav-visible" : ""}`}
      aria-label="Page sections"
    >
      <div className="container section-subnav-inner">
        <ul className="section-subnav-list" role="list">
          {items.map((item) => (
            <li key={item.id}>
              <button
                className={`section-subnav-item${activeId === item.id ? " section-subnav-item-active" : ""}`}
                onClick={() => scrollTo(item.id)}
                aria-current={activeId === item.id ? "location" : undefined}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
