// import { useEffect, useRef } from "react";
// import { useRouter } from "expo-router";
// import { socketService } from "../services/socket";
// import { useAppDispatch, useAppSelector } from "./useRedux";
// import { addMessage, setUserActivity } from "../store/slices/chatSlice";
// import {
//   setConnected,
//   setOnlineUsers,
//   addOnlineUser,
//   removeOnlineUser,
// } from "../store/slices/socketSlice";
// import { setIncomingCall, clearCall } from "../store/slices/callSlice";
// import { Message } from "../types";
// import { useToast } from "../context/ToastContext";
// import * as Notifications from "expo-notifications";
// import * as Haptics from "expo-haptics";
// import { addBlocked, removeBlocked } from "@/store/slices/blockedUserSlice";
// import {
//   setOngoingCall,
//   clearOngoingCall,
// } from "@/store/slices/ongoingCallsSlice";

// export const useSocket = () => {
//   const dispatch = useAppDispatch();
//   const router = useRouter();
//   const toast = useToast();
//   const { accessToken, isAuthenticated } = useAppSelector((s) => s.auth);
//   const initializedRef = useRef(false);

//   // Read fresh on every call:incoming via a ref so the socket listener
//   // (registered once) always sees the current blocked list without
//   // needing to be re-registered every time it changes.
//   const blockedIdsRef = useRef<string[]>([]);
//   const blockedIds = useAppSelector((s) => s.blocked.blockedIds);
//   useEffect(() => {
//     blockedIdsRef.current = blockedIds;
//   }, [blockedIds]);

//   useEffect(() => {
//     if (!isAuthenticated || !accessToken) return;
//     if (initializedRef.current) return;
//     initializedRef.current = true;

//     const socket = socketService.connect(accessToken);

//     socket.on("connect", () => {
//       dispatch(setConnected(true));
//       toast.success("Connected", "You are online");
//     });

//     socket.on("disconnect", () => {
//       dispatch(setConnected(false));
//       initializedRef.current = false;
//     });

//     socket.on("users:online", (userIds: string[]) => {
//       dispatch(setOnlineUsers(userIds));
//     });

//     socket.on("user:online", ({ userId }: { userId: string }) => {
//       dispatch(addOnlineUser(userId));
//     });

//     socket.on("user:offline", ({ userId }: { userId: string }) => {
//       dispatch(removeOnlineUser(userId));
//     });

//     socket.on("message:new", (message: Message) => {
//       dispatch(addMessage({ chatId: message.chatId, message }));
//     });

//     socket.on("user:blocked", ({ userId }: { userId: string }) => {
//       console.log("blocked userId ====>>> ", userId);

//       dispatch(addBlocked(userId));
//     });
//     socket.on("user:unblocked", ({ userId }: { userId: string }) => {
//       dispatch(removeBlocked(userId));
//     });

//     // Fired when a group call starts, when someone joins an already
//     // in-progress group call (to keep the "N in this call" count fresh
//     // for everyone else), and as a catch-up when this device opens a
//     // group chat that already has an active call going. Drives the
//     // OngoingCallBanner shown inside a group chat screen.
//     socket.on(
//       "call:ongoing",
//       (data: {
//         chatId: string;
//         callId: string;
//         type: "audio" | "video";
//         joinedCount: number;
//       }) => {
//         dispatch(
//           setOngoingCall({
//             chatId: data.chatId,
//             call: {
//               callId: data.callId,
//               type: data.type,
//               joinedCount: data.joinedCount,
//             },
//           })
//         );
//       }
//     );

//     socket.on(
//       "activity:start",
//       (data: {
//         userId: string;
//         chatId: string;
//         name: string;
//         avatar?: string;
//         status: "typing" | "recording" | "uploading";
//       }) => {
//         dispatch(setUserActivity({ ...data, active: true }));
//       }
//     );

//     socket.on(
//       "activity:stop",
//       (data: {
//         userId: string;
//         chatId: string;
//         status: "typing" | "recording" | "uploading";
//       }) => {
//         dispatch(setUserActivity({ ...data, name: "", active: false }));
//       }
//     );

