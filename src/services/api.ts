// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { API_BASE_URL } from "../constants";

// class ApiService {
//   private baseUrl: string;

//   constructor(baseUrl: string) {
//     this.baseUrl = baseUrl;
//   }

//   private async getHeaders(): Promise<HeadersInit> {
//     const token = await AsyncStorage.getItem("accessToken");
//     return {
//       "Content-Type": "application/json",
//       ...(token ? { Authorization: `Bearer ${token}` } : {}),
//     };
//   }

//   private async request<T>(
//     method: string,
//     endpoint: string,
//     body?: unknown,
//     customHeaders?: HeadersInit
//   ): Promise<T> {
//     const headers = await this.getHeaders();

//     const response = await fetch(`${this.baseUrl}${endpoint}`, {
//       method,
//       headers: { ...headers, ...customHeaders },
//       body: body ? JSON.stringify(body) : undefined,
//     });

//     const data = await response.json();

//     if (!response.ok) {
//       throw new Error(data.message || "Request failed");
//     }

//     return data;
//   }

//   async get<T>(endpoint: string): Promise<T> {
//     return this.request<T>("GET", endpoint);
//   }

//   async post<T>(endpoint: string, body?: unknown): Promise<T> {
//     return this.request<T>("POST", endpoint, body);
//   }

//   async patch<T>(endpoint: string, body?: unknown): Promise<T> {
//     return this.request<T>("PATCH", endpoint, body);
//   }

//   async delete<T>(endpoint: string, body?: unknown): Promise<T> {
//     return this.request<T>("DELETE", endpoint, body);
//   }
// }

// export const api = new ApiService(API_BASE_URL);

// // Auth
// export const authApi = {
//   register: (data: { name: string; email: string; phone?: string }) =>
//     api.post<{ success: boolean; data: { userId: string; email: string } }>(
//       "/auth/register",
//       data
//     ),

//   login: (data: { email: string; fcmToken?: string; phone: string }) =>
//     api.post<{ success: boolean; data: { userId: string; email: string } }>(
//       "/auth/login",
//       data
//     ),

//   verifyOtp: (data: { userId: string; otp: string }) =>
//     api.post<{
//       success: boolean;
//       data: {
//         user: import("../types").User;
//         accessToken: string;
//         refreshToken: string;
//         streamToken: string;
//       };
//     }>("/auth/verify-otp", data),

//   resendOtp: (userId: string) => api.post("/auth/resend-otp", { userId }),

//   getMe: () =>
//     api.get<{
//       success: boolean;
//       data: { user: import("../types").User; streamToken: string };
//     }>("/auth/me"),

//   logout: (fcmToken?: string) => api.post("/auth/logout", { fcmToken }),
// };

// // Chats
// export const chatApi = {
//   getChats: (page = 1) =>
//     api.get<{ success: boolean; data: { chats: import("../types").Chat[] } }>(
//       `/chats?page=${page}`
//     ),

//   createPrivateChat: (recipientId: string) =>
//     api.post<{ success: boolean; data: { chat: import("../types").Chat } }>(
//       "/chats/private",
//       { recipientId }
//     ),

//   createGroupChat: (data: {
//     name: string;
//     participantIds: string[];
//     description?: string;
//   }) =>
//     api.post<{ success: boolean; data: { chat: import("../types").Chat } }>(
//       "/chats/group",
//       data
//     ),

//   getMessages: (chatId: string, page = 1, before?: string) =>
//     api.get<{
//       success: boolean;
//       data: { messages: import("../types").Message[]; hasMore: boolean };
//     }>(
//       `/chats/${chatId}/messages?page=${page}${
//         before ? `&before=${before}` : ""
//       }`
//     ),

//   sendMessage: (
//     chatId: string,
//     data: {
//       content: string;
//       type?: string;
//       mediaUrl?: string;
//       replyTo?: string;
//     }
//   ) =>
//     api.post<{
//       success: boolean;
//       data: { message: import("../types").Message };
//     }>(`/chats/${chatId}/messages`, data),

