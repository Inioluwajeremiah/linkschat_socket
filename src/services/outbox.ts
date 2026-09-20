import * as FileSystem from "expo-file-system/legacy";
import NetInfo from "@react-native-community/netinfo";
import { AppState } from "react-native";
import { store } from "../store";
import {
  addMessage,
  removeMessage,
  updateMessage,
} from "../store/slices/chatSlice";
import { ApiError, uploadFileToS3 } from "./api";
import { socketService } from "./socket";
import { OUTBOX_MEDIA_DIR, readJson, writeJson } from "./offlineStorage";
import type { Message } from "../types";

// The offline send queue. EVERY outgoing message — text, photo, video, voice
// note, document, sticker, GIF — goes through enqueueMessage():
//
//   1. it is saved to disk (attachments are copied into the app's own
//      storage so they survive restarts and the picker's temp cleanup);
//   2. a pending bubble appears in the chat immediately;
//   3. when there is a connection it uploads the file (if any), sends the
//      message over the socket and waits for the server's acknowledgement;
//   4. otherwise it just waits, and is retried on reconnect, on returning to
//      the app, and on a backoff timer.
//
// The message's tempId doubles as an idempotency key: the server stores it
// as clientId, so retrying after a lost acknowledgement can't post twice.

export interface OutboxItem {
  tempId: string;
  chatId: string;
  createdAt: string;
  type: Message["type"];
  content: string;
  replyTo?: string;
  replyPreview?: Message; // only to redraw the quote on a restored bubble
  // Attachment: durable local copy, plus metadata for the upload/message.
  localUri?: string;
  mimeType?: string;
  mediaName?: string;
  mediaSize?: number;
  mediaDuration?: number;
  // Set once uploaded, or up front for content that needs no upload
  // (a bundled sticker reference).
  mediaUrl?: string;
  // "sending" is in-memory only: after a restart an interrupted item is
  // simply "queued" again.
  status: "queued" | "failed";
  attempts: number;
  error?: string;
}

type LiveItem = OutboxItem & { preparing?: boolean };

export interface EnqueueInput {
  chatId: string;
  type: Message["type"];
  content?: string;
  replyTo?: Message | null;
  mediaUrl?: string;
  media?: {
    uri: string;
    mimeType?: string;
    name?: string;
    size?: number;
    duration?: number;
  };
  // Pass false if `media.uri` is already a durable copy from makeDurableCopy.
  copyMedia?: boolean;
}

interface Ack {
  ok: boolean;
  message?: Message;
  error?: string;
  code?: string;
}

let queue: LiveItem[] = [];
let hydrating: Promise<void> | null = null;
let running = false;
let rerun = false;
let retryTimer: ReturnType<typeof setTimeout> | undefined;
let stopListeners: (() => void) | null = null;

// ─── Persistence ─────────────────────────────────────────────────────────────
const persist = () =>
  writeJson(
    "outbox",
    queue.map(({ preparing, ...item }) => item)
  ).catch(() => {});

// ─── Local file handling ─────────────────────────────────────────────────────
const extOf = (s: string) => {
  const m = s.split("?")[0].match(/\.[A-Za-z0-9]{1,8}$/);
  return m ? m[0] : "";
};

// Copies a file into the app's own storage. Falls back to the original
// location if the copy fails (better a possibly-fragile attachment than none).
export async function makeDurableCopy(
  uri: string,
  nameHint?: string
): Promise<string> {
  try {
    await FileSystem.makeDirectoryAsync(OUTBOX_MEDIA_DIR, {
      intermediates: true,
    }).catch(() => {});
    const dest = `${OUTBOX_MEDIA_DIR}${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}${extOf(nameHint || "") || extOf(uri)}`;
    await FileSystem.copyAsync({ from: uri, to: dest });
    return dest;
  } catch {
    return uri;
  }
}

// Deletes our copy once nothing in the queue needs it any more (a file shared
// to several chats is one copy referenced by several items).
function releaseLocalFile(item: LiveItem) {
  const uri = item.localUri;
  if (!uri || !uri.startsWith(OUTBOX_MEDIA_DIR)) return;
  if (queue.some((o) => o !== item && o.localUri === uri)) return;
  FileSystem.deleteAsync(uri, { idempotent: true }).catch(() => {});
}

