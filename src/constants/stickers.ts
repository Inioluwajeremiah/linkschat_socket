// Registry of bundled sticker packs. Since these ship inside the app
// itself, both sender and receiver already have the image — we never
// upload these to S3, we just send a lightweight reference and let the
// receiving app resolve it locally. See utils/stickerResolve.ts.
//
// To add a new pack: drop PNGs (ideally 512x512, transparent background)
// into assets/stickers/<packId>/, then register them below.

export interface BundledSticker {
  id: string;
  source: number; // result of require(@.)
}

export interface StickerPack {
  id: string;
  name: string;
  icon: BundledSticker; // shown as the pack's tab thumbnail
  stickers: BundledSticker[];
}

export const STICKER_PACKS: StickerPack[] = [
  {
    id: "pack-basics",
    name: "Basics",
    icon: { id: "1", source: require("@/assets/stickers/pack-basics/1.png") },
    stickers: [
      { id: "1", source: require("@/assets/stickers/pack-basics/1.png") },
      { id: "2", source: require("@/assets/stickers/pack-basics/2.png") },
      { id: "3", source: require("@/assets/stickers/pack-basics/3.png") },
      { id: "4", source: require("@/assets/stickers/pack-basics/4.png") },
      { id: "5", source: require("@/assets/stickers/pack-basics/5.png") },
      { id: "6", source: require("@/assets/stickers/pack-basics/6.png") },
    ],
  },
];

// A message-ready sticker reference. `kind: "bundled"` messages carry no
// mediaUrl at all — just packId/stickerId, resolved locally on both ends.
// `kind: "custom"` messages behave like a normal image message: the file
// is uploaded to S3 first and mediaUrl is a real remote URL.
export type StickerRef =
  | { kind: "bundled"; packId: string; stickerId: string }
  | { kind: "custom"; localUri: string };

// Bundled sticker refs are encoded into the existing `mediaUrl` string
// field using a fake scheme, so no message-schema changes are needed
// beyond adding "sticker" to the `type` enum.
const BUNDLED_SCHEME = "sticker-asset://";

export const encodeBundledRef = (packId: string, stickerId: string) =>
  `${BUNDLED_SCHEME}${packId}/${stickerId}`;

export const isBundledStickerRef = (mediaUrl?: string) =>
  !!mediaUrl?.startsWith(BUNDLED_SCHEME);

export const findBundledStickerSource = (mediaUrl?: string): number | null => {
  if (!isBundledStickerRef(mediaUrl)) return null;
  const [packId, stickerId] = mediaUrl!.slice(BUNDLED_SCHEME.length).split("/");
  const pack = STICKER_PACKS.find((p) => p.id === packId);
  const sticker = pack?.stickers.find((s) => s.id === stickerId);
  return sticker?.source ?? null;
};