//   getChatInfo: (chatId: string) =>
//     api.get<{ success: boolean; data: { chat: import("../types").Chat } }>(
//       `/chats/${chatId}/info`
//     ),
// };

// // Users
// export const userApi = {
//   searchUsers: (query: string) =>
//     api.get<{ success: boolean; data: { users: import("../types").User[] } }>(
//       `/users/search?q=${encodeURIComponent(query)}`
//     ),

//   getContacts: () =>
//     api.get<{
//       success: boolean;
//       data: { contacts: import("../types").User[] };
//     }>("/users/contacts"),

//   addContact: (contactId: string) => api.post("/users/contacts", { contactId }),

//   updateProfile: (data: {
//     name?: string;
//     bio?: string;
//     avatar?: string;
//     phone?: string;
//   }) =>
//     api.patch<{ success: boolean; data: { user: import("../types").User } }>(
//       "/users/profile",
//       data
//     ),

//   getUserProfile: (userId: string) =>
//     api.get<{ success: boolean; data: { user: import("../types").User } }>(
//       `/users/${userId}`
//     ),
// };

// // Status
// export const statusApi = {
//   getStatuses: () =>
//     api.get<{
//       success: boolean;
//       data: {
//         myStatus: import("../types").StatusGroup;
//         statuses: import("../types").StatusGroup[];
//       };
//     }>("/status"),

//   createStatus: (data: {
//     type: "text" | "image" | "video";
//     content?: string;
//     mediaUrl?: string;
//     backgroundColor?: string;
//     textColor?: string;
//   }) =>
//     api.post<{ success: boolean; data: { status: import("../types").Status } }>(
//       "/status",
//       data
//     ),

//   viewStatus: (statusId: string) => api.post(`/status/${statusId}/view`),

//   reactToStatus: (statusId: string, emoji: string) =>
//     api.post(`/status/${statusId}/react`, { emoji }),

//   deleteStatus: (statusId: string) => api.delete(`/status/${statusId}`),
// };

// // Platform contacts (phone-matched)
// export const platformContactsApi = {
//   getContactsOnPlatform: () =>
//     api.get<{
//       success: boolean;
//       data: { contacts: import("../types").User[] };
//     }>("/users/contacts/on-platform"),
// };

// // Phone contacts sync
// export const contactsSyncApi = {
//   sync: (phoneNumbers: string[]) =>
//     api.post<{
//       success: boolean;
//       data: { users: import("../types").User[]; total: number };
//     }>("/users/contacts/sync", { phoneNumbers }),
// };

// // Calls
// export const callApi = {
//   getCallHistory: (page = 1) =>
//     api.get<{
//       success: boolean;
//       data: { calls: import("../types").CallHistory[] };
//     }>(`/calls?page=${page}`),

//   saveCallHistory: (data: {
//     callId: string;
//     type: "audio" | "video";
//     participantIds: string[];
//     chatId?: string;
//     startedAt?: string;
//     endedAt?: string;
//     status: string;
//   }) => api.post("/calls", data),
// };

// // Reels
// export const reelApi = {
//   getReels: (page = 1, trending = false) =>
//     api.get<{ success: boolean; data: { reels: import("../types").Reel[] } }>(
//       `/reels?page=${page}&trending=${trending}`
//     ),
//   createReel: (data: {
//     videoUrl: string;
//     thumbnail?: string;
//     caption?: string;
//   }) =>
//     api.post<{ success: boolean; data: { reel: import("../types").Reel } }>(
//       "/reels",
//       data
//     ),
//   toggleLike: (reelId: string) =>
//     api.post<{
//       success: boolean;
//       data: { liked: boolean; likesCount: number };
//     }>(`/reels/${reelId}/like`),
//   addComment: (reelId: string, text: string) =>
//     api.post(`/reels/${reelId}/comment`, { text }),
//   recordView: (reelId: string) => api.post(`/reels/${reelId}/view`),
//   deleteReel: (reelId: string) => api.delete(`/reels/${reelId}`),
// };