//     // ── GLOBAL incoming call handler ─────────────────────────────────────────
//     socket.on(
//       "call:incoming",
//       async (data: {
//         callId: string;
//         type: "audio" | "video";
//         callerId: string;
//         callerName: string;
//         callerPhone: number;
//         callerAvatar?: string;
//         chatId?: string;
//         // Sent by the backend when call:initiate was placed on a group
//         // chat — the server derives these from the Chat doc itself, so
//         // they're only present for group calls.
//         isGroup?: boolean;
//         groupName?: string;
//         groupAvatar?: string;
//       }) => {
//         // Blocked callers get nothing — no ring, no vibration, no
//         // notification, no navigation. WhatsApp doesn't tell a blocked
//         // user they were blocked; the call just never seems to connect
//         // on their end. This check has to live here, at the single
//         // global entry point for all incoming calls, rather than in
//         // IncomingCallScreen — by the time that screen would mount, the
//         // ringtone/haptics/notification would have already fired.
//         if (blockedIdsRef.current.includes(data.callerId)) {
//           return;
//         }
//         // 1. Store in Redux
//         dispatch(setIncomingCall(data));

//         // 2. Vibrate to wake screen and alert user
//         try {
//           await Haptics.notificationAsync(
//             Haptics.NotificationFeedbackType.Warning
//           );
//         } catch {}

//         // 3. Post a full-screen high-priority notification to wake a locked screen
//         //    on Android. On iOS, PushKit/VoIP (from the push notification) handles this.
//         try {
//           await Notifications.scheduleNotificationAsync({
//             content: {
//               title: `${
//                 data.type === "video"
//                   ? "📹 Incoming Video Call"
//                   : "📞 Incoming Voice Call"
//               }`,
//               body: data.isGroup
//                 ? `${data.callerName} is calling in ${
//                     data.groupName || "a group"
//                   }`
//                 : `${data.callerName} is calling you`,
//               data: { type: "incoming_call", callId: data.callId },
//               priority: Notifications.AndroidNotificationPriority.MAX,
//               vibrate: [0, 500, 200, 500],
//               sound: true,
//             },
//             trigger: null,
//           });
//         } catch {}

//         // 4. Navigate from anywhere in the app
//         router.push("/call/incoming");
//       }
//     );

//     socket.on(
//       "call:ended",
//       ({ callId, chatId }: { callId: string; chatId?: string }) => {
//         dispatch(clearCall());
//         // chatId is only present now that socketService.ts's call:leave/
//         // call:end broadcasts include it — clears the "call in progress"
//         // banner for that specific chat.
//         if (chatId) dispatch(clearOngoingCall({ chatId }));
//       }
//     );

//     return () => {
//       // Keep socket alive — only disconnect on logout
//     };
//   }, [isAuthenticated, accessToken]);

//   return socketService;
// };

import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import { useRouter } from "expo-router";
import { socketService } from "../services/socket";
import { chatApi } from "../services/api";
import { useAppDispatch, useAppSelector } from "./useRedux";
import {
  addMessage,
  setChats,
  setUserActivity,
} from "../store/slices/chatSlice";
import {
  setConnected,
  setOnlineUsers,
  addOnlineUser,
  removeOnlineUser,
  setLastSeen,
} from "../store/slices/socketSlice";
import { setIncomingCall, clearCall } from "../store/slices/callSlice";
import { Message, User } from "../types";
import { store } from "../store";
import { useToast } from "../context/ToastContext";
import * as Notifications from "expo-notifications";
import * as Haptics from "expo-haptics";
import { addBlocked, removeBlocked } from "@/store/slices/blockedUserSlice";
import {
  setOngoingCall,
  clearOngoingCall,
} from "@/store/slices/ongoingCallsSlice";
import { useContactNameResolver } from "@/hooks/useContactName";

// The server only pushes a message to users with no open socket, and the
// socket stays open for a grace period after the app is backgrounded (see
// the pause logic below). A message arriving in that window would otherwise
// show nothing — calls already post a local notification here, so do the
// same for messages.
function notifyIfBackgrounded(message: Message) {
  // Call-log entries have their own missed-call handling.
  if (AppState.currentState === "active" || message.type === "call") return;

  const state = store.getState();
  const myId = state.auth.user?._id;
  const sender = message.sender as User | string;
  const senderId = typeof sender === "string" ? sender : sender?._id;
  if (!myId || senderId === myId) return;

  const chat = state.chat.chats.find((c) => c._id === message.chatId);
  const senderUser = chat?.participants.find(
    (p) => p.user._id === senderId
  )?.user;
  const senderName =
    typeof sender === "string" ? senderUser?.name : sender?.name;
  const phone = senderUser?.phone;
  const normalized = phone ? phone.replace(/\D/g, "").slice(-9) : "";
  const displayName =
    (normalized && state.contacts.phoneToName[normalized]) ||
    senderName ||
    "New message";

  const preview =
    message.type === "text"
      ? message.content
      : message.type === "image"
      ? "📷 Photo"
      : message.type === "video"
      ? "🎥 Video"
      : message.type === "document"
      ? `📄 ${message.mediaName || "Document"}`
      : message.type === "gif"
      ? "GIF"
      : message.type === "sticker"
      ? "Sticker"
      : message.type === "location"
      ? "📍 Location"
      : "🎵 Voice message";

  const isGroup = chat?.type === "group";
  Notifications.scheduleNotificationAsync({
    content: {
      title: `💬 ${isGroup ? chat?.name || "Group" : displayName}`,
      body: isGroup ? `${displayName}: ${preview}` : preview,
      data: { type: "new_message", chatId: message.chatId },
      sound: true,
    },
    trigger: null,
  }).catch(() => {});
}

