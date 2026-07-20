// import { createSlice, PayloadAction } from "@reduxjs/toolkit";
// import { Chat, ChatState, Message } from "../../types";

// const initialState: ChatState = {
//   chats: [],
//   activeChat: null,
//   messages: {},
//   typingUsers: {},
//   isLoading: false,
// };

// const chatSlice = createSlice({
//   name: "chat",
//   initialState,
//   reducers: {
//     setChats: (state, action: PayloadAction<Chat[]>) => {
//       state.chats = action.payload;
//     },
//     addOrUpdateChat: (state, action: PayloadAction<Chat>) => {
//       const idx = state.chats.findIndex((c) => c._id === action.payload._id);
//       if (idx !== -1) {
//         state.chats[idx] = action.payload;
//       } else {
//         state.chats.unshift(action.payload);
//       }
//     },
//     setActiveChat: (state, action: PayloadAction<Chat | null>) => {
//       state.activeChat = action.payload;
//     },
//     setMessages: (
//       state,
//       action: PayloadAction<{ chatId: string; messages: Message[] }>
//     ) => {
//       state.messages[action.payload.chatId] = action.payload.messages;
//     },
//     prependMessages: (
//       state,
//       action: PayloadAction<{ chatId: string; messages: Message[] }>
//     ) => {
//       const existing = state.messages[action.payload.chatId] || [];
//       state.messages[action.payload.chatId] = [
//         ...action.payload.messages,
//         ...existing,
//       ];
//     },
//     addMessage: (
//       state,
//       action: PayloadAction<{ chatId: string; message: Message }>
//     ) => {
//       const { chatId, message } = action.payload;
//       if (!state.messages[chatId]) {
//         state.messages[chatId] = [];
//       }

//       // Replace optimistic message if tempId matches
//       const tempIdx = state.messages[chatId].findIndex(
//         (m) => m.tempId && message.tempId && m.tempId === message.tempId
//       );

//       if (tempIdx !== -1) {
//         state.messages[chatId][tempIdx] = message;
//       } else {
//         const exists = state.messages[chatId].some(
//           (m) => m._id === message._id
//         );
//         if (!exists) {
//           state.messages[chatId].push(message);
//         }
//       }

//       // Update chat's last message
//       const chatIdx = state.chats.findIndex((c) => c._id === chatId);
//       if (chatIdx !== -1) {
//         state.chats[chatIdx].lastMessage = message;
//         state.chats[chatIdx].lastMessageAt = message.createdAt;
//         // Move to top
//         const updatedChat = state.chats.splice(chatIdx, 1)[0];
//         state.chats.unshift(updatedChat);
//       }
//     },
//     updateMessage: (
//       state,
//       action: PayloadAction<{
//         chatId: string;
//         message: Message;
//         messageId: string;
//         changes: Partial<Message>;
//       }>
//     ) => {
//       const { chatId, message } = action.payload;
//       const messages = state.messages[chatId];
//       if (messages) {
//         const idx = messages.findIndex((m) => m._id === message._id);
//         if (idx !== -1) {
//           messages[idx] = message;
//         }
//       }
//     },
//     removeMessage: (
//       state,
//       action: PayloadAction<{ chatId: string; messageId: string }>
//     ) => {
//       const { chatId, messageId } = action.payload;
//       if (state.messages[chatId]) {
//         state.messages[chatId] = state.messages[chatId].filter(
//           (m) => m._id !== messageId
//         );
//       }
//     },
//     setTypingUser: (
//       state,
//       action: PayloadAction<{
//         chatId: string;
//         userId: string;
//         isTyping: boolean;
//       }>
//     ) => {
//       const { chatId, userId, isTyping } = action.payload;
//       if (!state.typingUsers[chatId]) {
//         state.typingUsers[chatId] = [];
//       }
//       if (isTyping) {
//         if (!state.typingUsers[chatId].includes(userId)) {
//           state.typingUsers[chatId].push(userId);
//         }
//       } else {
//         state.typingUsers[chatId] = state.typingUsers[chatId].filter(
//           (id) => id !== userId
//         );
//       }
//     },
//     updateUnreadCount: (
//       state,
//       action: PayloadAction<{ chatId: string; count: number }>
//     ) => {
//       const chatIdx = state.chats.findIndex(
//         (c) => c._id === action.payload.chatId
//       );
//       if (chatIdx !== -1) {
//         state.chats[chatIdx].unreadCount = action.payload.count;
//       }
//     },
//     clearUnread: (state, action: PayloadAction<Chat>) => {
//       const chat = action.payload;
//       state.activeChat = action.payload;
//       const idx = state.chats.findIndex((c: Chat) => c._id === chat._id);
//       if (idx !== -1)
//         state.chats[idx] = { ...state.chats[idx], unreadCount: 0 };
//     },
//     setLoading: (state, action: PayloadAction<boolean>) => {
//       state.isLoading = action.payload;
//     },
//   },
// });

