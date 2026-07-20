// utils/audioPlaybackManager.ts

type Listener = (activeId: string | null) => void;

class AudioPlaybackManager {
  private activeId: string | null = null;
  private listeners = new Set<Listener>();

  play(id: string) {
    this.activeId = id;
    this.notify();
  }

  stop(id: string) {
    // Only clear if this instance was the one considered active
    if (this.activeId === id) {
      this.activeId = null;
      this.notify();
    }
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    // return () => this.listeners.delete(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l(this.activeId));
  }
}

export const audioPlaybackManager = new AudioPlaybackManager();
