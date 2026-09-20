export type RingbackSource = number | { uri: string };

// Empty on purpose — same reasoning as BUNDLED_RINGTONES in
// ringtoneStorage.ts: a require() pointing at a file that doesn't exist
// fails the Metro build immediately, not gracefully at runtime. Add your
// two ringback audio files under assets/sounds/, then fill these in:
//
//   known: require("../../assets/sounds/ringback-known.wav"),
//   unknown: require("../../assets/sounds/ringback-unknown.wav"),
//
// Until then, useOutgoingRingback plays nothing while calling out — same
// silence as today — rather than crashing the build.
export const OUTGOING_RINGBACK: {
  known: RingbackSource | null;
  unknown: RingbackSource | null;
} = {
  known: require("../../assets/sounds/out_0.wav"),
  unknown: require("../../assets/sounds/out_1.wav"),
};