// Several messages for a new chat can arrive together — fetch once.
let chatsRefreshTimer: ReturnType<typeof setTimeout> | null = null;
function refreshChatsSoon() {
  if (chatsRefreshTimer) return;
  chatsRefreshTimer = setTimeout(async () => {
    chatsRefreshTimer = null;
    try {
      const res = await chatApi.getChats();
      if (res.success) store.dispatch(setChats(res.data.chats));
    } catch {}
  }, 300);
}

export const useSocket = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const toast = useToast();
  const resolveContact = useContactNameResolver();
  const { accessToken, isAuthenticated } = useAppSelector((s) => s.auth);

  // Read fresh on every call:incoming via a ref so the socket listener
  // (registered once) always sees the current blocked list without
  // needing to be re-registered every time it changes.
  const blockedIdsRef = useRef<string[]>([]);
  const blockedIds = useAppSelector((s) => s.blocked.blockedIds);
  useEffect(() => {
    blockedIdsRef.current = blockedIds;
  }, [blockedIds]);

  // While backgrounded the socket is dropped (after a short grace period) so
  // the server sees us as offline and sends push notifications — an idle
  // background socket kept the user "online" and silently suppressed them.
  // Kept open during a call, whose signalling rides on it.
  const inCallRef = useRef(false);
  const inCall = useAppSelector((s) => !!s.myCall.active);
  useEffect(() => {
    inCallRef.current = inCall;
  }, [inCall]);

  useEffect(() => {
    if (!isAuthenticated) return;

    let pauseTimer: ReturnType<typeof setTimeout> | undefined;
    const sub = AppState.addEventListener("change", (state) => {
      clearTimeout(pauseTimer);
      if (state === "active") {
        socketService.resume();
      } else if (state === "background") {
        pauseTimer = setTimeout(() => {
          if (!inCallRef.current) socketService.pause();
        }, 10_000);
      }
    });
    return () => {
      clearTimeout(pauseTimer);
      sub.remove();
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) return;

    // Listeners are attached once per socket. If one already exists (the
    // token changed after a refresh, or we're resuming), just hand it the
    // current token and make sure it's connected — rebuilding would stack
    // duplicate listeners on the same socket.
    if (socketService.getSocket()) {
      socketService.setToken(accessToken);
      socketService.resume();
      return;
    }

    const socket = socketService.connect(accessToken);

    let hasConnectedBefore = false;
    socket.on("connect", () => {
      dispatch(setConnected(true));
      // Anything that arrived while we were offline or backgrounded was only
      // delivered as a push notification — pull the chat list again so the
      // UI catches up instead of waiting for the next app launch.
      if (hasConnectedBefore) {
        chatApi
          .getChats()
          .then((res) => {
            if (res.success) dispatch(setChats(res.data.chats));
          })
          .catch(() => {});
      }
      hasConnectedBefore = true;
    });

    socket.on("disconnect", () => {
      dispatch(setConnected(false));
    });

    socket.on("users:online", (userIds: string[]) => {
      dispatch(setOnlineUsers(userIds));
    });

    socket.on("user:online", ({ userId }: { userId: string }) => {
      dispatch(addOnlineUser(userId));
    });

    socket.on(
      "user:offline",
      ({ userId, lastSeen }: { userId: string; lastSeen?: string | null }) => {
        dispatch(removeOnlineUser(userId));
        dispatch(setLastSeen({ userId, lastSeen: lastSeen ?? null }));
      }
    );

    socket.on("message:new", (message: Message) => {
      // First message of a chat someone else just started: we don't have
      // that chat yet, so it wouldn't show in the list — fetch it.
      const isNewChat = !store
        .getState()
        .chat.chats.some((c) => c._id === message.chatId);
      dispatch(addMessage({ chatId: message.chatId, message }));
      notifyIfBackgrounded(message);
      if (isNewChat) refreshChatsSoon();
    });

    socket.on("user:blocked", ({ userId }: { userId: string }) => {
      console.log("blocked userId ====>>> ", userId);

      dispatch(addBlocked(userId));
    });
    socket.on("user:unblocked", ({ userId }: { userId: string }) => {
      dispatch(removeBlocked(userId));
    });

    // Fired when a group call starts, when someone joins an already
    // in-progress group call (to keep the "N in this call" count fresh
    // for everyone else), and as a catch-up when this device opens a
    // group chat that already has an active call going. Drives the
    // OngoingCallBanner shown inside a group chat screen.
    socket.on(
      "call:ongoing",
      (data: {
        chatId: string;
        callId: string;
        type: "audio" | "video";
        joinedCount: number;
      }) => {
        dispatch(
          setOngoingCall({
            chatId: data.chatId,
            call: {
              callId: data.callId,
              type: data.type,
              joinedCount: data.joinedCount,
            },
          })
        );
      }
    );

    socket.on(
      "activity:start",
      (data: {
        userId: string;
        chatId: string;
        name: string;
        avatar?: string;
        status: "typing" | "recording" | "uploading";
      }) => {
        dispatch(setUserActivity({ ...data, active: true }));
      }
    );

    socket.on(
      "activity:stop",
      (data: {
        userId: string;
        chatId: string;
        status: "typing" | "recording" | "uploading";
      }) => {
        dispatch(setUserActivity({ ...data, name: "", active: false }));
      }
    );

    // ── GLOBAL incoming call handler ─────────────────────────────────────────
    socket.on(
      "call:incoming",
      async (data: {
        callId: string;
        type: "audio" | "video";
        callerId: string;
        callerName: string;
        callerPhone: number;
        callerAvatar?: string;
        chatId?: string;
        // Sent by the backend when call:initiate was placed on a group
        // chat — the server derives these from the Chat doc itself, so
        // they're only present for group calls.
        isGroup?: boolean;
        groupName?: string;
        groupAvatar?: string;
      }) => {
        // Blocked callers get nothing — no ring, no vibration, no
        // notification, no navigation. WhatsApp doesn't tell a blocked
        // user they were blocked; the call just never seems to connect
        // on their end. This check has to live here, at the single
        // global entry point for all incoming calls, rather than in
        // IncomingCallScreen — by the time that screen would mount, the
        // ringtone/haptics/notification would have already fired.
        if (blockedIdsRef.current.includes(data.callerId)) {
          return;
        }
        // 1. Store in Redux
        dispatch(setIncomingCall(data));

        // 2. Vibrate to wake screen and alert user
        try {
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Warning
          );
        } catch {}

        // 3. Post a full-screen high-priority notification to wake a locked screen
        //    on Android. On iOS, PushKit/VoIP (from the push notification) handles this.
        try {
          const { displayName: callerDisplayName } = resolveContact(
            data.callerPhone?.toString(),
            data.callerName
          );

          await Notifications.scheduleNotificationAsync({
            content: {
              title: `${
                data.type === "video"
                  ? "📹 Incoming Video Call"
                  : "📞 Incoming Voice Call"
              }`,
              body: data.isGroup
                ? `${callerDisplayName} is calling in ${
                    data.groupName || "a group"
                  }`
                : `${callerDisplayName} is calling you`,
              data: { type: "incoming_call", callId: data.callId },
              priority: Notifications.AndroidNotificationPriority.MAX,
              vibrate: [0, 500, 200, 500],
              sound: true,
            },
            trigger: null,
          });
        } catch {}

        // 4. Navigate from anywhere in the app
        router.push("/call/incoming");
      }
    );

    socket.on(
      "call:ended",
      ({ callId, chatId }: { callId: string; chatId?: string }) => {
        dispatch(clearCall());
        // chatId is only present now that socketService.ts's call:leave/
        // call:end broadcasts include it — clears the "call in progress"
        // banner for that specific chat.
        if (chatId) dispatch(clearOngoingCall({ chatId }));
      }
    );

    return () => {
      // Keep socket alive — only disconnect on logout
    };
  }, [isAuthenticated, accessToken]);

  return socketService;
};