// ─── Bubbles ─────────────────────────────────────────────────────────────────
const toBubble = (item: OutboxItem): Message =>
  ({
    _id: item.tempId,
    tempId: item.tempId,
    chatId: item.chatId,
    sender: store.getState().auth.user,
    content: item.content,
    type: item.type,
    // Show the local file straight away, like the old optimistic send did.
    mediaUrl: item.localUri || item.mediaUrl,
    mediaName: item.mediaName,
    mediaSize: item.mediaSize,
    mediaDuration: item.mediaDuration,
    replyTo: item.replyPreview,
    createdAt: item.createdAt,
    updatedAt: item.createdAt,
    readBy: [],
    reactions: [],
    _status: item.status === "failed" ? "failed" : "queued",
    _error: item.error,
  }) as unknown as Message;

const setBubbleStatus = (
  item: OutboxItem,
  status: "queued" | "sending" | "failed",
  error?: string
) =>
  store.dispatch(
    updateMessage({
      chatId: item.chatId,
      messageId: item.tempId,
      changes: { _status: status, _error: error },
    })
  );

// ─── Enqueue ─────────────────────────────────────────────────────────────────
export async function enqueueMessage(input: EnqueueInput): Promise<string> {
  await ensureHydrated();

  const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const item: LiveItem = {
    tempId,
    chatId: input.chatId,
    createdAt: new Date().toISOString(),
    type: input.type,
    content: input.content ?? "",
    replyTo: input.replyTo?._id,
    replyPreview: input.replyTo ?? undefined,
    localUri: input.media?.uri,
    mimeType: input.media?.mimeType,
    mediaName: input.media?.name,
    mediaSize: input.media?.size,
    mediaDuration: input.media?.duration,
    mediaUrl: input.mediaUrl,
    status: "queued",
    attempts: 0,
    preparing: !!input.media && input.copyMedia !== false,
  };

  // Take the queue position and show the bubble synchronously, BEFORE the
  // (possibly slow) file copy below, so messages sent in quick succession
  // keep the order the user sent them in.
  queue.push(item);
  store.dispatch(addMessage({ chatId: item.chatId, message: toBubble(item) }));

  if (item.preparing && item.localUri) {
    item.localUri = await makeDurableCopy(item.localUri, item.mediaName);
    item.preparing = false;
  }
  await persist();
  void processOutbox();
  return tempId;
}

// ─── Send loop ───────────────────────────────────────────────────────────────
const uploadTypeFor = (type: Message["type"]) =>
  type === "sticker" ? "image" : type;

const defaultName = (item: OutboxItem) =>
  item.mediaName ||
  (item.type === "audio"
    ? "voice.m4a"
    : item.type === "sticker"
      ? "sticker.jpg"
      : "file");

// A 4xx (other than "log in again" / "slow down") won't be fixed by trying
// again; anything else — network failure, timeout, 5xx — will.
const isPermanent = (err: unknown) =>
  err instanceof ApiError &&
  err.status !== undefined &&
  err.status >= 400 &&
  err.status < 500 &&
  ![401, 408, 429].includes(err.status);

function fail(item: LiveItem, message: string): "done" {
  item.status = "failed";
  item.error = message;
  setBubbleStatus(item, "failed", message);
  void persist();
  return "done";
}

function complete(item: LiveItem, message: Message) {
  queue = queue.filter((o) => o !== item);
  void persist();
  // Same tempId → replaces the pending bubble with the confirmed message.
  store.dispatch(
    addMessage({
      chatId: item.chatId,
      message: { ...message, tempId: item.tempId },
    })
  );
  releaseLocalFile(item);
}

// "done"  → finished with this item (sent, or failed for good): carry on.
// "wait"  → couldn't reach the server: stop and try again later.
async function sendOne(item: LiveItem): Promise<"done" | "wait"> {
  setBubbleStatus(item, "sending");
  const needsUpload = !!item.localUri && !item.mediaUrl;

  if (needsUpload) {
    socketService.emit("activity:start", {
      chatId: item.chatId,
      status: "uploading",
    });
  }

  try {
    if (needsUpload) {
      const info = await FileSystem.getInfoAsync(item.localUri!);
      if (!info.exists) return fail(item, "The file is no longer available");

      const url = await uploadFileToS3(
        item.localUri!,
        defaultName(item),
        item.mimeType || "application/octet-stream",
        uploadTypeFor(item.type)
      );
      item.mediaUrl = url;
      // Other queued messages carrying the very same file (one file shared to
      // several chats) don't need to upload it again.
      for (const other of queue) {
        if (other !== item && other.localUri === item.localUri && !other.mediaUrl) {
          other.mediaUrl = url;
        }
      }
      await persist();
    }

    // Deleted while the upload was running.
    if (!queue.includes(item)) return "done";

    const res = await socketService.emitWithAck<Ack>("message:send", {
      chatId: item.chatId,
      content: item.content,
      type: item.type,
      mediaUrl: item.mediaUrl,
      mediaName: item.mediaName,
      mediaSize: item.mediaSize,
      mediaDuration: item.mediaDuration,
      replyTo: item.replyTo,
      tempId: item.tempId,
    });

    if (res?.ok && res.message) {
      complete(item, res.message);
      return "done";
    }
    // The server understood and said no (blocked, chat gone, …): retrying
    // can't help. SERVER_ERROR is the exception — that's transient.
    if (res && res.ok === false && res.code !== "SERVER_ERROR") {
      return fail(item, res.error || "Couldn't send this message");
    }
    throw new Error(res?.error || "Server error");
  } catch (err) {
    if (isPermanent(err)) {
      return fail(
        item,
        err instanceof ApiError ? err.message : "Couldn't send this message"
      );
    }
    item.attempts += 1;
    setBubbleStatus(item, "queued");
    scheduleRetry(item.attempts);
    return "wait";
  } finally {
    if (needsUpload) {
      socketService.emit("activity:stop", {
        chatId: item.chatId,
        status: "uploading",
      });
    }
  }
}

