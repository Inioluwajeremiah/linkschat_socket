import { useAppSelector } from "./useRedux";

export function useIsBlocked(userId?: string | null): boolean {
  const blockedIds = useAppSelector((s) => s.blocked.blockedIds);
  if (!userId) return false;
  return blockedIds.includes(userId);
}

// For filtering lists (statuses, reels, chats) against the whole blocked
// set in one pass, without a hook call per item.
export function useBlockedIdSet(): Set<string> {
  const blockedIds = useAppSelector((s) => s.blocked.blockedIds);
  return new Set(blockedIds);
}
