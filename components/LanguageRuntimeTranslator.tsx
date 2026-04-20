"use client";

import { useEffect, useRef } from "react";

const LANGUAGE_STORAGE_KEY = "sbe-language";
const TRANSLATION_CACHE_KEY = "sbe-translation-cache-v1";
const DEFAULT_LANGUAGE = "en-US";
const BATCH_SIZE = 60;
const MAX_PARALLEL_REQUESTS = 3;

type CacheMap = Record<string, string>;

const skippedParentTags = new Set([
  "SCRIPT",
  "STYLE",
  "NOSCRIPT",
  "CODE",
  "PRE",
  "TEXTAREA",
  "OPTION",
  "SELECT",
]);

function normalizeWhitespace(input: string): string {
  return input.replace(/\s+/g, " ").trim();
}

function isTranslatableText(input: string): boolean {
  const normalized = normalizeWhitespace(input);
  if (normalized.length < 2 || normalized.length > 240) {
    return false;
  }

  if (!/[A-Za-z\u00C0-\u024F]/.test(normalized)) {
    return false;
  }

  if (/^https?:\/\//i.test(normalized)) {
    return false;
  }

  return true;
}

function loadCache(): CacheMap {
  try {
    const raw = window.localStorage.getItem(TRANSLATION_CACHE_KEY);
    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw) as CacheMap;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveCache(cache: CacheMap) {
  try {
    window.localStorage.setItem(TRANSLATION_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Ignore storage write errors.
  }
}

function getTargetLanguage() {
  const selected = document.documentElement.getAttribute("data-ui-language");
  if (selected && selected.trim()) {
    return selected;
  }

  const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return stored?.trim() || DEFAULT_LANGUAGE;
}

export default function LanguageRuntimeTranslator() {
  const originals = useRef(new WeakMap<Text, string>());
  const observer = useRef<MutationObserver | null>(null);
  const translating = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const collectNodes = () => {
      const nodes: Text[] = [];
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);

      while (walker.nextNode()) {
        const node = walker.currentNode as Text;
        const parent = node.parentElement;

        if (!parent || skippedParentTags.has(parent.tagName)) {
          continue;
        }

        if (parent.closest("[data-no-translate='true']")) {
          continue;
        }

        const text = node.nodeValue ?? "";
        if (!isTranslatableText(text)) {
          continue;
        }

        nodes.push(node);
      }

      return nodes;
    };

    const restoreEnglish = (nodes: Text[]) => {
      for (const node of nodes) {
        const original = originals.current.get(node);
        if (typeof original === "string" && node.nodeValue !== original) {
          node.nodeValue = original;
        }
      }
    };

    const applyCachedTranslations = (nodes: Text[], cache: CacheMap, targetLanguage: string) => {
      for (const node of nodes) {
        const original = originals.current.get(node) ?? node.nodeValue ?? "";
        const normalized = normalizeWhitespace(original);
        const translated = cache[`${targetLanguage}::${normalized}`];
        if (translated && node.nodeValue !== translated) {
          node.nodeValue = translated;
        }
      }
    };

    const translateNodes = async () => {
      if (translating.current || cancelled) {
        return;
      }

      translating.current = true;

      try {
        const targetLanguage = getTargetLanguage();
        const nodes = collectNodes();

        for (const node of nodes) {
          if (!originals.current.has(node)) {
            originals.current.set(node, node.nodeValue ?? "");
          }
        }

        if (targetLanguage.toLowerCase().startsWith("en")) {
          restoreEnglish(nodes);
          return;
        }

        const cache = loadCache();
        const uniqueOriginals = Array.from(
          new Set(
            nodes
              .map((node) => originals.current.get(node) ?? node.nodeValue ?? "")
              .map((value) => normalizeWhitespace(value))
              .filter(Boolean),
          ),
        );

        // Apply any cached translations immediately.
        applyCachedTranslations(nodes, cache, targetLanguage);

        const missing = uniqueOriginals.filter((text) => !cache[`${targetLanguage}::${text}`]);

        if (missing.length > 0) {
          const batches: string[][] = [];
          for (let i = 0; i < missing.length; i += BATCH_SIZE) {
            batches.push(missing.slice(i, i + BATCH_SIZE));
          }

          let batchIndex = 0;
          const workerCount = Math.min(MAX_PARALLEL_REQUESTS, batches.length);

          await Promise.all(
            Array.from({ length: workerCount }, async () => {
              while (batchIndex < batches.length) {
                const currentIndex = batchIndex;
                batchIndex += 1;
                const batch = batches[currentIndex];

                const res = await fetch("/api/translate", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ targetLanguage, texts: batch }),
                });

                if (!res.ok) {
                  continue;
                }

                const data = (await res.json()) as { translations?: string[] };
                const translated = Array.isArray(data.translations) ? data.translations : [];

                for (let idx = 0; idx < batch.length; idx += 1) {
                  const source = batch[idx];
                  const target = translated[idx];
                  if (typeof target === "string" && target.trim()) {
                    cache[`${targetLanguage}::${source}`] = target;
                  }
                }
              }
            }),
          );
        }

        saveCache(cache);
        applyCachedTranslations(nodes, cache, targetLanguage);
      } catch (error) {
        console.error("Runtime translation error:", error);
      } finally {
        translating.current = false;
      }
    };

    const run = () => {
      window.requestAnimationFrame(() => {
        void translateNodes();
      });
    };

    run();

    const htmlObserver = new MutationObserver((mutations) => {
      const changedLanguage = mutations.some(
        (mutation) =>
          mutation.type === "attributes" &&
          mutation.attributeName === "data-ui-language" &&
          mutation.target === document.documentElement,
      );

      if (changedLanguage) {
        run();
      }
    });

    htmlObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-ui-language"],
    });

    observer.current = new MutationObserver(() => {
      run();
    });

    observer.current.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      cancelled = true;
      htmlObserver.disconnect();
      observer.current?.disconnect();
      observer.current = null;
    };
  }, []);

  return null;
}
