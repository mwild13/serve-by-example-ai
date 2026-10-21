"use client";

import { useCallback, useEffect, useState } from "react";

// Keeps the staff desktop's data in memory between pages, so going back to a
// page shows what it had straight away while a fresh copy loads behind it
// (stale while revalidate). The shell warms it on arrival (warmStaffCache).
//
// The cache belongs to one signed-in person: DashboardShell calls
// setStaffCacheOwner() with the account's email on every render, and a new
// owner empties it. With no owner set (any other surface, or the server) it
// stores nothing, so a shared component can call useStaffData() safely.

type Entry = { value: unknown; at: number };

const store = new Map<string, Entry>();
const inflight = new Map<string, Promise<unknown>>();
let owner: string | null = null;

/** A request this recent is reused instead of sent again. */
const FRESH_MS = 5_000;

export function setStaffCacheOwner(email: string) {
  if (typeof window === "undefined" || owner === email) return;
  owner = email;
  store.clear();
  inflight.clear();
}

function peek<T>(key: string): T | undefined {
  if (typeof window === "undefined" || owner === null) return undefined;
  return store.get(key)?.value as T | undefined;
}

/** Loads one key, sharing a request already on its way. */
export function fetchStaffData<T>(key: string, load: (token: string) => Promise<T>, getToken: () => Promise<string>): Promise<T> {
  const hit = store.get(key);
  if (owner !== null && hit && Date.now() - hit.at < FRESH_MS) return Promise.resolve(hit.value as T);
  const pending = inflight.get(key);
  if (pending) return pending as Promise<T>;
  const forOwner = owner;
  const request = getToken()
    .then(load)
    .then((value) => {
      if (forOwner !== null && owner === forOwner) store.set(key, { value, at: Date.now() });
      return value;
    })
    .finally(() => inflight.delete(key));
  if (forOwner !== null) inflight.set(key, request);
  return request;
}

/**
 * The cached value at once (undefined on a first visit), then the fresh one.
 * `load` must be a stable function, defined outside the component.
 */
export function useStaffData<T>(
  key: string,
  load: (token: string) => Promise<T>,
  getToken: () => Promise<string>,
): { data: T | undefined; failed: boolean; set: (value: T) => void } {
  const [state, setState] = useState<{ data: T | undefined; failed: boolean }>(() => ({ data: peek<T>(key), failed: false }));

  useEffect(() => {
    let cancelled = false;
    fetchStaffData(key, load, getToken).then(
      (data) => {
        if (!cancelled) setState({ data, failed: false });
      },
      () => {
        // Keep what was on screen; only an empty page shows the failure.
        if (!cancelled) setState((was) => (was.data === undefined ? { data: undefined, failed: true } : was));
      },
    );
    return () => {
      cancelled = true;
    };
  }, [key, load, getToken]);

  // For a page that changes the data itself (a saved setting, say).
  const set = useCallback(
    (value: T) => {
      if (owner !== null) store.set(key, { value, at: Date.now() });
      setState({ data: value, failed: false });
    },
    [key],
  );

  return { ...state, set };
}
