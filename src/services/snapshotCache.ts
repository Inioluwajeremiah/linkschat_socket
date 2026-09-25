import { store } from "../store";
import { clearStatuses, hydrateStatuses } from "../store/slices/statusSlice";
import { clearBlocked, hydrateBlocked } from "../store/slices/blockedUserSlice";
import { readJson, writeJson } from "./offlineStorage";
import type { StatusGroup } from "../types";

// Offline copies of the smaller data sets that live in the Redux store:
// statuses (the feed) and the blocked list. Same idea as chatCache: mirrored
// to disk as they change, loaded back at startup, and a fresh network result
// always wins over the saved copy.

const SAVE_DELAY_MS = 1500;

interface SavedStatuses {
  myStatus: StatusGroup | null;
  statuses: StatusGroup[];
}

// Statuses expire after 24h — never show a saved one that has.
const isLive = (s: { expiresAt?: string }) =>
  !s.expiresAt || new Date(s.expiresAt).getTime() > Date.now();

const liveGroup = (g: StatusGroup | null): StatusGroup | null => {
  if (!g) return null;
  const statuses = g.statuses.filter(isLive);
  return statuses.length ? { ...g, statuses } : null;
};

const currentUserId = () => store.getState().auth.user?._id ?? null;

// ─── Load ────────────────────────────────────────────────────────────────────
let hydration: { userId: string; promise: Promise<void> } | null = null;

export function hydrateSnapshots(): Promise<void> {
  const userId = currentUserId();
  if (!userId) return Promise.resolve();
  if (hydration?.userId === userId) return hydration.promise;

  const promise = (async () => {
    const [status, blocked] = await Promise.all([
      readJson<SavedStatuses>("status"),
      readJson<string[]>("blocked"),
    ]);
    if (currentUserId() !== userId) return; // signed out / switched meanwhile

    if (status) {
      const statuses = (status.statuses ?? [])
        .map(liveGroup)
        .filter((g): g is StatusGroup => !!g);
      const myStatus = liveGroup(status.myStatus ?? null);
      if (myStatus || statuses.length) {
        store.dispatch(hydrateStatuses({ myStatus, statuses }));
      }
    }
    if (Array.isArray(blocked) && blocked.length) {
      store.dispatch(hydrateBlocked(blocked));
    }
  })();

  hydration = { userId, promise };
  return promise;
}

// ─── Save ────────────────────────────────────────────────────────────────────
let stopPersistence: (() => void) | null = null;

// Call once the saved copies have been loaded for this account.
export function startSnapshotPersistence() {
  if (stopPersistence) return;

  let lastMy = store.getState().status.myStatus;
  let lastStatuses = store.getState().status.statuses;
  let lastBlocked = store.getState().blocked.blockedIds;
  let statusDirty = false;
  let blockedDirty = false;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const flush = () => {
    timer = undefined;
    const s = store.getState();
    if (statusDirty) {
      statusDirty = false;
      writeJson("status", {
        myStatus: s.status.myStatus,
        statuses: s.status.statuses,
      } satisfies SavedStatuses).catch(() => {});
    }
    if (blockedDirty) {
      blockedDirty = false;
      writeJson("blocked", s.blocked.blockedIds).catch(() => {});
    }
  };

  const unsubscribe = store.subscribe(() => {
    const s = store.getState();
    let changed = false;
    if (s.status.myStatus !== lastMy || s.status.statuses !== lastStatuses) {
      lastMy = s.status.myStatus;
      lastStatuses = s.status.statuses;
      statusDirty = changed = true;
    }
    if (s.blocked.blockedIds !== lastBlocked) {
      lastBlocked = s.blocked.blockedIds;
      blockedDirty = changed = true;
    }
    if (changed && !timer) timer = setTimeout(flush, SAVE_DELAY_MS);
  });

  stopPersistence = () => {
    unsubscribe();
    clearTimeout(timer);
  };
}

// Sign-out: stop saving and forget the previous account's in-memory data.
export function resetSnapshots() {
  stopPersistence?.();
  stopPersistence = null;
  hydration = null;
  store.dispatch(clearStatuses());
  store.dispatch(clearBlocked());
}
