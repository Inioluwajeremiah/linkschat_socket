// socket.js
import { io } from "socket.io-client";

// Replace with your local IP or deployed server
const socket = io("http://localhost:3000", {
  transports: ["websocket"],
  forceNew: true,
  reconnectionAttempts: 5,
  timeout: 10000,
});

export default socket;
