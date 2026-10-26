// Moving one item in a list, for every "put these in order" screen: the
// arrow buttons and dragging (lib/use-drag-reorder.ts) both go through it.

/** A copy of `items` with the item at `from` moved to `to`. Out of range leaves it as it was. */
export function moveItem<T>(items: readonly T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) return [...items];
  const out = [...items];
  const [item] = out.splice(from, 1);
  out.splice(to, 0, item);
  return out;
}

/**
 * Where a dragged item belongs: the index whose row the pointer is over,
 * from each row's vertical middle. `middles` are in list order.
 */
export function dropIndex(middles: readonly number[], pointerY: number): number {
  let index = 0;
  for (let i = 0; i < middles.length; i++) {
    if (pointerY > middles[i]) index = i;
  }
  return pointerY < (middles[0] ?? 0) ? 0 : index;
}
