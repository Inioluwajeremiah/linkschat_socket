// import { APIEndPoints } from "@/constants/ApiEndpoints";
// import { io } from "socket.io-client";

// let socket = null;

// export const initSocket = (userId) => {
//   if (socket) {
//     socket.disconnect();
//     socket = null;
//   }

//   socket = io(APIEndPoints.BASE_URL, {
//     transports: ["websocket"],
//     reconnection: true,
//     timeout: 10000,
//     auth: { userId }, // pass userId if needed
//   });

//   return socket;
// };

// export const getSocket = () => socket;

// export const cleanupSocket = () => {
//   if (socket) {
//     socket.off();
//     socket.disconnect();
//     socket = null;
//   }
// };
