import { Platform } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as IntentLauncher from "expo-intent-launcher";
import * as Sharing from "expo-sharing";

const OPEN_DIR = `${FileSystem.cacheDirectory}opened-files/`;
const FLAG_GRANT_READ_URI_PERMISSION = 1;

const MIME_BY_EXT: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  txt: "text/plain",
  csv: "text/csv",
  rtf: "application/rtf",
  zip: "application/zip",
  apk: "application/vnd.android.package-archive",
  json: "application/json",
  mp3: "audio/mpeg",
  m4a: "audio/mp4",
  wav: "audio/wav",
  mp4: "video/mp4",
  mov: "video/quicktime",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
};

// iOS share sheet hints (Uniform Type Identifiers), so it offers the right
// "Open in…" apps for the file.
const UTI_BY_EXT: Record<string, string> = {
  pdf: "com.adobe.pdf",
  doc: "com.microsoft.word.doc",
  docx: "org.openxmlformats.wordprocessingml.document",
  xls: "com.microsoft.excel.xls",
  xlsx: "org.openxmlformats.spreadsheetml.sheet",
  ppt: "com.microsoft.powerpoint.ppt",
  pptx: "org.openxmlformats.presentationml.presentation",
  txt: "public.plain-text",
  csv: "public.comma-separated-values-text",
  rtf: "public.rtf",
  zip: "public.zip-archive",
  json: "public.json",
  mp3: "public.mp3",
  m4a: "com.apple.m4a-audio",
  wav: "com.microsoft.waveform-audio",
  mp4: "public.mpeg-4",
  mov: "com.apple.quicktime-movie",
  jpg: "public.jpeg",
  jpeg: "public.jpeg",
  png: "public.png",
  gif: "com.compuserve.gif",
};

const extOf = (s: string) =>
  s.split("?")[0].split(".").pop()?.toLowerCase() || "";

const mimeFor = (name: string) => MIME_BY_EXT[extOf(name)] || "*/*";

// Remote files (e.g. our own sent documents, whose mediaUrl becomes the S3
// URL after the server echo) must be on disk before another app can read
// them.
async function ensureLocal(uri: string, name: string): Promise<string> {
  if (!/^https?:\/\//i.test(uri)) return uri;

  await FileSystem.makeDirectoryAsync(OPEN_DIR, { intermediates: true }).catch(
    () => {}
  );
  const safeName = name.replace(/[^\w.\-]+/g, "_") || "file";
  const dest = `${OPEN_DIR}${Date.now()}-${safeName}`;
  const res = await FileSystem.downloadAsync(uri, dest);
  return res.uri;
}

// Opens a file the way WhatsApp does: hands it to an installed viewer app
// (PDF reader, Office, gallery, ...) instead of the share sheet. If no app
// can open the type, falls back to the share sheet so the user can still
// save or forward it.
export async function openFile(uri: string, name = ""): Promise<void> {
  const localUri = await ensureLocal(uri, name);
  const mimeType = mimeFor(name || localUri);

  if (Platform.OS === "android") {
    try {
      const contentUri = await FileSystem.getContentUriAsync(localUri);
      await IntentLauncher.startActivityAsync("android.intent.action.VIEW", {
        data: contentUri,
        type: mimeType,
        flags: FLAG_GRANT_READ_URI_PERMISSION,
      });
      return;
    } catch {
      // No activity can handle this type — fall through to the share sheet.
    }
  }

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(localUri, {
      mimeType: mimeType === "*/*" ? undefined : mimeType,
      UTI: UTI_BY_EXT[extOf(name || localUri)],
      dialogTitle: name || undefined,
    });
  }
}
