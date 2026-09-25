import { Alert, Linking } from "react-native";
import { AudioModule } from "expo-audio";
import * as ImagePicker from "expo-image-picker";

// Asks for the microphone (and camera, for video) BEFORE joining a call.
//
// Why: the Stream SDK only ever *checks* these permissions. If the microphone
// is denied it silently publishes no audio — the call connects, nobody
// hears you, and nothing tells you why. Asking up front (so the OS dialog
// isn't buried in the middle of the join) and warning when it's off turns
// that into something the user can fix.
export async function ensureCallPermissions(isVideo: boolean): Promise<{
  mic: boolean;
  camera: boolean;
}> {
  let mic = false;
  let camera = !isVideo;

  try {
    mic = (await AudioModule.requestRecordingPermissionsAsync()).granted;
  } catch {
    mic = false;
  }

  if (isVideo) {
    try {
      camera = (await ImagePicker.requestCameraPermissionsAsync()).granted;
    } catch {
      camera = false;
    }
  }

  return { mic, camera };
}

export function warnPermissionsOff(perms: { mic: boolean; camera: boolean }) {
  if (perms.mic && perms.camera) return;

  const what = !perms.mic ? "microphone" : "camera";
  const effect = !perms.mic
    ? "The other person won't be able to hear you."
    : "The other person won't be able to see you.";

  Alert.alert(
    `${what[0].toUpperCase()}${what.slice(1)} access is off`,
    `${effect} Turn it on in Settings, then start the call again.`,
    [
      { text: "Not now", style: "cancel" },
      { text: "Open Settings", onPress: () => Linking.openSettings() },
    ]
  );
}
