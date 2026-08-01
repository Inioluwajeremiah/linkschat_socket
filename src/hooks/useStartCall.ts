import { useState } from "react";
import { useRouter } from "expo-router";
import { useAppDispatch } from "./useRedux";
import { chatApi } from "../services/api";
import { addOrUpdateChat } from "../store/slices/chatSlice";
import { useToast } from "../context/ToastContext";

// Centralizes the "get/create the private chat, then navigate to
// /call/[chatId]" sequence CallScreen actually needs. This exists because
// the same bug (passing a raw userId where CallScreen expects a chatId,
// silently no-op'ing the call) showed up independently in both
// ProfileViewScreen and StatusViewScreen — any new call button anywhere
// else in the app should use this hook instead of re-deriving the logic.
export function useStartCall() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const toast = useToast();
  const [callLoading, setCallLoading] = useState<"audio" | "video" | null>(
    null
  );

  const startCall = async (userId: string, type: "audio" | "video") => {
    if (callLoading) return; // guard against double-taps while set up runs
    setCallLoading(type);
    try {
      const res = await chatApi.createPrivateChat(userId);
      if (res.success) {
        dispatch(addOrUpdateChat(res.data.chat));
        router.push(`/call/${res.data.chat._id}?type=${type}`);
      } else {
        toast.error("Failed to start call");
      }
    } catch {
      toast.error("Failed to start call");
    } finally {
      setCallLoading(null);
    }
  };

  return { startCall, callLoading };
}
