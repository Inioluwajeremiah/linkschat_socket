import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";

export type Ringtone = {
  id: string;
  name: string;
  source: number | { uri: string };
};

// ── Bundled ringtones ────────────────────────────────────────────────────
// Empty on purpose — a require() pointing at a file that doesn't exist
// fails the Metro build immediately, not gracefully at runtime. Add your
// audio files under assets/sounds/ringtones/, then add an entry per file:
//
//   { id: "classic", name: "Classic Ring", source: require("../assets/sounds/ringtones/classic.mp3") },
//
// Keep `id` stable once shipped — it's what gets persisted in AsyncStorage
// for anyone who picks that ringtone; renaming/removing an id later means
// resolveRingtone() will silently fall back to the default for them.
export const BUNDLED_RINGTONES: Ringtone[] = [
  {
    id: "1",
    name: "LinksChat Tone 1",
    source: require("../../assets/sounds/1.wav"),
  },
  {
    id: "2",
    name: "LinksChat Tone 2",
    source: require("../../assets/sounds/2.wav"),
  },
  {
    id: "3",
    name: "LinksChat Tone 3",
    source: require("../../assets/sounds/3.wav"),
  },
  {
    id: "4",
    name: "LinksChat Tone 4",
    source: require("../../assets/sounds/4.wav"),
  },
];

// The "default ringtone configured for them" — must match an id above
// once you've added at least one bundled ringtone. Left null until then;
// resolveRingtone() and useRingtone() both handle a null default fine
// (no ringtone audio plays, but the call still vibrates).
export const DEFAULT_RINGTONE_ID: string | null = null;

export type StoredRingtoneSelection =
  | { kind: "bundled"; id: string }
  | { kind: "custom"; name: string; uri: string };

const STORAGE_KEY = "selected_ringtone";

export async function getStoredRingtoneSelection(): Promise<StoredRingtoneSelection | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // Corrupt/unreadable stored value — treat as "nothing selected yet"
    // rather than throwing, so a bad AsyncStorage entry can't break the
    // incoming-call screen.
  }
  return DEFAULT_RINGTONE_ID
    ? { kind: "bundled", id: DEFAULT_RINGTONE_ID }
    : null;
}

export async function setStoredRingtoneSelection(
  selection: StoredRingtoneSelection
): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(selection));
}

/**
 * Resolves the current selection to a playable source + display name.
 * Falls back to the bundled default (or null, if there isn't one yet) if
 * a custom file's URI is no longer readable — e.g. the user picked a file
 * from another app's storage and it was later deleted or moved.
 */
export async function resolveRingtone(): Promise<{
  name: string;
  source: number | { uri: string };
} | null> {
  const selection = await getStoredRingtoneSelection();
  if (!selection) return null;

  if (selection.kind === "bundled") {
    const match = BUNDLED_RINGTONES.find((r) => r.id === selection.id);
    if (match) return { name: match.name, source: match.source };
  } else {
    try {
      const info = await FileSystem.getInfoAsync(selection.uri);
      if (info.exists) {
        return { name: selection.name, source: { uri: selection.uri } };
      }
    } catch {
      // Treat as missing — fall through to the default below.
    }
  }

  if (!DEFAULT_RINGTONE_ID) return null;
  const fallback = BUNDLED_RINGTONES.find((r) => r.id === DEFAULT_RINGTONE_ID);
  return fallback ? { name: fallback.name, source: fallback.source } : null;
}
