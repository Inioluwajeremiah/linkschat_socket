import * as FileSystem from "expo-file-system/legacy";
import { store } from "../store";

// Offline data (chat list, message history, the send queue) lives as JSON
// files in the app's DOCUMENT directory — unlike the cache directory the OS
// never purges it to reclaim space, and unlike AsyncStorage (~6 MB total on
// Android) it has no practical size cap. One folder per account.
const ROOT = `${FileSystem.documentDirectory}offline/`;

// Files queued for sending are copied here so they survive the picker's temp
// file being cleaned up and app restarts.
export const OUTBOX_MEDIA_DIR = `${FileSystem.documentDirectory}outbox-media/`;

const currentUserId = () => store.getState().auth.user?._id ?? null;

const dirFor = (userId: string) => `${ROOT}${userId}/`;
const pathFor = (userId: string, name: string) => `${dirFor(userId)}${name}.json`;

// Writes to the same file are chained so two quick saves can't interleave and
// leave a truncated file.
const writeChains = new Map<string, Promise<unknown>>();

// Set while signing out so a save that was already in flight can't recreate
// the folder that clearOfflineFiles() just deleted.
let writesDisabled = false;
export const setOfflineWritesEnabled = (enabled: boolean) => {
  writesDisabled = !enabled;
};

export async function writeJson(name: string, value: unknown): Promise<void> {
  const userId = currentUserId();
  if (!userId || writesDisabled) return;
  const path = pathFor(userId, name);

  const previous = writeChains.get(path) ?? Promise.resolve();
  const next = previous
    .catch(() => {})
    .then(async () => {
      if (writesDisabled) return;
      await FileSystem.makeDirectoryAsync(dirFor(userId), {
        intermediates: true,
      }).catch(() => {});
      await FileSystem.writeAsStringAsync(path, JSON.stringify(value));
    });
  writeChains.set(path, next);
  try {
    await next;
  } finally {
    if (writeChains.get(path) === next) writeChains.delete(path);
  }
}

// Returns null for "no file yet" AND for an unreadable/corrupt file (e.g. the
// app was killed mid-write) — a bad cache must never break the app.
export async function readJson<T>(name: string): Promise<T | null> {
  const userId = currentUserId();
  if (!userId) return null;
  try {
    const raw = await FileSystem.readAsStringAsync(pathFor(userId, name));
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function removeJson(name: string): Promise<void> {
  const userId = currentUserId();
  if (!userId) return;
  await FileSystem.deleteAsync(pathFor(userId, name), {
    idempotent: true,
  }).catch(() => {});
}

// Sign-out: remove every account's offline data and queued attachments.
export async function clearOfflineFiles(): Promise<void> {
  writesDisabled = true;
  // Let saves already in flight finish (they'll skip) before deleting.
  await Promise.allSettled([...writeChains.values()]);
  writeChains.clear();
  await Promise.all([
    FileSystem.deleteAsync(ROOT, { idempotent: true }).catch(() => {}),
    FileSystem.deleteAsync(OUTBOX_MEDIA_DIR, { idempotent: true }).catch(
      () => {}
    ),
  ]);
}
