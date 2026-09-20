// import { io, Socket } from "socket.io-client";
// import { SOCKET_URL } from "../constants";

// class SocketService {
//   private socket: Socket | null = null;
//   private token: string | null = null;

//   connect(token: string): Socket {
//     if (this.socket?.connected && this.token === token) {
//       return this.socket;
//     }

//     if (this.socket) {
//       this.socket.disconnect();
//     }

//     this.token = token;
//     this.socket = io(SOCKET_URL, {
//       auth: { token },
//       transports: ["websocket"],
//       reconnection: true,
//       reconnectionAttempts: 10,
//       reconnectionDelay: 1000,
//       reconnectionDelayMax: 5000,
//       timeout: 20000,
//     });

//     this.socket.on("connect", () => {
//       console.log("✅ Socket connected:", this.socket?.id);
//     });

//     this.socket.on("disconnect", (reason) => {
//       console.log("❌ Socket disconnected:", reason);
//     });

//     this.socket.on("connect_error", (error) => {
//       console.error("Socket connection error:", error.message);
//     });

//     return this.socket;
//   }

//   disconnect(): void {
//     this.socket?.disconnect();
//     this.socket = null;
//     this.token = null;
//   }

//   getSocket(): Socket | null {
//     return this.socket;
//   }

//   isConnected(): boolean {
//     return this.socket?.connected ?? false;
//   }

//   emit(event: string, data?: unknown): void {
//     if (this.socket?.connected) {
//       this.socket.emit(event, data);
//     }
//   }

//   on(event: string, callback: (...args: unknown[]) => void): void {
//     this.socket?.on(event, callback);
//   }

//   off(event: string, callback?: (...args: unknown[]) => void): void {
//     this.socket?.off(event, callback);
//   }

//   once(event: string, callback: (...args: unknown[]) => void): void {
//     this.socket?.once(event, callback);
//   }

//   joinChat(chatId: string): void {
//     this.emit("chat:join", chatId);
//   }

//   leaveChat(chatId: string): void {
//     this.emit("chat:leave", chatId);
//   }

//   sendMessage(data: {
//     chatId: string;
//     content: string;
//     type?: string;
//     mediaUrl?: string;
//     replyTo?: string;
//     tempId?: string;
//   }): void {
//     this.emit("message:send", data);
//   }

//   startTyping(chatId: string): void {
//     this.emit("typing:start", chatId);
//   }

//   stopTyping(chatId: string): void {
//     this.emit("typing:stop", chatId);
//   }

//   markRead(chatId: string): void {
//     this.emit("message:read", { chatId });
//   }

//   initiateCall(data: {
// callerAvatar: string;
// callerName: string;
//     recipientId: string;
//     callId: string;
//     type: "audio" | "video";
//     chatId?: string;
//   }): void {
//     this.emit("call:initiate", data);
//   }

//   acceptCall(callId: string, callerId: string): void {
//     this.emit("call:accept", { callId, callerId });
//   }

//   rejectCall(callId: string, callerId: string): void {
//     this.emit("call:reject", { callId, callerId });
//   }

//   endCall(callId: string, participants: string[]): void {
//     this.emit("call:end", { callId, participants });
//   }
// }

// export const socketService = new SocketService();

import { io, Socket } from "socket.io-client";
import { SOCKET_URL } from "../constants";

class SocketService {
  private socket: Socket | null = null;
  private token: string | null = null;
  private statusListeners = new Set<() => void>();
  private retryTimer: ReturnType<typeof setTimeout> | null = null;

