import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { store } from "../store";
import { setCredentials, logout } from "../store/slices/authSlice";
import { authApi, ApiError } from "./api";
import { socketService } from "./socket";
import { clearOfflineData, hydrateOfflineData } from "./offline";
import type { User } from "../types";

// Everything that makes up a signed-in session on disk. Clear ALL of these
// together on sign-out (see clearSession).
const SESSION_KEYS = [
  "accessToken",
  "refreshToken",
  "streamToken",
  "cachedUser",
  "pushToken",
  "pushTokenUser",
];

// Also wipes the account's offline data (saved chats, the send queue and any
// queued attachments), so nothing carries over to whoever signs in next.
export const clearSession = async () => {
  await AsyncStorage.multiRemove(SESSION_KEYS);
  await clearOfflineData().catch(() => {});
};

// ─── Persist the signed-in user ──────────────────────────────────────────────
// The tokens were already on disk, but the user object lived only in memory,
// so a cold start with no network had nothing to sign in WITH and fell back
// to the login screen. Mirror it to disk whenever it changes (login, profile
// edits, background refresh) so the app can open straight from cache.
let persistenceStarted = false;
export function startSessionPersistence() {
  if (persistenceStarted) return;
  persistenceStarted = true;

  let lastUser: User | null = null;
  store.subscribe(() => {
    const { user, isAuthenticated } = store.getState().auth;
    if (!isAuthenticated || !user || user === lastUser) return;
    lastUser = user;
    AsyncStorage.setItem("cachedUser", JSON.stringify(user)).catch(() => {});
  });
}

// ─── Verify the session against the server ───────────────────────────────────
// "expired"     → the server definitively rejected us (bad/expired tokens even
//                 after a refresh attempt, or the account is suspended).
//                 The ONLY outcome that may sign the user out.
// "unreachable" → network failure, timeout, 5xx… says nothing about the
//                 session. Never sign out on this.
type Verdict = "ok" | "expired" | "unreachable";

const statusOf = (err: unknown) =>
  err instanceof ApiError ? err.status : undefined;

async function applyFreshSession(
  user: User,
  streamToken: string | undefined
): Promise<void> {
  const [accessToken, refreshToken, storedStream] = await Promise.all([
    AsyncStorage.getItem("accessToken"),
    AsyncStorage.getItem("refreshToken"),
    AsyncStorage.getItem("streamToken"),
  ]);
  if (!accessToken) return;
  store.dispatch(
    setCredentials({
      user,
      accessToken,
      refreshToken: refreshToken || "",
      streamToken: streamToken || storedStream || "",
    })
  );
  // If the token was refreshed, the socket must reconnect with the new one.
  socketService.setToken(accessToken);
  socketService.resume();
}

async function verifyWithServer(): Promise<Verdict> {
  try {
    const me = await authApi.getMe();
    if (!me.success) return "unreachable";
    await applyFreshSession(me.data.user, me.data.streamToken);
    return "ok";
  } catch (err) {
    const status = statusOf(err);
    if (status === 403) return "expired"; // suspended account
    if (status !== 401) return "unreachable";
  }

  // 401: the access token is dead — try the refresh token.
  const refreshToken = await AsyncStorage.getItem("refreshToken");
  if (!refreshToken) return "expired";

  try {
    const res = await authApi.refreshToken(refreshToken);
    if (!res.success) return "unreachable";
    await AsyncStorage.setItem("accessToken", res.data.accessToken);
    if (res.data.refreshToken) {
      await AsyncStorage.setItem("refreshToken", res.data.refreshToken);
    }
  } catch (err) {
    // Only a definitive rejection of the refresh token ends the session. A
    // network error here used to fall through to "clear everything", i.e. a
    // flaky connection right after a 401 signed the user out.
    const status = statusOf(err);
    return status === 401 || status === 403 ? "expired" : "unreachable";
  }

  try {
    const me = await authApi.getMe();
    if (!me.success) return "unreachable";
    await applyFreshSession(me.data.user, me.data.streamToken);
    return "ok";
  } catch (err) {
    return statusOf(err) === 401 || statusOf(err) === 403
      ? "expired"
      : "unreachable";
  }
}

let validating: Promise<Verdict> | null = null;
let retryUnsubscribe: (() => void) | null = null;

// Single-flight verify + the sign-out decision + retry-when-back-online.
function validateSession(attempts = 1): Promise<Verdict> {
  if (validating) return validating;

  validating = (async () => {
    let verdict: Verdict = "unreachable";
    for (let i = 1; i <= attempts; i++) {
      verdict = await verifyWithServer();
      if (verdict !== "unreachable") break;
      if (i < attempts) await new Promise((r) => setTimeout(r, 800 * i));
    }

    if (verdict === "expired") {
      socketService.disconnect();
      await clearSession();
      store.dispatch(logout());
    } else if (verdict === "unreachable") {
      retryWhenOnline();
    }
    return verdict;
  })().finally(() => {
    validating = null;
  });

  return validating;
}

// Session stays open; re-verify (and refresh data) once the network is back.
function retryWhenOnline() {
  if (retryUnsubscribe) return;
  retryUnsubscribe = NetInfo.addEventListener((state) => {
    if (state.isConnected && state.isInternetReachable !== false) {
      retryUnsubscribe?.();
      retryUnsubscribe = null;
      if (store.getState().auth.isAuthenticated) void validateSession();
    }
  });
}

// ─── Cold-start restore ──────────────────────────────────────────────────────
// Resolves once the app knows whether to show the signed-in UI.
//
// With a cached user we open INSTANTLY from cache and verify in the
// background, so poor or no connectivity can no longer bounce a signed-in
// user to the login screen — they stay signed in and simply can't send until
// the network returns. Only a definitive server "no" ends the session.
export async function restoreSession(): Promise<void> {
  const [accessToken, refreshToken, streamToken, cachedRaw] = await Promise.all(
    ["accessToken", "refreshToken", "streamToken", "cachedUser"].map((k) =>
      AsyncStorage.getItem(k)
    )
  );

  if (!accessToken) return; // signed out

  let cachedUser: User | null = null;
  try {
    cachedUser = cachedRaw ? (JSON.parse(cachedRaw) as User) : null;
  } catch {
    cachedUser = null;
  }

  if (cachedUser) {
    store.dispatch(
      setCredentials({
        user: cachedUser,
        accessToken,
        refreshToken: refreshToken || "",
        streamToken: streamToken || "",
      })
    );
    // Put the saved chat list in the store before the first screen renders,
    // so an offline launch opens on the user's chats rather than an empty list.
    await hydrateOfflineData().catch(() => {});
    void validateSession();
    return;
  }

  // No cached user yet (first launch after updating to this version): there
  // is nothing to open with, so this one time we do need the server. Retry a
  // few times; tokens stay on disk either way, and once this succeeds the
  // user is cached for every later launch.
  await validateSession(3);
}
