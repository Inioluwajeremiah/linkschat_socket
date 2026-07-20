import * as FileSystem from "expo-file-system/legacy";
import { useEffect, useState, useCallback } from "react";

export type DownloadStatus = "idle" | "downloading" | "downloaded" | "error";

interface DownloadState {
  status: DownloadStatus;
  progress: number; // 0..1
  localUri: string | null;
  error?: string;
}

type Listener = (state: DownloadState) => void;

const CACHE_DIR = `${FileSystem.cacheDirectory}chat-media/`;

function extFromUrl(url: string, fallback: string) {
  const clean = url.split("?")[0];
  const match = clean.match(/\.([a-zA-Z0-9]+)$/);
  return match ? match[1].toLowerCase() : fallback;
}

class MediaCacheManager {
  private states = new Map<string, DownloadState>();
  private listeners = new Map<string, Set<Listener>>();
  private dirReady: Promise<void> | null = null;

  private async ensureDir() {
    if (!this.dirReady) {
      this.dirReady = (async () => {
        const info = await FileSystem.getInfoAsync(CACHE_DIR);
        if (!info.exists) {
          await FileSystem.makeDirectoryAsync(CACHE_DIR, {
            intermediates: true,
          });
        }
      })();
    }
    return this.dirReady;
  }

  private getLocalPath(id: string, url: string, fallbackExt: string) {
    return `${CACHE_DIR}${id}.${extFromUrl(url, fallbackExt)}`;
  }

  getState(id: string): DownloadState {
    return (
      this.states.get(id) || { status: "idle", progress: 0, localUri: null }
    );
  }

  subscribe(id: string, listener: Listener) {
    if (!this.listeners.has(id)) this.listeners.set(id, new Set());
    this.listeners.get(id)!.add(listener);
    return () => {
      this.listeners.get(id)?.delete(listener);
    };
  }

  private setState(id: string, state: DownloadState) {
    this.states.set(id, state);
    this.listeners.get(id)?.forEach((l) => l(state));
  }

  async checkExisting(id: string, url: string, fallbackExt: string) {
    await this.ensureDir();
    const path = this.getLocalPath(id, url, fallbackExt);
    const info = await FileSystem.getInfoAsync(path);
    if (info.exists) {
      this.setState(id, { status: "downloaded", progress: 1, localUri: path });
      return path;
    }
    return null;
  }

  async download(id: string, url: string, fallbackExt: string) {
    const current = this.getState(id);
    if (current.status === "downloading" || current.status === "downloaded")
      return;

    await this.ensureDir();
    const path = this.getLocalPath(id, url, fallbackExt);
    this.setState(id, { status: "downloading", progress: 0, localUri: null });

    try {
      const resumable = FileSystem.createDownloadResumable(
        url,
        path,
        {},
        ({ totalBytesWritten, totalBytesExpectedToWrite }) => {
          const progress =
            totalBytesExpectedToWrite > 0
              ? totalBytesWritten / totalBytesExpectedToWrite
              : 0;
          this.setState(id, {
            status: "downloading",
            progress,
            localUri: null,
          });
        }
      );

      const result = await resumable.downloadAsync();
      if (!result?.uri) throw new Error("Download failed");

      this.setState(id, {
        status: "downloaded",
        progress: 1,
        localUri: result.uri,
      });
    } catch (err) {
      this.setState(id, {
        status: "error",
        progress: 0,
        localUri: null,
        error: (err as Error).message,
      });
    }
  }
}

export const mediaCacheManager = new MediaCacheManager();

export function useMediaDownload(id: string, url: string, fallbackExt: string) {
  const [state, setState] = useState(mediaCacheManager.getState(id));

  useEffect(() => {
    let mounted = true;
    mediaCacheManager.checkExisting(id, url, fallbackExt).then(() => {
      if (mounted) setState(mediaCacheManager.getState(id));
    });
    const unsubscribe = mediaCacheManager.subscribe(id, (s) => {
      if (mounted) setState(s);
    });
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [id, url]);

  const startDownload = useCallback(() => {
    mediaCacheManager.download(id, url, fallbackExt);
  }, [id, url, fallbackExt]);

  return { ...state, startDownload };
}

export function formatBytes(bytes?: number) {
  if (!bytes) return "";
  if (bytes > 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
}
