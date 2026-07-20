import { useEffect, useRef } from "react";
import { useImageManipulator, SaveFormat } from "expo-image-manipulator";

interface Props {
  source: any; // the VideoThumbnail (SharedRef) to process
  onDone: (uri: string | null) => void;
}

/**
 * useImageManipulator is a hook, so it can only be called from a mounted
 * component — not inline inside an async function. This component exists
 * purely to bridge that gap: mount it with a `source` when you have one
 * ready, it runs the hook + render/save chain once, reports the result via
 * onDone, and the parent can unmount it immediately after.
 */
export default function ThumbnailProcessor({ source, onDone }: Props) {
  const context = useImageManipulator(source);
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    (async () => {
      try {
        const rendered = await context.renderAsync();
        const saved = await rendered.saveAsync({ format: SaveFormat.JPEG });
        onDone(saved.uri);
      } catch (e) {
        console.warn("ThumbnailProcessor failed", e);
        onDone(null);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context]);

  return null;
}
