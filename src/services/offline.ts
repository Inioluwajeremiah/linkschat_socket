import { store } from "../store";
import { resetChat } from "../store/slices/chatSlice";
import {
  hydrateChatCache,
  resetChatCache,
  startChatCachePersistence,
} from "./chatCache";
import { resetOutbox, startOutbox } from "./outbox";
import { clearOfflineFiles, setOfflineWritesEnabled } from "./offlineStorage";

// Loads the saved chat list into the store. Called during session restore so
// the chat list is on screen at first paint, before any network request.
export const hydrateOfflineData = () => hydrateChatCache();

// Turns on offline reading (saving chats/messages as they change) and the
// send queue. Idempotent; call whenever a user is signed in.
export async function startOfflineSync() {
  setOfflineWritesEnabled(true);
  await hydrateChatCache();
  startChatCachePersistence();
  await startOutbox();
}

// Sign-out: stop everything, forget the account's chats, delete its saved
// data and any queued attachments. Queued messages are NOT sent — they
// belong to the account that's leaving.
export async function clearOfflineData() {
  resetOutbox();
  resetChatCache();
  store.dispatch(resetChat());
  await clearOfflineFiles();
}
