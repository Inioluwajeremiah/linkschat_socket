import { useEffect } from "react";
import { useAppDispatch } from "./useRedux";
import { fetchStatuses } from "../store/slices/statusSlice";
import { socketService } from "../services/socket";

export function useStatusUpdates() {
  const dispatch = useAppDispatch();

  //   useEffect(() => {
  //     dispatch(fetchStatuses());

  //     const socket = socketService.getSocket();
  //     if (!socket) return;

  //     const onNewStatus = () => {
  //       // We don't need the payload shape here — just refetch the grouped,
  //       // populated, "viewed" derived structure from the server so every
  //       // consumer (StatusRow, StatusScreen, viewer) stays consistent.
  //       dispatch(fetchStatuses());
  //     };

  //     socket.on("status:new", onNewStatus);
  //     return () => {
  //       socket.off("status:new", onNewStatus);
  //     };
  //   }, [dispatch]);

  useEffect(() => {
    dispatch(fetchStatuses());

    const socket = socketService.getSocket();
    if (!socket) return;

    const onNewStatus = () => dispatch(fetchStatuses());
    const onReconnect = () => dispatch(fetchStatuses()); // catch anything missed while disconnected

    socket.on("status:new", onNewStatus);
    socket.on("connect", onReconnect);
    return () => {
      socket.off("status:new", onNewStatus);
      socket.off("connect", onReconnect);
    };
  }, [dispatch]);
}