// // Privacy & safety
// export const privacyApi = {
//   getSettings: () =>
//     api.get<{ success: boolean; data: { settings: any } }>("/users-privacy"),
//   updatePrivacy: (settings: Partial<import("../types").PrivacySettings>) =>
//     api.patch("/users/privacy", settings),
//   blockUser: (targetUserId: string) =>
//     api.post("/users/block", { targetUserId }),
//   unblockUser: (targetUserId: string) =>
//     api.post("/users/unblock", { targetUserId }),
//   reportUser: (targetUserId: string, reason: string) =>
//     api.post("/users/report", { targetUserId, reason }),
//   updateAppLock: (enabled: boolean) =>
//     api.patch("/users/app-lock", { enabled }),
// };

// // Starred messages
// export const starApi = {
//   getStarred: () =>
//     api.get<{
//       success: boolean;
//       data: { messages: import("../types").Message[] };
//     }>("/chats/starred"),
//   starMessage: (messageId: string) =>
//     api.post(`/chats/messages/${messageId}/star`),
// };

// // Message extras
// export const messageApi = {
//   editMessage: (messageId: string, content: string) =>
//     api.patch(`/chats/messages/${messageId}/edit`, { content }),
//   forwardMessage: (messageId: string, targetChatIds: string[]) =>
//     api.post(`/chats/messages/${messageId}/forward`, { targetChatIds }),
// };

// // Group management
// export const groupApi = {
//   addMembers: (chatId: string, userIds: string[]) =>
//     api.patch(`/chats/${chatId}/group/members/add`, { userIds }),
//   removeMember: (chatId: string, targetUserId: string) =>
//     api.patch(`/chats/${chatId}/group/members/remove`, { targetUserId }),
//   toggleAdmin: (chatId: string, targetUserId: string, makeAdmin: boolean) =>
//     api.patch(`/chats/${chatId}/group/admin`, { targetUserId, makeAdmin }),
//   updateInfo: (
//     chatId: string,
//     data: { name?: string; description?: string; avatar?: string }
//   ) => api.patch(`/chats/${chatId}/group/info`, data),
// };

import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../constants";
import { MessageSearchResult } from "../types";

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async getHeaders(): Promise<HeadersInit> {
    const token = await AsyncStorage.getItem("accessToken");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  private async request<T>(
    method: string,
    endpoint: string,
    body?: unknown,
    customHeaders?: HeadersInit
  ): Promise<T> {
    const headers = await this.getHeaders();

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: { ...headers, ...customHeaders },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Request failed");
    }

    return data;
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>("GET", endpoint);
  }

  async post<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>("POST", endpoint, body);
  }

  async patch<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>("PATCH", endpoint, body);
  }

  async delete<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>("DELETE", endpoint, body);
  }
}

export const api = new ApiService(API_BASE_URL);

// Auth
export const authApi = {
  register: (data: { name: string; email: string; phone?: string }) =>
    api.post<{ success: boolean; data: { userId: string; email: string } }>(
      "/auth/register",
      data
    ),

  login: (data: { email: string; fcmToken?: string; phone?: string }) =>
    api.post<{ success: boolean; data: { userId: string; email: string } }>(
      "/auth/login",
      data
    ),

  verifyOtp: (data: { userId: string; otp: string }) =>
    api.post<{
      success: boolean;
      data: {
        user: import("../types").User;
        accessToken: string;
        refreshToken: string;
        streamToken: string;
      };
    }>("/auth/verify-otp", data),

  resendOtp: (userId: string) => api.post("/auth/resend-otp", { userId }),

  getMe: () =>
    api.get<{
      success: boolean;
      data: { user: import("../types").User; streamToken: string };
    }>("/auth/me"),

  logout: (fcmToken?: string) => api.post("/auth/logout", { fcmToken }),
};

