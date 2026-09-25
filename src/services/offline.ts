import { store } from "../store";
import { resetChat } from "../store/slices/chatSlice";
import {
  hydrateChatCache,
  resetChatCache,
  startChatCachePersistence,
} from "./chatCache";
import {
  hydrateSnapshots,
  resetSnapshots,
  startSnapshotPersistence,
} from "./snapshotCache";
import { resetOutbox, startOutbox } from "./outbox";
import { clearOfflineFiles, setOfflineWritesEnabled } from "./offlineStorage";

// Loads the saved chat list, statuses and blocked list into the store. Called
// during session restore so they're on screen at first paint, before any
// network request.
export const hydrateOfflineData = () =>
  Promise.all([hydrateChatCache(), hydrateSnapshots()]).then(() => {});

// Turns on offline reading (saving data as it changes) and the send queue.
// Idempotent; call whenever a user is signed in.
export async function startOfflineSync() {
  setOfflineWritesEnabled(true);
  await hydrateOfflineData();
  startChatCachePersistence();
  startSnapshotPersistence();
  await startOutbox();
}

// Sign-out: stop everything, forget the account's data in memory, delete its
// saved data and any queued attachments. Queued messages are NOT sent — they
// belong to the account that's leaving.
export async function clearOfflineData() {
  resetOutbox();
  resetChatCache();
  resetSnapshots();
  store.dispatch(resetChat());
  await clearOfflineFiles();
}
