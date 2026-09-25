import { setAudioModeAsync } from "expo-audio";

// ONE audio configuration for everything that uses expo-audio (ringtone,
// ringback, voice notes). It matters for calls:
//
// - "mixWithOthers": on Android, expo-audio otherwise asks for exclusive
//   audio focus whenever a player starts, and PAUSES ALL of its players the
//   moment anything else takes focus. The call starts its own audio session
//   the instant you dial, so the outgoing ringback was being cut off within a
//   second (caller hears nothing while ringing). With mixWithOthers expo-audio
//   never requests focus, so there is nothing to lose.
// - It must be the SAME everywhere: interruptionMode has no default, so any
//   setAudioModeAsync() call that omits it silently resets it.
//
// NOTE (Android): every setAudioModeAsync() call also resets the device audio
// mode to normal and forces the speakerphone on. Never call it while a call is
// starting or in progress — configureAudio() runs once at app launch, and the
// voice-note screens only run it outside calls.
export const BASE_AUDIO_MODE = {
  playsInSilentMode: true,
  interruptionMode: "mixWithOthers",
} as const;

export const configureAudio = () =>
  setAudioModeAsync({ ...BASE_AUDIO_MODE, allowsRecording: false }).catch(
    () => {}
  );
