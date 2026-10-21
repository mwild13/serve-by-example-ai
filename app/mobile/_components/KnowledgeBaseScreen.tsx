"use client";

import { useMemo, useState } from "react";
import { Check, ChevronRight, Search } from "lucide-react";
import Screen from "./ui/Screen";
import Sheet from "./ui/Sheet";
import { Pill, Section } from "./ui/parts";
import { KB_CATEGORIES, KB_ENTRIES, type KBCategory, type KBEntry } from "@/lib/knowledge-base";

// The knowledge base (docs/STAFF_MOBILE_REDESIGN_PLAN.md, phase 7): every
// card as a row under its topic, with search and topic chips. Tapping a row
// opens the card in a bottom sheet: the explanation, key facts and tags.
// lib/knowledge-base.ts is static data, shared with the desktop knowledge
// base. Styles: the sm-lib and sm-kb rules in app/styles/staff.css.

const TOPICS = Object.keys(KB_CATEGORIES) as KBCategory[];

function subLabel(entry: KBEntry): string {
  return KB_CATEGORIES[entry.category].subCategories.find((sub) => sub.slug === entry.subCategory)?.label ?? entry.subCategory;
}

export default function KnowledgeBaseScreen({ fromHome }: { fromHome: boolean }) {
  const [topic, setTopic] = useState<KBCategory | "all">("all");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<KBEntry | null>(null);

  const q = query.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      KB_ENTRIES.filter(
        (e) =>
          (topic === "all" || e.category === topic) &&
          (!q || e.title.toLowerCase().includes(q) || e.content.toLowerCase().includes(q) || e.tags.some((t) => t.includes(q))),
      ),
    [topic, q],
  );

  return (
    <Screen title="Knowledge base" back={fromHome ? { href: "/mobile/home", label: "Home" } : { href: "/mobile/learn", label: "Learn" }} tab="learn">
      <div className="sm-lib-tools">
        <label className="sm-search">
          <Search size={18} strokeWidth={2.2} aria-hidden="true" />
          <span className="sr-only">Search the knowledge base</span>
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Gin, tannin, standard drinks" enterKeyHint="search" />
        </label>
        <div className="sm-chips" role="radiogroup" aria-label="Topic">
          {(["all", ...TOPICS] as const).map((key) => (
            <button key={key} type="button" role="radio" aria-checked={topic === key} className="sm-chip" onClick={() => setTopic(key)}>
              {key === "all" ? "All" : KB_CATEGORIES[key].label}
            </button>
          ))}
        </div>
        {topic !== "all" && !q && <p className="sm-lib-intro">{KB_CATEGORIES[topic].description}</p>}
      </div>

      {filtered.length === 0 && <p className="sm-lib-empty sm-lib-empty--loose">Nothing matches &ldquo;{query.trim()}&rdquo;.</p>}

      {TOPICS.map((key) => {
        const rows = filtered.filter((e) => e.category === key);
        if (rows.length === 0) return null;
        return (
          <Section key={key} title={KB_CATEGORIES[key].label} note={`${rows.length} ${rows.length === 1 ? "card" : "cards"}`}>
            <div className="sm-card sm-rows">
              {rows.map((entry) => (
                <button key={`${entry.subCategory}-${entry.title}`} type="button" className="sm-row sm-kb-row" onClick={() => setOpen(entry)}>
                  <span className="sm-row-text">
                    <span className="sm-kb-title">{entry.title}</span>
                    <span className="sm-row-sub">{subLabel(entry)}</span>
                  </span>
                  <ChevronRight className="sm-chevron" size={20} strokeWidth={2.6} aria-hidden="true" />
                </button>
              ))}
            </div>
          </Section>
        );
      })}

      {open && (
        <Sheet title={open.title} kicker={`${KB_CATEGORIES[open.category].label}. ${subLabel(open)}`} onClose={() => setOpen(null)}>
          <div className="sm-lib-spec">
            <p className="sm-kb-body">{open.content}</p>
            <section className="sm-card sm-card--pad">
              <h3 className="sm-lib-label">Key facts</h3>
              <ul className="sm-kb-facts">
                {open.keyFacts.map((fact, i) => (
                  <li key={i}>
                    <Check size={16} strokeWidth={3} aria-hidden="true" />
                    {fact}
                  </li>
                ))}
              </ul>
            </section>
            <div className="sm-kb-tags">
              {open.tags.map((tag) => (
                <Pill key={tag}>{tag.replace(/-/g, " ")}</Pill>
              ))}
            </div>
          </div>
        </Sheet>
      )}
    </Screen>
  );
}
