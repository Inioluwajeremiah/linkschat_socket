// import { useEffect, useRef } from "react";
// import { Vibration } from "react-native";
// import { createAudioPlayer, AudioPlayer } from "expo-audio";
// import { resolveRingtone } from "../services/ringtoneStorage";

// // Repeats: ring, pause, ring, pause... — Vibration.vibrate's second
// // argument (repeat) loops this pattern until Vibration.cancel() is called.
// const VIBRATION_PATTERN = [0, 700, 500];

// // expo-audio's underlying native player can throw "already released" if
// // the screen unmounts (call accepted/declined and navigated away) while
// // this is still mid-setup — same class of race as expo-video's player,
// // covered elsewhere in this app. Swallow it here rather than crash the
// // incoming-call screen over ringtone cleanup.
// // NOTE: `.remove()` is my best guess at how to release an expo-audio
// // AudioPlayer instance — verify this against your installed expo-audio
// // version; some releases may use `.release()` instead, or clean up
// // automatically on garbage collection without an explicit call.
// const safeAudioCall = (fn: () => void) => {
//   try {
//     fn();
//   } catch {
//     // no-op
//   }
// };

// /**
//  * Plays the user's selected ringtone (looping) plus a repeating vibration
//  * pattern for as long as `isRinging` is true. Call this unconditionally
//  * near the top of a component — before any early return — since it's a
//  * hook and must run in the same order every render.
//  */
// export function useRingtone(isRinging: boolean) {
//   const playerRef = useRef<AudioPlayer | null>(null);

//   useEffect(() => {
//     if (!isRinging) return;

//     let cancelled = false;

//     (async () => {
//       const ringtone = await resolveRingtone();
//       if (cancelled || !ringtone) return;

//       try {
//         const player = createAudioPlayer(ringtone.source);
//         player.loop = true;
//         player.volume = 1;
//         player.play();
//         playerRef.current = player;
//       } catch {
//         // Missing/corrupt audio file — e.g. a custom file the user picked
//         // was deleted after selection. Ringing should degrade to
//         // vibration-only, never crash the incoming-call screen.
//       }
//     })();

//     Vibration.vibrate(VIBRATION_PATTERN, true);

//     return () => {
//       cancelled = true;
//       Vibration.cancel();
//       if (playerRef.current) {
//         const player = playerRef.current;
//         playerRef.current = null;
//         safeAudioCall(() => player.pause());
//         safeAudioCall(() => player.remove());
//       }
//     };
//   }, [isRinging]);
// }

// import { useEffect, useRef } from "react";
// import { Vibration } from "react-native";
// import { createAudioPlayer, AudioPlayer } from "expo-audio";
// import { resolveRingtone } from "../services/ringtoneStorage";

// // Repeats: ring, pause, ring, pause... — Vibration.vibrate's second
// // argument (repeat) loops this pattern until Vibration.cancel() is called.
// const VIBRATION_PATTERN = [0, 700, 500];

// // expo-audio's underlying native player can throw "already released" if
// // the screen unmounts (call accepted/declined and navigated away) while
// // this is still mid-setup — same class of race as expo-video's player,
// // covered elsewhere in this app. Swallow it here rather than crash the
// // incoming-call screen over ringtone cleanup.
// // NOTE: `.remove()` is my best guess at how to release an expo-audio
// // AudioPlayer instance — verify this against your installed expo-audio
// // version; some releases may use `.release()` instead, or clean up
// // automatically on garbage collection without an explicit call.
// const safeAudioCall = (fn: () => void) => {
//   try {
//     fn();
//   } catch {
//     // no-op
//   }
// };

// /**
//  * Plays the user's selected ringtone (looping) plus a repeating vibration
//  * pattern for as long as `isRinging` is true. Call this unconditionally
//  * near the top of a component — before any early return — since it's a
//  * hook and must run in the same order every render.
//  */
// export function useRingtone(isRinging: boolean) {
//   const playerRef = useRef<AudioPlayer | null>(null);

//   useEffect(() => {
//     if (!isRinging) return;

//     let cancelled = false;

//     (async () => {
//       const ringtone = await resolveRingtone();
//       if (cancelled || !ringtone) return;

