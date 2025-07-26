export interface User {
  _id: string;
  userId: string;
  fullName: string;
  email: string;
  role: string;
  profilePicture?: string;
  avatar?: string;
  isActive: boolean;
}

export interface Message {
  _id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  content: string;
  messageType: 'text' | 'file' | 'image' | 'audio' | 'video';
  timestamp: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  reactions?: Array<{
    emoji: string;
    userId: string;
    userName: string;
  }>;
  replyTo?: {
    messageId: string;
    content: string;
    senderName: string;
  };
  // Media properties
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  attachments?: Array<{
    filename: string;
    url: string;
    type: string;
    size: number;
  }>;
}

export interface Chat {
  _id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  isGroupChat: boolean;
  groupName?: string;
  groupAvatar?: string;
  createdAt: string;
  updatedAt: string;
  isArchived: boolean;
  isMuted: boolean;
  typingUsers: string[];
}

export interface ChatSearchResult {
  success: boolean;
  data: User[];
}

export interface MessageResponse {
  success: boolean;
  data: Message[];
}

export interface ChatResponse {
  success: boolean;
  data: Chat[];
} 