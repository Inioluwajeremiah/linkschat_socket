export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  isOnline: boolean;
  lastSeen: string;
}

export interface Message {
  _id: string;
  chatId: string;
  sender: User | string;
  content: string;
  type:
    | "text"
    | "image"
    | "video"
    | "audio"
    | "document"
    | "sticker"
    | "location"
    | "gif"
    | "call";
  mediaName?: string;
  mediaSize?: number;
  mediaUrl?: string;
  mediaDuration?: number;
  mediaThumbnail?: string;
  replyTo?: Message;
  reactions: MessageReaction[];
  callType: "audio" | "video";
  callStatus: "completed" | "missed";
  callDuration: number;
  readBy: ReadReceipt[];
  deliveredTo: any;
  deletedFor: any;
  forwardedFrom?: string;
  isDeleted: boolean;
  isEdited: boolean;
  editedAt?: string;
  createdAt: string;
  updatedAt: string;
  tempId?: string;
}

// services/api.ts — add `type` to the interface
export interface MessageSearchResult {
  messageId: string;
  chatId: string;
  chatType: "private" | "group";
  type:
    | "text"
    | "image"
    | "audio"
    | "video"
    | "document"
    | "gif"
    | "sticker"
    | "call";
  displayName?: string;
  displayAvatar?: string;
  callType: "audio" | "video";
  callStatus: "completed" | "missed";
  callDuration: number;
  senderName: string;
  isMine: boolean;
  content: string;
  createdAt: string;
}

export interface MessageReaction {
  user: User | string;
  emoji: string;
  createdAt: string;
}

export interface ReadReceipt {
  user: User | string;
  readAt: string;
}

// types.ts
export type ActivityStatus = "typing" | "recording" | "uploading";

export interface UserActivity {
  userId: string;
  name: string;
  avatar?: string;
  status: ActivityStatus;
}

export interface Chat {
  _id: string;
  type: "private" | "group";
  name?: string;
  phone?: number;
  avatar?: string;
  description?: string;
  participants: ChatParticipant[];
  admins: string[];
  lastMessage?: Message;
  lastMessageAt?: string;
  mutedBy: string[];
  createdBy: string;
  unreadCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChatParticipant {
  user: User;
  joinedAt: string;
  nickname?: string;
  role: "member" | "admin" | "owner";
}

export interface Status {
  _id: string;
  user: User;
  type: "text" | "image" | "video";
  content?: string;
  mediaUrl?: string;
  thumbnail?: string;
  backgroundColor?: string;
  textColor?: string;
  fontStyle?: string;
  views: StatusView[];
  reactions: StatusReaction[];
  duration?: number;
  expiresAt: string;
  isActive: boolean;
  createdAt: string;
  viewed?: boolean;
  mediaDuration?: number;
  trimStart?: number;
  trimEnd?: number;
}

export interface StatusView {
  user: User | string;
  viewedAt: string;
}

export interface StatusReaction {
  user: User | string;
  emoji: string;
}

export interface StatusGroup {
  user: User;
  statuses: Status[];
}

export interface CallHistory {
  _id: string;
  callId: string;
  type: "audio" | "video";
  status: "missed" | "completed" | "rejected" | "ongoing";
  initiator: User;
  participants: User[];
  chatId?: string;
  startedAt?: string;
  endedAt?: string;
  duration?: number;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  streamToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface ChatState {
  chats: Chat[];
  activeChat: Chat | null | string;
  messages: Record<string, Message[]>;
  activityUsers: Record<string, Record<string, UserActivity>>;
  // typingUsers: Record<string, string[]>;
  isLoading: boolean;
}

export interface SocketState {
  isConnected: boolean;
  onlineUsers: string[];
}

export interface Reel {
  _id: string;
  user: User;
  type: "image" | "video";
  mediaUrl: string;
  thumbnail?: string;
  caption?: string;
  likes: string[];
  comments: ReelComment[];
  shares: number;
  views: number;
  duration?: number;
  isLiked?: boolean;
  createdAt: string;
}

export interface ReelComment {
  _id: string;
  user: User;
  text: string;
  createdAt: string;
}

export interface PrivacySettings {
  hideOnlineStatus: boolean;
  hideLastSeen: boolean;
  disableReadReceipts: boolean;
  onlyContactsCanMessage: boolean;
}
