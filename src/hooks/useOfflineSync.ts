import { useEffect } from "react";
import { useAppSelector } from "./useRedux";
import { startOfflineSync } from "../services/offline";

// Starts offline reading + the send queue for the signed-in account.
export function useOfflineSync() {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const userId = useAppSelector((s) => s.auth.user?._id);

  useEffect(() => {
    if (!isAuthenticated || !userId) return;
    void startOfflineSync();
  }, [isAuthenticated, userId]);
}
