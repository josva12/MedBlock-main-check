import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// --- Interfaces ---
interface Message {
  _id: string;
  senderId: {
    _id: string;
    fullName: string;
    profilePicture?: {
      url?: string;
      filename?: string;
    };
  };
  content: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'file';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  status: 'sent' | 'delivered' | 'read';
  reactions: Array<{
    userId: string;
    userName: string;
    emoji: string;
    reactedAt: Date;
  }>;
  readBy: Array<{
    userId: string;
    readAt: Date;
  }>;
  deliveredTo: Array<{
    userId: string;
    deliveredAt: Date;
  }>;
  createdAt: Date;
}

interface Conversation {
  _id: string;
  participants: Array<{
    _id: string;
    fullName: string;
    email: string;
    role: string;
    profilePicture?: {
      url?: string;
      filename?: string;
    };
    showLastSeen?: boolean;
    showOnlineStatus?: boolean;
    lastSeen?: Date;
    isOnline?: boolean;
  }>;
  messages: Message[];
  lastMessage?: Date;
  isGroupChat: boolean;
  groupName?: string;
  groupAdmin?: string;
  archivedBy: Array<{
    userId: string;
    archivedAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

interface ChatState {
  recentChats: Conversation[];
  drafts: { [chatId: string]: string };
  activeConversation: Conversation | null;
  messages: Message[];
  loading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  recentChats: [],
  drafts: {},
  activeConversation: null,
  messages: [],
  loading: false,
  error: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    // Set error state
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // Set recent chats
    setRecentChats: (state, action: PayloadAction<Conversation[]>) => {
      state.recentChats = action.payload;
    },

    // Update or add a recent chat
    updateRecentChat: (state, action: PayloadAction<{ chatId: string; message: Message }>) => {
      const { chatId, message } = action.payload;
      const existingChatIndex = state.recentChats.findIndex(chat => chat._id === chatId);
      
      if (existingChatIndex !== -1) {
        // Update existing chat and move to top
        const updatedChat = {
          ...state.recentChats[existingChatIndex],
          lastMessage: message.createdAt,
          messages: [...state.recentChats[existingChatIndex].messages, message]
        };
        
        // Remove from current position and add to top
        state.recentChats.splice(existingChatIndex, 1);
        state.recentChats.unshift(updatedChat);
      } else {
        // Create new chat if it doesn't exist
        const newChat: Conversation = {
          _id: chatId,
          participants: [
            {
              _id: message.senderId._id,
              fullName: message.senderId.fullName,
              email: '', // Will be populated when conversation is fetched
              role: '', // Will be populated when conversation is fetched
              profilePicture: message.senderId.profilePicture
            }
          ],
          messages: [message],
          lastMessage: message.createdAt,
          isGroupChat: false,
          archivedBy: [],
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        state.recentChats.unshift(newChat);
      }
    },

    // Add empty chat to recents (for when user opens a chat but hasn't sent messages)
    addEmptyChatToRecents: (state, action: PayloadAction<Conversation>) => {
      const existingChatIndex = state.recentChats.findIndex(chat => chat._id === action.payload._id);
      
      if (existingChatIndex === -1) {
        state.recentChats.unshift(action.payload);
      }
    },

    // Set active conversation
    setActiveConversation: (state, action: PayloadAction<Conversation | null>) => {
      state.activeConversation = action.payload;
    },

    // Set messages for active conversation
    setMessages: (state, action: PayloadAction<Message[]>) => {
      state.messages = action.payload;
    },

    // Add message to active conversation
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
    },

    // Update message reaction
    updateMessageReaction: (state, action: PayloadAction<{ messageId: string; reaction: any }>) => {
      const { messageId, reaction } = action.payload;
      const messageIndex = state.messages.findIndex(msg => msg._id === messageId);
      
      if (messageIndex !== -1) {
        state.messages[messageIndex].reactions = reaction;
      }
    },

    // Draft management
    setDraftMessage: (state, action: PayloadAction<{ chatId: string; text: string }>) => {
      const { chatId, text } = action.payload;
      state.drafts[chatId] = text;
    },

    clearDraftMessage: (state, action: PayloadAction<string>) => {
      const chatId = action.payload;
      delete state.drafts[chatId];
    },

    // Clear all drafts
    clearAllDrafts: (state) => {
      state.drafts = {};
    },

    // Update message status
    updateMessageStatus: (state, action: PayloadAction<{ messageId: string; status: 'sent' | 'delivered' | 'read' }>) => {
      const { messageId, status } = action.payload;
      const messageIndex = state.messages.findIndex(msg => msg._id === messageId);
      
      if (messageIndex !== -1) {
        state.messages[messageIndex].status = status;
      }
    },

    // Clear chat state
    clearChatState: (state) => {
      state.recentChats = [];
      state.drafts = {};
      state.activeConversation = null;
      state.messages = [];
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setError,
  setRecentChats,
  updateRecentChat,
  addEmptyChatToRecents,
  setActiveConversation,
  setMessages,
  addMessage,
  updateMessageReaction,
  setDraftMessage,
  clearDraftMessage,
  clearAllDrafts,
  updateMessageStatus,
  clearChatState,
} = chatSlice.actions;

export default chatSlice.reducer; 