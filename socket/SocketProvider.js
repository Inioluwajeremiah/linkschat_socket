import React, { createContext, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { APIEndPoints } from "../utils/ApiEndpoints";

export const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);

  const { userData } = useSelector((state) => state.auth);
  const userId = JSON.parse(userData)?.userId;

  useEffect(() => {
    if (!userId) return;

    // prevent duplicate socket
    if (socketRef.current) return;

    const ws = new WebSocket(APIEndPoints.SOCKET_URL);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log("🟢 Socket connected");

      ws.send(
        JSON.stringify({
          type: "REGISTER",
          userId,
        })
      );
    };

    ws.onmessage = (event) => {
      // GLOBAL handler (optional)
      console.log("Socket message:", event.data);
    };

    ws.onerror = (err) => {
      console.error("Socket error:", err);
    };

    ws.onclose = () => {
      console.log("🔴 Socket closed");
      socketRef.current = null;
    };

    return () => {
      ws.close();
      socketRef.current = null;
    };
  }, [userId]);

  return (
    <SocketContext.Provider value={socketRef}>
      {children}
    </SocketContext.Provider>
  );
};