  connect(token: string): Socket {
    if (this.socket?.connected && this.token === token) {
      return this.socket;
    }

    if (this.socket) {
      this.socket.disconnect();
    }

    this.token = token;
    this.socket = io(SOCKET_URL, {
      // A function, so every (re)connect attempt sends the CURRENT token —
      // setToken() can swap in a refreshed one without rebuilding the socket.
      auth: (cb) => cb({ token: this.token }),
      transports: ["websocket"],
      reconnection: true,
      // Never give up. With a finite cap (it was 10, ~45s) a spell of poor
      // signal left the socket permanently dead until the app was restarted.
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    const socket = this.socket;

    socket.on("connect", () => {
      this.notifyStatus();
    });

    socket.on("disconnect", () => {
      this.notifyStatus();
    });

    socket.on("connect_error", (error) => {
      this.notifyStatus();
      // When the server's handshake middleware rejects us, socket.io does
      // NOT reconnect on its own (socket.active is false) — so a transient
      // server-side hiccup would leave the socket dead. Retry manually.
      // "Invalid token" is different: retrying can't help, the session
      // validator refreshes the token and calls setToken()/resume().
      if (!socket.active && error.message !== "Invalid token") {
        this.scheduleRetry(socket);
      }
    });

    return socket;
  }

  private scheduleRetry(socket: Socket) {
    if (this.retryTimer) clearTimeout(this.retryTimer);
    this.retryTimer = setTimeout(() => {
      this.retryTimer = null;
      if (this.socket === socket && !socket.connected) socket.connect();
    }, 3000);
  }

  private notifyStatus() {
    this.statusListeners.forEach((cb) => cb());
  }

  // Subscribe to connect/disconnect changes (used by the connection banner).
  onStatusChange(cb: () => void): () => void {
    this.statusListeners.add(cb);
    return () => {
      this.statusListeners.delete(cb);
    };
  }

  // Swap in a refreshed access token for the next (re)connect attempt.
  setToken(token: string): void {
    this.token = token;
  }

  // Drop the connection while the app is in the background, keeping the
  // socket object and its listeners so resume() can bring it straight back.
  // While a socket is open the server treats the user as ONLINE and skips
  // push notifications — so an app sitting in the background with a still-
  // open socket never gets notified of new messages.
  pause(): void {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }
    this.socket?.disconnect();
  }

  resume(): void {
    if (this.socket && !this.socket.connected) this.socket.connect();
  }

  disconnect(): void {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }
    this.socket?.disconnect();
    this.socket = null;
    this.token = null;
    this.notifyStatus();
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  emit(event: string, data?: unknown): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    }
  }

  // Emit and wait for the server's acknowledgement. Rejects if the socket
  // isn't connected or no ack arrives within `timeoutMs` (a dropped
  // connection mid-send looks exactly like that). Unlike emit(), a failure is
  // never silent — the offline outbox depends on that.
  emitWithAck<T = any>(
    event: string,
    data: unknown,
    timeoutMs = 20000
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error("Socket not connected"));
        return;
      }
      this.socket
        .timeout(timeoutMs)
        .emit(event, data, (err: Error | null, response: T) =>
          err ? reject(err) : resolve(response)
        );
    });
  }

  on(event: string, callback: (...args: unknown[]) => void): void {
    this.socket?.on(event, callback);
  }

  off(event: string, callback?: (...args: unknown[]) => void): void {
    this.socket?.off(event, callback);
  }

  once(event: string, callback: (...args: unknown[]) => void): void {
    this.socket?.once(event, callback);
  }

  joinChat(chatId: string): void {
    this.emit("chat:join", chatId);
  }

  leaveChat(chatId: string): void {
    this.emit("chat:leave", chatId);
  }

  sendMessage(data: {
    chatId: string;
    content: string;
    type?: string;
    mediaUrl?: string;
    replyTo?: string;
    tempId?: string;
  }): void {
    this.emit("message:send", data);
  }

  // startTyping(chatId: string): void {
  //   this.emit("typing:start", chatId);
  // }

  // stopTyping(chatId: string): void {
  //   this.emit("typing:stop", chatId);
  // }

  markRead(chatId: string): void {
    this.emit("message:read", { chatId });
  }

  // initiateCall(data: {
  //   callerAvatar?: string;
  //   callerName?: string;
  //   recipientId?: string;
  //   callId: string;
  //   type: "audio" | "video";
  //   chatId?: string;
  // }): void {
  //   this.emit("call:initiate", data);
  // }

  // acceptCall(callId: string, callerId: string): void {
  //   this.emit("call:accept", { callId, callerId });
  // }

  // rejectCall(callId: string, callerId: string): void {
  //   this.emit("call:reject", { callId, callerId });
  // }

  // endCall(
  //   callId: string,
  //   participants: string[],
  //   type: "audio" | "video" = "audio",
  //   status: string = "completed"
  // ): void {
  //   this.emit("call:end", { callId, participants, type, status });
  // }

  // leaveCall(callId: string): void {
  //   this.emit("call:leave", { callId });
  // }
  initiateCall(data: {
    chatId: string;
    callId: string;
    type: "audio" | "video";
  }): void {
    this.emit("call:initiate", data);
  }

  acceptCall(callId: string, callerId: string): void {
    this.emit("call:accept", { callId, callerId });
  }

  rejectCall(callId: string, callerId: string): void {
    this.emit("call:reject", { callId, callerId });
  }

  // Leaving a call you'd already joined. Used for group calls so leaving
  // only removes you, instead of disconnecting everyone else the way
  // endCall would.
  leaveCall(callId: string): void {
    this.emit("call:leave", { callId });
  }

  endCall(
    callId: string,
    participants: string[],
    type: "audio" | "video" = "audio",
    status: string = "completed"
  ): void {
    this.emit("call:end", { callId, participants, type, status });
  }
}

export const socketService = new SocketService();
