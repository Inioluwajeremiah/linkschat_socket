import { useEffect, useRef } from "react";
import { useRouter } from "expo-router";
import { socketService } from "../services/socket";
import { useAppDispatch, useAppSelector } from "./useRedux";
import { addMessage, setUserActivity } from "../store/slices/chatSlice";
import {
  setConnected,
  setOnlineUsers,
  addOnlineUser,
  removeOnlineUser,
} from "../store/slices/socketSlice";
import { setIncomingCall, clearCall } from "../store/slices/callSlice";
import { Message } from "../types";
import { useToast } from "../context/ToastContext";
import * as Notifications from "expo-notifications";
import * as Haptics from "expo-haptics";

export const useSocket = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const toast = useToast();
  const { accessToken, isAuthenticated } = useAppSelector((s) => s.auth);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) return;
    if (initializedRef.current) return;
    initializedRef.current = true;

    const socket = socketService.connect(accessToken);

    socket.on("connect", () => {
      dispatch(setConnected(true));
      toast.success("Connected", "You are online");
    });

    socket.on("disconnect", () => {
      dispatch(setConnected(false));
      initializedRef.current = false;
    });

    socket.on("users:online", (userIds: string[]) => {
      dispatch(setOnlineUsers(userIds));
    });

    socket.on("user:online", ({ userId }: { userId: string }) => {
      dispatch(addOnlineUser(userId));
    });

    socket.on("user:offline", ({ userId }: { userId: string }) => {
      dispatch(removeOnlineUser(userId));
    });

    socket.on("message:new", (message: Message) => {
      dispatch(addMessage({ chatId: message.chatId, message }));
    });

    // socket.on(
    //   "typing:start",
    //   ({ userId, chatId }: { userId: string; chatId: string }) => {
    //     dispatch(setTypingUser({ chatId, userId, isTyping: true }));
    //   }
    // );

    // socket.on(
    //   "typing:stop",
    //   ({ userId, chatId }: { userId: string; chatId: string }) => {
    //     dispatch(setTypingUser({ chatId, userId, isTyping: false }));
    //   }
    // );

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
        callerAvatar?: string;
        chatId?: string;
      }) => {
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
          await Notifications.scheduleNotificationAsync({
            content: {
              title: `${
                data.type === "video"
                  ? "📹 Incoming Video Call"
                  : "📞 Incoming Voice Call"
              }`,
              body: `${data.callerName} is calling you`,
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

    socket.on("call:ended", ({ callId }: { callId: string }) => {
      dispatch(clearCall());
    });

    return () => {
      // Keep socket alive — only disconnect on logout
    };
  }, [isAuthenticated, accessToken]);

  return socketService;
};