function scheduleRetry(attempts: number) {
  clearTimeout(retryTimer);
  const delay = Math.min(60_000, 3_000 * 2 ** Math.min(attempts, 5));
  retryTimer = setTimeout(() => void processOutbox(), delay);
}

export async function processOutbox(): Promise<void> {
  if (running) {
    rerun = true;
    return;
  }
  running = true;
  try {
    do {
      rerun = false;
      // Strict FIFO so messages arrive in the order they were sent.
      for (const item of [...queue]) {
        if (item.status === "failed") continue; // waits for Retry / Delete
        if (item.preparing) break; // file still being copied; it re-triggers us
        if (!socketService.isConnected()) return; // reconnect re-triggers us
        if ((await sendOne(item)) === "wait") return;
      }
    } while (rerun);
  } finally {
    running = false;
  }
}

// ─── User actions on a failed message ────────────────────────────────────────
export function retryMessage(tempId: string) {
  const item = queue.find((i) => i.tempId === tempId);
  if (!item) return;
  item.status = "queued";
  item.attempts = 0;
  item.error = undefined;
  setBubbleStatus(item, "queued");
  void persist();
  void processOutbox();
}

export function discardMessage(tempId: string) {
  const item = queue.find((i) => i.tempId === tempId);
  if (!item) return;
  queue = queue.filter((o) => o !== item);
  void persist();
  store.dispatch(removeMessage({ chatId: item.chatId, messageId: tempId }));
  releaseLocalFile(item);
}

export const getPendingCount = () => queue.length;

// ─── Startup / shutdown ──────────────────────────────────────────────────────
async function hydrateOutbox() {
  const saved = await readJson<OutboxItem[]>("outbox");
  if (!Array.isArray(saved)) return;

  const known = new Set(queue.map((i) => i.tempId));
  const restored = saved.filter((i) => i?.tempId && i.chatId && !known.has(i.tempId));
  queue = [...restored, ...queue];

  // Redraw a pending bubble for each restored item (the in-memory chat
  // state starts empty on every launch).
  for (const item of restored) {
    const already = store
      .getState()
      .chat.messages[item.chatId]?.some((m) => m.tempId === item.tempId);
    if (!already) {
      store.dispatch(
        addMessage({ chatId: item.chatId, message: toBubble(item) })
      );
    }
  }
}

function ensureHydrated() {
  if (!hydrating) hydrating = hydrateOutbox().catch(() => {});
  return hydrating;
}

// Call once the user is signed in: restores the queue from disk and starts
// retrying whenever the connection comes back.
export async function startOutbox() {
  if (stopListeners) return;

  const unsubSocket = socketService.onStatusChange(() => {
    if (socketService.isConnected()) void processOutbox();
  });
  const unsubNet = NetInfo.addEventListener((state) => {
    if (state.isConnected && state.isInternetReachable !== false) {
      void processOutbox();
    }
  });
  const appState = AppState.addEventListener("change", (state) => {
    if (state === "active") void processOutbox();
  });
  stopListeners = () => {
    unsubSocket();
    unsubNet();
    appState.remove();
  };

  await ensureHydrated();
  void processOutbox();
}

// Sign-out: nothing queued may ever be sent as a different account.
export function resetOutbox() {
  stopListeners?.();
  stopListeners = null;
  clearTimeout(retryTimer);
  queue = [];
  hydrating = null;
  running = false;
  rerun = false;
}
