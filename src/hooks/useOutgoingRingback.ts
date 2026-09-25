import { useEffect, useRef } from "react";
import { createAudioPlayer, AudioPlayer } from "expo-audio";
import { OUTGOING_RINGBACK } from "../services/outgoingRingback";

// Same caveat as useRingtone.ts: .remove() is a best guess at releasing
// an expo-audio AudioPlayer — verify against your installed version.
const safeAudioCall = (fn: () => void) => {
  try {
    fn();
  } catch {
    // no-op
  }
};

/**
 * Plays a looping ringback tone — one of two fixed tones depending on
 * whether the person being called is a saved contact — for as long as
 * `isCalling` is true. No vibration here, unlike useRingtone: this plays
 * on the caller's own device while they wait for pickup, not an alert
 * that needs to grab attention. Call unconditionally, before any early
 * return, same rule as useRingtone.
 */
export function useOutgoingRingback(
  isCalling: boolean,
  isKnownContact: boolean
) {
  const playerRef = useRef<AudioPlayer | null>(null);

  useEffect(() => {
    if (!isCalling) return;

    const source = isKnownContact
      ? OUTGOING_RINGBACK.known
      : OUTGOING_RINGBACK.unknown;

    if (!source) return; // no asset configured yet — silent, not a crash

    try {
      // keepAudioSessionActive: this player is stopped the instant the call
      // is answered, while the call itself is already using the shared iOS
      // audio session. Without it expo-audio deactivates that session on
      // pause — cutting the call's audio right at pickup.
      const player = createAudioPlayer(source, {
        keepAudioSessionActive: true,
      });
      player.loop = true;
      player.volume = 1;
      player.play();
      playerRef.current = player;
    } catch (err) {
      // Same failure mode as useRingtone: degrade to silence, never crash
      // the call screen over a bad/missing audio file.
      console.log("[useOutgoingRingback] playback error ===>>", err);
    }

    return () => {
      const player = playerRef.current;
      playerRef.current = null;
      if (player) {
        safeAudioCall(() => player.pause());
        safeAudioCall(() => player.remove());
      }
    };
  }, [isCalling, isKnownContact]);
}