//       try {
//         const player = createAudioPlayer(ringtone.source);
//         player.loop = true;
//         player.volume = 1;
//         player.play();
//         playerRef.current = player;
//       } catch (err) {
//         // Missing/corrupt audio file — e.g. a custom file the user picked
//         // was deleted after selection. Ringing should degrade to
//         // vibration-only, never crash the incoming-call screen — but log
//         // it so a real bug here doesn't look identical to "no ringtone
//         // selected" from the outside.
//         console.log("useRingtone playback error ===>>", err);
//       }
//     })();

//     Vibration.vibrate(VIBRATION_PATTERN, true);

//     return () => {
//       cancelled = true;
//       Vibration.cancel();
//       if (playerRef.current) {
//         const player = playerRef.current;
//         playerRef.current = null;
//         safeAudioCall(() => player.pause());
//         safeAudioCall(() => player.remove());
//       }
//     };
//   }, [isRinging]);
// }

import { useEffect, useRef } from "react";
import { Vibration } from "react-native";
import { createAudioPlayer, AudioPlayer } from "expo-audio";
import { resolveRingtone } from "../services/ringtoneStorage";

// Repeats: ring, pause, ring, pause... — Vibration.vibrate's second
// argument (repeat) loops this pattern until Vibration.cancel() is called.
const VIBRATION_PATTERN = [0, 700, 500];

// expo-audio's underlying native player can throw "already released" if
// the screen unmounts (call accepted/declined and navigated away) while
// this is still mid-setup — same class of race as expo-video's player,
// covered elsewhere in this app. Swallow it here rather than crash the
// incoming-call screen over ringtone cleanup.
// NOTE: `.remove()` is my best guess at how to release an expo-audio
// AudioPlayer instance — verify this against your installed expo-audio
// version; some releases may use `.release()` instead, or clean up
// automatically on garbage collection without an explicit call.
const safeAudioCall = (fn: () => void) => {
  try {
    fn();
  } catch {
    // no-op
  }
};

/**
 * Plays the user's selected ringtone (looping) plus a repeating vibration
 * pattern for as long as `isRinging` is true. Call this unconditionally
 * near the top of a component — before any early return — since it's a
 * hook and must run in the same order every render.
 */
export function useRingtone(isRinging: boolean) {
  const playerRef = useRef<AudioPlayer | null>(null);

  // Logs on every render, unconditionally — if this line never appears at
  // all when a call comes in, the hook itself isn't being invoked (wrong
  // import path, stale Metro bundle, duplicate file, etc.) and nothing
  // below matters yet.
  console.log("[useRingtone] render, isRinging =", isRinging);

  useEffect(() => {
    console.log("[useRingtone] effect ran, isRinging =", isRinging);
    if (!isRinging) return;

    let cancelled = false;

    (async () => {
      const ringtone = await resolveRingtone();
      console.log("[useRingtone] resolveRingtone() =>", ringtone);
      if (cancelled) {
        console.log("[useRingtone] cancelled before playback started");
        return;
      }
      if (!ringtone) {
        console.log("[useRingtone] no ringtone resolved — nothing to play");
        return;
      }

      try {
        const player = createAudioPlayer(ringtone.source);
        player.loop = true;
        player.volume = 1;
        player.play();
        playerRef.current = player;
        console.log("[useRingtone] player created, .play() called");
      } catch (err) {
        // Missing/corrupt audio file — e.g. a custom file the user picked
        // was deleted after selection. Ringing should degrade to
        // vibration-only, never crash the incoming-call screen — but log
        // it so a real bug here doesn't look identical to "no ringtone
        // selected" from the outside.
        console.log("[useRingtone] playback error ===>>", err);
      }
    })();

    console.log("[useRingtone] calling Vibration.vibrate now");
    Vibration.vibrate(VIBRATION_PATTERN, true);

    return () => {
      console.log("[useRingtone] cleanup (isRinging changed or unmounting)");
      cancelled = true;
      Vibration.cancel();
      if (playerRef.current) {
        const player = playerRef.current;
        playerRef.current = null;
        safeAudioCall(() => player.pause());
        safeAudioCall(() => player.remove());
      }
    };
  }, [isRinging]);
}
