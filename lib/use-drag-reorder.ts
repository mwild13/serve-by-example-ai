"use client";

// Drag to reorder, with a mouse or a finger, for every "put these in order"
// screen (the staff quiz, the mobile Recipe Order challenge, the applicant
// test). No library: pointer events work the same for mouse, touch and pen.
//
// A mouse can pick up the whole row. A finger picks up the grip handle only,
// so swiping over the list still scrolls the page. The row moves as soon as
// the pointer passes the middle of its neighbour. The arrow buttons stay
// beside every row for keyboards and screen readers.
//
// Usage: give each row onPointerDown={drag.onPointerDown} and
// data-drag-index={i}, and its grip the same plus data-drag-grip="".

import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { dropIndex, moveItem } from "@/lib/reorder";

/** How far the pointer moves before a press becomes a drag, so a tap stays a tap. */
const DRAG_START_PX = 4;

type Options<T> = {
  items: T[];
  onChange: (items: T[]) => void;
  disabled?: boolean;
};

export function useDragReorder<T>({ items, onChange, disabled = false }: Options<T>) {
  const listRef = useRef<HTMLOListElement | null>(null);
  const [dragging, setDragging] = useState<number | null>(null);
  const onChangeRef = useRef(onChange);
  const itemsRef = useRef(items);
  const disabledRef = useRef(disabled);
  const stopRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    onChangeRef.current = onChange;
    itemsRef.current = items;
    disabledRef.current = disabled;
  });

  // A drag in progress when the list goes away is ended, listeners and all.
  useEffect(() => () => stopRef.current?.(), []);

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      const index = Number(event.currentTarget.dataset.dragIndex);
      const fromGrip = event.currentTarget.dataset.dragGrip !== undefined;
      if (disabledRef.current || event.button !== 0 || !Number.isInteger(index)) return;
      if (event.pointerType !== "mouse" && !fromGrip) return;
      // A click on an arrow button is a click, not a drag.
      if (!fromGrip && (event.target as HTMLElement).closest("button")) return;
      event.stopPropagation();
      stopRef.current?.();

      // Each drag works from its own copy of the list, so it never reads a stale one.
      let order = itemsRef.current;
      let at = index;
      let started = false;
      const { pointerId, clientY: startY } = event;

      const middles = (): number[] =>
        Array.from(listRef.current?.children ?? []).map((row) => {
          const rect = row.getBoundingClientRect();
          return rect.top + rect.height / 2;
        });

      const move = (e: PointerEvent) => {
        if (e.pointerId !== pointerId) return;
        if (!started) {
          if (Math.abs(e.clientY - startY) < DRAG_START_PX) return;
          started = true;
          setDragging(at);
        }
        e.preventDefault();
        const to = dropIndex(middles(), e.clientY);
        if (to !== at) {
          order = moveItem(order, at, to);
          at = to;
          onChangeRef.current(order);
          setDragging(to);
        }
      };
      const stop = () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", stop);
        window.removeEventListener("pointercancel", stop);
        stopRef.current = null;
        setDragging(null);
      };
      window.addEventListener("pointermove", move, { passive: false });
      window.addEventListener("pointerup", stop);
      window.addEventListener("pointercancel", stop);
      stopRef.current = stop;
    },
    [],
  );

  return { listRef, dragging, onPointerDown };
}
