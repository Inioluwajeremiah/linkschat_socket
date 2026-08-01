import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "./useRedux";
import { fetchBlockedUsers } from "@/store/slices/blockedUserSlice";

export function useBlockedUsers() {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((s) => s.auth);

  useEffect(() => {
    if (!isAuthenticated) return;
    dispatch(fetchBlockedUsers());
  }, [isAuthenticated]);
}
