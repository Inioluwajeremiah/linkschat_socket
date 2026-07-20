import { useEffect } from "react";
import { useAppDispatch } from "./useRedux";
import { fetchReels, prependReel } from "../store/slices/reelSlice";
import { socketService } from "../services/socket";

export function useReelUpdates() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchReels({}));

    const socket = socketService.getSocket();
    if (!socket) return;

    const onNewReel = (reel: any) => {
      dispatch(prependReel(reel));
    };

    socket.on("reel:new", onNewReel);
    return () => {
      socket.off("reel:new", onNewReel);
    };
  }, [dispatch]);
}
