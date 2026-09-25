import { useCallback } from "react";
import { useAppSelector } from "./useRedux";

/**
 * Live online status. User objects carry an `isOnline` snapshot from when
 * they were fetched, which goes stale the moment someone connects or
 * disconnects; the socket keeps `socket.onlineUsers` current instead.
 * Pass the snapshot as `fallback` — it's used only until the first full
 * online list arrives from the server.
 */
export function useIsOnline() {
  const onlineUsers = useAppSelector((s) => s.socket.onlineUsers);
  const synced = useAppSelector((s) => s.socket.presenceSynced);

  return useCallback(
    (userId?: string, fallback?: boolean): boolean => {
      if (!userId) return false;
      return synced ? onlineUsers.includes(userId) : !!fallback;
    },
    [onlineUsers, synced]
  );
}

/**
 * Live last-seen time: the value received when the user last went offline,
 * else the fetched snapshot. `null` means the user hides it.
 */
export function useLastSeen(userId?: string, fallback?: string | null) {
  const live = useAppSelector((s) =>
    userId ? s.socket.lastSeen[userId] : undefined
  );
  return live !== undefined ? live : fallback ?? null;
}
