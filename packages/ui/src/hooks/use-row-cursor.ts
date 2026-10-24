import { useCallback, useLayoutEffect, useRef, useState } from "react";

type RowCursor = { id: string; query: string; pointed: boolean };

function indexOfCursor(rows: readonly { id: string }[], query: string, cursor: RowCursor | null) {
  if (cursor === null || cursor.query !== query) return -1;
  return rows.findIndex((row) => row.id === cursor.id);
}

/**
 * The highlighted row of a list whose rows can change under it, resolved during render
 * so `aria-activedescendant` never names a row that just left.
 *
 * - Holds the row's id, not its index: a same-length swap must not hand Enter to a row
 *   the user never chose. A row that leaves sends the highlight back to the first row.
 * - Stamped with `query` and dropped when it changes, so callers can't forget to clear it.
 * - `pointed` is false after a key step or a list change: a gliding highlight should jump then.
 */
export function useRowCursor(
  rows: readonly { id: string }[],
  query: string,
  { loop = false }: { loop?: boolean } = {},
) {
  const [cursor, setCursor] = useState<RowCursor | null>(null);
  // Written after commit: a discarded render must not leak a query into a handler.
  const latest = useRef({ rows, query });
  useLayoutEffect(() => {
    latest.current = { rows, query };
  });

  const cursorRow = indexOfCursor(rows, query, cursor);
  // Cleared, not ignored, so returning rows can't revive it.
  if (cursor !== null && cursorRow < 0) setCursor(null);

  const moveTo = useCallback(
    (id: string | null) =>
      setCursor(id === null ? null : { id, query: latest.current.query, pointed: true }),
    [],
  );

  const moveActive = useCallback(
    (direction: 1 | -1) => {
      const { rows: live, query: liveQuery } = latest.current;
      const last = live.length - 1;
      if (last < 0) return;
      // Inside the updater so two keys in one batch move two rows.
      setCursor((current) => {
        const at = Math.max(indexOfCursor(live, liveQuery, current), 0);
        const stepped = at + direction;
        const wrapped = loop && (stepped < 0 || stepped > last);
        const next = wrapped
          ? (stepped + live.length) % live.length
          : Math.min(Math.max(stepped, 0), last);
        return { id: live[next].id, query: liveQuery, pointed: false };
      });
    },
    [loop],
  );

  return {
    activeIndex: cursorRow < 0 ? 0 : cursorRow,
    pointed: cursor !== null && cursorRow >= 0 && cursor.pointed,
    moveTo,
    moveActive,
  };
}