// export const searchApi = {
//   searchMessages: (q: string) =>
//     api
//       .get<{ success: boolean; data: { results: MessageSearchResult[] } }>(
//         `/search/messages?q=${encodeURIComponent(q)}`
//       )
//       .then((r) => r.data),
//   getMessageContext: (messageId: string, limit = 40) =>
//     api
//       .get<{
//         success: boolean;
//         data: {
//           chatId: string;
//           messages: import("../types").Message[];
//           hasMoreBefore: boolean;
//           hasMoreAfter: boolean;
//         };
//       }>(`/search/messages/${messageId}/context?limit=${limit}`)
//       .then((r) => r.data),
// };

export const searchApi = {
  searchMessages: (q: string) =>
    api.get<{ success: boolean; data: { results: MessageSearchResult[] } }>(
      `/search/messages?q=${encodeURIComponent(q)}`
    ),

  getMessageContext: (messageId: string, limit = 40) =>
    api.get<{
      success: boolean;
      data: {
        chatId: string;
        messages: import("../types").Message[];
        hasMoreBefore: boolean;
        hasMoreAfter: boolean;
      };
    }>(`/search/messages/${messageId}/context?limit=${limit}`),
};
// Chats
export const chatApi = {
  getChats: (page = 1) =>
    api.get<{
      success: boolean;
      data: { chats: import("../types").Chat[] };
    }>(`/chats?page=${page}`),

  createPrivateChat: (recipientId: string) =>
    api.post<{ success: boolean; data: { chat: import("../types").Chat } }>(
      "/chats/private",
      { recipientId }
    ),

  createGroupChat: (data: {
    name: string;
    participantIds: string[];
    description?: string;
    avatar?: string;
  }) =>
    api.post<{ success: boolean; data: { chat: import("../types").Chat } }>(
      "/chats/group",
      data
    ),

  // getMessages: (chatId: string, page = 1, before?: string) =>
  //   api.get<{
  //     success: boolean;
  //     data: { messages: import("../types").Message[]; hasMore: boolean };
  //   }>(
  //     `/chats/${chatId}/messages?page=${page}${
  //       before ? `&before=${before}` : ""
  //     }`
  //   ),

  getMessages: (chatId: string, page = 1, before?: string) =>
    api.get<{
      success: boolean;
      data: {
        messages: import("../types").Message[];
        pagination: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
          hasNextPage: boolean;
          hasPrevPage: boolean;
        };
      };
    }>(
      `/chats/${chatId}/messages?page=${page}${
        before ? `&before=${before}` : ""
      }`
    ),

  sendMessage: (
    chatId: string,
    data: {
      content: string;
      type?: string;
      mediaUrl?: string;
      replyTo?: string;
      mediaName: string;
      mediaSize: number;
      mediaDuration: number;
    }
  ) =>
    api.post<{
      success: boolean;
      data: { message: import("../types").Message };
    }>(`/chats/${chatId}/messages`, data),

  getChatInfo: (chatId: string) =>
    api.get<{ success: boolean; data: { chat: import("../types").Chat } }>(
      `/chats/${chatId}/info`
    ),
};

