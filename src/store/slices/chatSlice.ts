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
import { withLiveParticipants } from "../../utils/participants";

const initialState: ChatState = {
  chats: [],
  activeChat: null,
  messages: {},
  messagesLoaded: {},
  // typingUsers: {},
  activityUsers: {},
  isLoading: false,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setChats: (state, action: PayloadAction<Chat[]>) => {
      state.chats = action.payload.map(withLiveParticipants);
    },
    addOrUpdateChat: (state, action: PayloadAction<Chat>) => {
      const chat = withLiveParticipants(action.payload);
      const idx = state.chats.findIndex((c) => c._id === chat._id);
      if (idx !== -1) {
        state.chats[idx] = chat;
      } else {
        state.chats.unshift(chat);
      }
    },
    setActiveChat: (state, action: PayloadAction<Chat | null>) => {
      state.activeChat = action.payload;
    },
    setMessages: (
      state,
      action: PayloadAction<{ chatId: string; messages: Message[] }>
    ) => {
      const { chatId, messages } = action.payload;
      // Messages still in the offline outbox live only in this array, so a
      // reload from the server/cache must not wipe them (they're newer than
      // anything the server has, hence appended last).
      const pending = (state.messages[chatId] || []).filter(
        (m) =>
          m._status &&
          !messages.some((n) => n.tempId && n.tempId === m.tempId)
      );
      state.messages[chatId] = pending.length
        ? [...messages, ...pending]
        : messages;
      state.messagesLoaded[chatId] = true;
    },
    // Folds freshly fetched messages into what's already loaded (updating
    // ones we have, adding new ones) without discarding older pages or
    // pending sends — used to catch up after a reconnect.
    mergeMessages: (
      state,
      action: PayloadAction<{ chatId: string; messages: Message[] }>
    ) => {
      const { chatId, messages } = action.payload;
      const list = state.messages[chatId] ?? [];
      const indexById = new Map(list.map((m, i) => [m._id, i]));
      for (const m of messages) {
        const i = indexById.get(m._id);
        if (i !== undefined) list[i] = m;
        else list.push(m);
      }
      const confirmed = list
        .filter((m) => !m._status)
        .sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      const pending = list.filter((m) => m._status);
      state.messages[chatId] = [...confirmed, ...pending];
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
        // A reload may already have brought in the confirmed copy of this
        // message (same _id); then just drop the placeholder rather than
        // showing it twice.
        const duplicate = state.messages[chatId].some(
          (m, i) => i !== tempIdx && m._id === message._id
        );
        if (duplicate) state.messages[chatId].splice(tempIdx, 1);
        else state.messages[chatId][tempIdx] = message;
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
    // Sign-out: forget the previous account's chats/messages, so the next
    // account can't see them (or have them written into its offline cache).
    resetChat: () => initialState,
  },
});

export const {
  setChats,
  addOrUpdateChat,
  setActiveChat,
  setMessages,
  mergeMessages,
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
  resetChat,
} = chatSlice.actions;
export default chatSlice.reducer;
