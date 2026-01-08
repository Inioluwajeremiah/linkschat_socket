import { useContext } from "react";
import { SocketContext } from "./SocketProvider";

export const useSocket = () => {
  const socketRef = useContext(SocketContext);

  const sendMessage = (message) => {
    if (socketRef?.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    }
  };

  const joinChat = (chatId) => {
    if (socketRef?.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          type: "JOIN_CHAT",
          chatId,
        })
      );
    }
  };

  return {
    socket: socketRef?.current,
    sendMessage,
    joinChat,
  };
};