// Users
export const userApi = {
  searchUsers: (query: string) =>
    api.get<{
      success: boolean;
      data: { users: import("../types").User[] };
    }>(`/users/search?q=${encodeURIComponent(query)}`),

  getContacts: () =>
    api.get<{
      success: boolean;
      data: { contacts: import("../types").User[] };
    }>("/users/contacts"),

  addContact: (contactId: string) => api.post("/users/contacts", { contactId }),

  // updateProfile: (data: {
  //   name?: string;
  //   bio?: string;
  //   avatar?: string;
  //   phone?: string;
  // }) =>
  //   api.patch<{ success: boolean; data: { user: import("../types").User } }>(
  //     "/users/profile",
  //     data
  //   ),

  updateProfile: async (
    formData: FormData
  ): Promise<{
    success: boolean;
    data: { user: import("../types").User };
  }> => {
    const token = await AsyncStorage.getItem("accessToken"); // match how you get token elsewhere
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    const json = await response.json();
    if (!json.success) throw new Error(json.message);
    return json;
  },

  getUserProfile: (userId: string) =>
    api.get<{ success: boolean; data: { user: import("../types").User } }>(
      `/users/${userId}`
    ),
};

// Status
export const statusApi = {
  getStatuses: () =>
    api.get<{
      success: boolean;
      data: {
        myStatus: import("../types").StatusGroup;
        statuses: import("../types").StatusGroup[];
      };
    }>("/status"),

  createStatus: (data: {
    type: "text" | "image" | "video";
    content?: string;
    mediaUrl?: string;
    backgroundColor?: string;
    textColor?: string;
    thumbnail?: string;
    duration?: number;
    mediaDuration?: number;
    trimStart?: number;
    trimEnd?: number;
  }) =>
    api.post<{
      success: boolean;
      data: { status: import("../types").Status };
    }>("/status", data),

  viewStatus: (statusId: string) => api.post(`/status/${statusId}/view`),

  reactToStatus: (statusId: string, emoji: string) =>
    api.post(`/status/${statusId}/react`, { emoji }),

  deleteStatus: (statusId: string) => api.delete(`/status/${statusId}`),
};

// Platform contacts (phone-matched)
export const platformContactsApi = {
  getContactsOnPlatform: () =>
    api.get<{
      success: boolean;
      data: { contacts: import("../types").User[] };
    }>("/users/contacts/on-platform"),
};

// Phone contacts sync
export const contactsSyncApi = {
  sync: (phoneNumbers: string[], deviceCountryCode: string) =>
    api.post<{
      success: boolean;
      data: { users: import("../types").User[]; total: number };
    }>("/users/contacts/sync", { phoneNumbers, deviceCountryCode }),
};

// Calls
export const callApi = {
  getCallHistory: (page = 1) =>
    api.get<{
      success: boolean;
      data: { calls: import("../types").CallHistory[] };
    }>(`/calls?page=${page}`),

  saveCallHistory: (data: {
    callId: string;
    type: "audio" | "video";
    participantIds: string[];
    chatId?: string;
    startedAt?: string;
    endedAt?: string;
    status: string;
  }) => api.post("/calls", data),
};

// Reels
export const reelApi = {
  getReels: (page = 1, trending = false) =>
    api.get<{
      success: boolean;
      data: { reels: import("../types").Reel[] };
    }>(`/reels?page=${page}&trending=${trending}`),
  createReel: (data: {
    // videoUrl: string;
    // thumbnail?: string;
    // caption?: string;
    // duration?: number;
    type: "image" | "video";
    mediaUrl: string;
    thumbnail?: string;
    caption?: string;
    duration?: number;
  }) =>
    api.post<{ success: boolean; data: { reel: import("../types").Reel } }>(
      "/reels",
      data
    ),
  toggleLike: (reelId: string) =>
    api.post<{
      success: boolean;
      data: { liked: boolean; likesCount: number };
    }>(`/reels/${reelId}/like`),
  addComment: (reelId: string, text: string) =>
    api.post(`/reels/${reelId}/comment`, { text }),
  recordView: (reelId: string) => api.post(`/reels/${reelId}/view`),
  deleteReel: (reelId: string) => api.delete(`/reels/${reelId}`),
};

// Get blocked users list
export const blockedUsersApi = {
  getBlockedUsers: () =>
    api.get<{
      success: boolean;
      data: { users: import("../types").User[] };
    }>("/users/blocked"),
};

