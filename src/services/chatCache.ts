import { AppState } from "react-native";
import { store } from "../store";
import { setChats } from "../store/slices/chatSlice";
import { readJson, writeJson } from "./offlineStorage";
import type { Chat, Message } from "../types";

// Offline reading: the chat list and the latest messages of every chat are
// mirrored to disk as they change, and loaded back at startup / when a chat
// is opened, so the app is readable with no connection. The server stays the
// source of truth — a successful fetch always replaces what's cached.

const MAX_CACHED_CHATS = 300;
const MAX_CACHED_MESSAGES = 60; // per chat
const SAVE_DELAY_MS = 1500;

const currentUserId = () => store.getState().auth.user?._id ?? null;

// ─── Load ────────────────────────────────────────────────────────────────────
let hydration: { userId: string; promise: Promise<void> } | null = null;

// Fills the chat list from disk. Safe to call repeatedly / concurrently.
export function hydrateChatCache(): Promise<void> {
  const userId = currentUserId();
  if (!userId) return Promise.resolve();
  if (hydration?.userId === userId) return hydration.promise;

  const promise = (async () => {
    const chats = await readJson<Chat[]>("chats");
    // If fresh data from the network already landed, it wins.
    if (
      chats?.length &&
      currentUserId() === userId &&
      store.getState().chat.chats.length === 0
    ) {
      store.dispatch(setChats(chats));
    }
  })();
  hydration = { userId, promise };
  return promise;
}

export const loadCachedMessages = (chatId: string) =>
  readJson<Message[]>(`messages-${chatId}`);

// ─── Save ────────────────────────────────────────────────────────────────────
const byCreatedAt = (a: Message, b: Message) =>
  new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();

// For chats whose in-memory list is only what arrived this session (e.g. a
// few incoming messages while the chat was never opened): merge into the
// saved history instead of overwriting it with that fragment.
async function mergeIntoCache(chatId: string, incoming: Message[]) {
  const existing = (await readJson<Message[]>(`messages-${chatId}`)) ?? [];
  const merged = new Map<string, Message>();
  for (const m of existing) merged.set(m._id, m);
  for (const m of incoming) merged.set(m._id, m);
  await writeJson(
    `messages-${chatId}`,
    [...merged.values()].sort(byCreatedAt).slice(-MAX_CACHED_MESSAGES)
  );
}

let stopPersistence: (() => void) | null = null;

// Call once the offline data has been hydrated for this account.
export function startChatCachePersistence() {
  if (stopPersistence) return;

  // Baseline = whatever is in memory right now; only later CHANGES are saved.
  let lastChats = store.getState().chat.chats;
  const lastLists = new Map<string, Message[]>(
    Object.entries(store.getState().chat.messages)
  );
  let chatsDirty = false;
  const dirtyChats = new Set<string>();
  let timer: ReturnType<typeof setTimeout> | undefined;

  const flush = () => {
    timer = undefined;
    const { chat } = store.getState();

    if (chatsDirty) {
      chatsDirty = false;
      writeJson("chats", chat.chats.slice(0, MAX_CACHED_CHATS)).catch(() => {});
    }

    for (const id of dirtyChats) {
      // Messages still in the outbox are persisted by the outbox itself.
      const confirmed = (chat.messages[id] ?? []).filter((m) => !m._status);
      if (confirmed.length === 0) continue;

      const save = chat.messagesLoaded[id]
        ? writeJson(`messages-${id}`, confirmed.slice(-MAX_CACHED_MESSAGES))
        : mergeIntoCache(id, confirmed);
      save.catch(() => {});
    }
    dirtyChats.clear();
  };

  const unsubscribe = store.subscribe(() => {
    const { chat } = store.getState();
    let changed = false;

    if (chat.chats !== lastChats) {
      lastChats = chat.chats;
      chatsDirty = true;
      changed = true;
    }
    for (const id in chat.messages) {
      const list = chat.messages[id];
      if (lastLists.get(id) !== list) {
        lastLists.set(id, list);
        dirtyChats.add(id);
        changed = true;
      }
    }
    if (changed && !timer) timer = setTimeout(flush, SAVE_DELAY_MS);
  });

  // The OS can kill a backgrounded app before the debounce fires.
  const appState = AppState.addEventListener("change", (state) => {
    if (state !== "active" && timer) {
      clearTimeout(timer);
      flush();
    }
  });

  stopPersistence = () => {
    unsubscribe();
    appState.remove();
    clearTimeout(timer);
  };
}

// Sign-out.
export function resetChatCache() {
  stopPersistence?.();
  stopPersistence = null;
  hydration = null;
}
