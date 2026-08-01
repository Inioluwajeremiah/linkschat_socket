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

  connect(token: string): Socket {
    if (this.socket?.connected && this.token === token) {
      return this.socket;
    }

    if (this.socket) {
      this.socket.disconnect();
    }

    this.token = token;
    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    this.socket.on("connect", () => {
      // console.log("✅ Socket connected:", this.socket?.id);
    });

    this.socket.on("disconnect", (reason) => {
      // console.log("❌ Socket disconnected:", reason);
    });

    this.socket.on("connect_error", (error) => {
      // console.error("Socket connection error:", error.message);
    });

    return this.socket;
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
    this.token = null;
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