// Privacy & safety
export const privacyApi = {
  getSettings: () =>
    api.get<{ success: boolean; data: { settings: any } }>("/users/privacy"),
  updatePrivacy: (settings: Partial<import("../types").PrivacySettings>) =>
    api.patch("/users/privacy", settings),
  blockUser: (targetUserId: string) =>
    api.post("/users/block", { targetUserId }),
  unblockUser: (targetUserId: string) =>
    api.post("/users/unblock", { targetUserId }),
  reportUser: (targetUserId: string, reason: string) =>
    api.post("/users/report", { targetUserId, reason }),
  updateAppLock: (enabled: boolean) =>
    api.patch("/users/app-lock", { enabled }),
};

// Starred messages
export const starApi = {
  getStarred: () =>
    api.get<{
      success: boolean;
      data: { messages: import("../types").Message[] };
    }>("/chats/starred"),
  starMessage: (messageId: string) =>
    api.post(`/chats/messages/${messageId}/star`),
};

// Message extras
export const messageApi = {
  editMessage: (messageId: string, content: string) =>
    api.patch(`/chats/messages/${messageId}/edit`, { content }),
  forwardMessage: (messageId: string, targetChatIds: string[]) =>
    api.post(`/chats/messages/${messageId}/forward`, { targetChatIds }),
};

// Group management
export const groupApi = {
  addMembers: (chatId: string, userIds: string[]) =>
    api.patch(`/chats/${chatId}/group/members/add`, { userIds }),
  removeMember: (chatId: string, targetUserId: string) =>
    api.patch(`/chats/${chatId}/group/members/remove`, { targetUserId }),
  toggleAdmin: (chatId: string, targetUserId: string, makeAdmin: boolean) =>
    api.patch(`/chats/${chatId}/group/admin`, { targetUserId, makeAdmin }),
  updateInfo: (
    chatId: string,
    data: { name?: string; description?: string; avatar?: string }
  ) => api.patch(`/chats/${chatId}/group/info`, data),
};

// Upload (S3 presigned)
export const uploadApi = {
  getPresignedUrl: (filename: string, contentType: string, type: string) =>
    api.post<{
      success: boolean;
      data: { uploadUrl: string; publicUrl: string; key: string };
    }>("/upload/presign", { filename, contentType, type }),
  uploadAvatar: async (uri: string): Promise<string> => {
    const token = await AsyncStorage.getItem("accessToken");
    const formData = new FormData();
    const filename = uri.split("/").pop() || "avatar.jpg";
    formData.append("avatar", {
      uri,
      name: filename,
      type: "image/jpeg",
    } as any);
    const res = await fetch(`${API_BASE_URL}/upload/avatar`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data.data.url;
  },
};

// Upload a file directly to S3 using a presigned URL
export const uploadFileToS3 = async (
  localUri: string,
  filename: string,
  contentType: string,
  type: string
): Promise<string> => {
  const { data } = await uploadApi.getPresignedUrl(filename, contentType, type);
  const fileContent = await fetch(localUri);
  const blob = await fileContent.blob();
  await fetch(data.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: blob,
  });
  return data.publicUrl;
};

// New message actions
export const messageActionsApi = {
  editMessage: (messageId: string, content: string) =>
    api.patch(`/chats/messages/${messageId}/edit`, { content }),
  deleteMessage: (messageId: string, forEveryone: boolean) =>
    api.delete(`/chats/messages/${messageId}`, { forEveryone }),
  reactToMessage: (messageId: string, emoji: string) =>
    api.post(`/chats/messages/${messageId}/react`, { emoji }),
  starMessage: (messageId: string) =>
    api.post(`/chats/messages/${messageId}/star`),
  forwardMessage: (messageId: string, targetChatIds: string[]) =>
    api.post(`/chats/messages/${messageId}/forward`, { targetChatIds }),
  markChatRead: (chatId: string) => api.patch(`/chats/${chatId}/read`),
};