// export const {
//   setChats,
//   addOrUpdateChat,
//   setActiveChat,
//   setMessages,
//   prependMessages,
//   addMessage,
//   updateMessage,
//   removeMessage,
//   clearUnread,
//   setTypingUser,
//   updateUnreadCount,
//   setLoading,
// } = chatSlice.actions;
// export default chatSlice.reducer;

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ActivityStatus, Chat, ChatState, Message } from "../../types";

const initialState: ChatState = {
  chats: [],
  activeChat: null,
  messages: {},
  // typingUsers: {},
  activityUsers: {},
  isLoading: false,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setChats: (state, action: PayloadAction<Chat[]>) => {
      state.chats = action.payload;
    },
    addOrUpdateChat: (state, action: PayloadAction<Chat>) => {
      const idx = state.chats.findIndex((c) => c._id === action.payload._id);
      if (idx !== -1) {
        state.chats[idx] = action.payload;
      } else {
        state.chats.unshift(action.payload);
      }
    },
    setActiveChat: (state, action: PayloadAction<Chat | null>) => {
      state.activeChat = action.payload;
    },
    setMessages: (
      state,
      action: PayloadAction<{ chatId: string; messages: Message[] }>
    ) => {
      state.messages[action.payload.chatId] = action.payload.messages;
    },
    prependMessages: (
      state,
      action: PayloadAction<{ chatId: string; messages: Message[] }>
    ) => {
      const existing = state.messages[action.payload.chatId] || [];
      state.messages[action.payload.chatId] = [
        ...action.payload.messages,
        ...existing,
      ];
    },
    addMessage: (
      state,
      action: PayloadAction<{ chatId: string; message: Message }>
    ) => {
      const { chatId, message } = action.payload;
      if (!state.messages[chatId]) {
        state.messages[chatId] = [];
      }

      // Replace optimistic message if tempId matches
      const tempIdx = state.messages[chatId].findIndex(
        (m) => m.tempId && message.tempId && m.tempId === message.tempId
      );

      if (tempIdx !== -1) {
        state.messages[chatId][tempIdx] = message;
      } else {
        const exists = state.messages[chatId].some(
          (m) => m._id === message._id
        );
        if (!exists) {
          state.messages[chatId].push(message);
        }
      }

      // Update chat's last message
      const chatIdx = state.chats.findIndex((c) => c._id === chatId);
      if (chatIdx !== -1) {
        state.chats[chatIdx].lastMessage = message;
        state.chats[chatIdx].lastMessageAt = message.createdAt;
        // Move to top
        const updatedChat = state.chats.splice(chatIdx, 1)[0];
        state.chats.unshift(updatedChat);
      }
    },
    // updateMessage: (
    //   state,
    //   action: PayloadAction<{
    //     chatId: string;
    //     message: Message;
    //     messageId: string;
    //     changes: Partial<Message>;
    //   }>
    // ) => {
    //   const { chatId, message } = action.payload;
    //   const messages = state.messages[chatId];
    //   if (messages) {
    //     const idx = messages.findIndex((m) => m._id === message?._id);
    //     if (idx !== -1) {
    //       messages[idx] = message;
    //     }
    //   }
    // },
    updateMessage: (
      state,
      action: PayloadAction<{
        chatId: string;
        messageId: string;
        message?: Message;
        changes?: Partial<Message>;
      }>
    ) => {
      const { chatId, messageId, message, changes } = action.payload;
      const messages = state.messages[chatId];
      if (!messages) return;

      const idx = messages.findIndex((m) => m._id === messageId);
      if (idx === -1) return;

      if (message) {
        // Full replacement (e.g. edit/react events that send back the whole doc)
        messages[idx] = message;
      } else if (changes) {
        // Partial patch (e.g. delete, or any event that only sends what changed)
        messages[idx] = { ...messages[idx], ...changes };
      }
    },
    removeMessage: (
      state,
      action: PayloadAction<{ chatId: string; messageId: string }>
    ) => {
      const { chatId, messageId } = action.payload;
      if (state.messages[chatId]) {
        state.messages[chatId] = state.messages[chatId].filter(
          (m) => m._id !== messageId
        );
      }
    },
    // chatSlice.ts
    setUserActivity: (
      state,
      action: PayloadAction<{
        chatId: string;
        userId: string;
        name: string;
        avatar?: string;
        status: ActivityStatus;
        active: boolean;
      }>
    ) => {
      const { chatId, userId, name, avatar, status, active } = action.payload;
      if (!state.activityUsers[chatId]) state.activityUsers[chatId] = {};

      if (active) {
        state.activityUsers[chatId][userId] = { userId, name, avatar, status };
      } else if (state.activityUsers[chatId][userId]?.status === status) {
        // only clear if this stop matches the currently-stored status,
        // so a stale "typing:stop" can't wipe out a newer "recording:start"
        delete state.activityUsers[chatId][userId];
      }
    },

    clearChatActivity: (state, action: PayloadAction<{ chatId: string }>) => {
      delete state.activityUsers[action.payload.chatId];
    },
    // setTypingUser: (
    //   state,
    //   action: PayloadAction<{
    //     chatId: string;
    //     userId: string;
    //     isTyping: boolean;
    //   }>
    // ) => {
    //   const { chatId, userId, isTyping } = action.payload;
    //   if (!state.typingUsers[chatId]) {
    //     state.typingUsers[chatId] = [];
    //   }
    //   if (isTyping) {
    //     if (!state.typingUsers[chatId].includes(userId)) {
    //       state.typingUsers[chatId].push(userId);
    //     }
    //   } else {
    //     state.typingUsers[chatId] = state.typingUsers[chatId].filter(
    //       (id) => id !== userId
    //     );
    //   }
    // },
    updateUnreadCount: (
      state,
      action: PayloadAction<{ chatId: string; count: number }>
    ) => {
      const chatIdx = state.chats.findIndex(
        (c) => c._id === action.payload.chatId
      );
      if (chatIdx !== -1) {
        state.chats[chatIdx].unreadCount = action.payload.count;
      }
    },
    markMessagesRead: (
      state,
      action: PayloadAction<{
        chatId: string;
        messageIds: string[];
        userId: string;
        readAt: string;
      }>
    ) => {
      const { chatId, messageIds, userId, readAt } = action.payload;
      const list = state.messages[chatId];
      if (!list) return;

      const idSet = messageIds.length > 0 ? new Set(messageIds) : null;

      list.forEach((msg) => {
        // Scoped case: only touch listed ids. Bulk case: touch every message
        // not sent by this user.
        const isTarget = idSet ? idSet.has(msg._id) : true;
        if (!isTarget) return;

        const senderId = (msg.sender as any)?._id || msg.sender;
        if (senderId === userId) return; // never mark someone's own message as "read by themselves"

        const alreadyRead = msg.readBy?.some(
          (r: any) => (r.user?._id || r.user) === userId
        );
        if (!alreadyRead) {
          if (!msg.readBy) msg.readBy = [];
          msg.readBy.push({ user: userId, readAt } as any);
        }
      });
    },

    // markMessagesRead: (
    //   state,
    //   action: PayloadAction<{
    //     chatId: string;
    //     messageIds: string[];
    //     userId: string;
    //     readAt: string;
    //   }>
    // ) => {
    //   const { chatId, messageIds, userId, readAt } = action.payload;
    //   const list = state.messages[chatId];
    //   if (!list) return;

    //   const idSet = new Set(messageIds);
    //   list.forEach((msg) => {
    //     if (!idSet.has(msg._id)) return;
    //     const alreadyRead = msg.readBy?.some(
    //       (r: any) =>
    //         (typeof r.user === "string" ? r.user : r.user?._id) === userId
    //     );
    //     if (!alreadyRead) {
    //       if (!msg.readBy) msg.readBy = [];
    //       msg.readBy.push({ user: userId, readAt } as any);
    //     }
    //   });
    // },
    // clearUnread: (state, action: PayloadAction<Chat>) => {
    //   const chat = action.payload;
    //   state.activeChat = action.payload;
    //   const idx = state.chats.findIndex((c: Chat) => c._id === chat._id);
    //   if (idx !== -1)
    //     state.chats[idx] = { ...state.chats[idx], unreadCount: 0 };
    // },
    clearUnread: (state, action: PayloadAction<string>) => {
      const chatId = action.payload;
      state.activeChat = chatId;
      const idx = state.chats.findIndex((c) => c._id === chatId);
      if (idx !== -1)
        state.chats[idx] = { ...state.chats[idx], unreadCount: 0 };
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const {
  setChats,
  addOrUpdateChat,
  setActiveChat,
  setMessages,
  prependMessages,
  addMessage,
  updateMessage,
  removeMessage,
  clearUnread,
  // setTypingUser,
  setUserActivity,
  updateUnreadCount,
  markMessagesRead,
  setLoading,
} = chatSlice.actions;
export default chatSlice.reducer;
