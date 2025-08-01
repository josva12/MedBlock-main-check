import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import chatService, { Message, Conversation, User } from '../../services/chatService';

// --- Interfaces ---
interface ChatState {
  recentChats: Conversation[];
  drafts: { [chatId: string]: string };
  activeConversation: Conversation | null;
  messages: Message[];
  searchResults: User[];
  loading: boolean;
  error: string | null;
  searching: boolean;
}

const initialState: ChatState = {
  recentChats: [],
  drafts: {},
  activeConversation: null,
  messages: [],
  searchResults: [],
  loading: false,
  error: null,
  searching: false,
};

// --- Async Thunks ---
export const fetchRecentChats = createAsyncThunk(
  'chat/fetchRecentChats',
  async (showArchived: boolean = false) => {
    return await chatService.getRecentChats(showArchived);
  }
);

export const searchUsers = createAsyncThunk(
  'chat/searchUsers',
  async (query: string) => {
    return await chatService.searchUsers(query);
  }
);

export const createOrGetConversation = createAsyncThunk(
  'chat/createOrGetConversation',
  async (participantId: string) => {
    return await chatService.createOrGetConversation(participantId);
  }
);

export const touchConversation = createAsyncThunk(
  'chat/touchConversation',
  async (participantId: string) => {
    return await chatService.touchConversation(participantId);
  }
);

export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async (chatId: string) => {
    return await chatService.getMessages(chatId);
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ chatId, content }: { chatId: string; content: string }) => {
    return await chatService.sendMessage(chatId, content);
  }
);

export const sendMediaMessage = createAsyncThunk(
  'chat/sendMediaMessage',
  async ({ chatId, file, content }: { chatId: string; file: File; content?: string }) => {
    return await chatService.sendMediaMessage(chatId, file, content);
  }
);

export const addReaction = createAsyncThunk(
  'chat/addReaction',
  async ({ messageId, emoji }: { messageId: string; emoji: string }) => {
    return await chatService.addReaction(messageId, emoji);
  }
);

export const removeReaction = createAsyncThunk(
  'chat/removeReaction',
  async ({ messageId, emoji }: { messageId: string; emoji: string }) => {
    await chatService.removeReaction(messageId, emoji);
    return { messageId, emoji };
  }
);

export const archiveChat = createAsyncThunk(
  'chat/archiveChat',
  async (chatId: string) => {
    await chatService.archiveChat(chatId);
    return chatId;
  }
);

export const unarchiveChat = createAsyncThunk(
  'chat/unarchiveChat',
  async (chatId: string) => {
    await chatService.unarchiveChat(chatId);
    return chatId;
  }
);

export const deleteChat = createAsyncThunk(
  'chat/deleteChat',
  async (chatId: string) => {
    await chatService.deleteChat(chatId);
    return chatId;
  }
);

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

    // Clear search results
    clearSearchResults: (state) => {
      state.searchResults = [];
    },

    // Clear chat state
    clearChatState: (state) => {
      state.recentChats = [];
      state.drafts = {};
      state.activeConversation = null;
      state.messages = [];
      state.searchResults = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Recent Chats
      .addCase(fetchRecentChats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecentChats.fulfilled, (state, action) => {
        state.loading = false;
        state.recentChats = action.payload;
      })
      .addCase(fetchRecentChats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch recent chats';
      })

      // Search Users
      .addCase(searchUsers.pending, (state) => {
        state.searching = true;
        state.error = null;
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.searching = false;
        state.searchResults = action.payload;
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.searching = false;
        state.error = action.error.message || 'Failed to search users';
      })

      // Create or Get Conversation
      .addCase(createOrGetConversation.fulfilled, (state, action) => {
        // Add to recent chats if not already there
        const existingIndex = state.recentChats.findIndex(chat => chat._id === action.payload._id);
        if (existingIndex === -1) {
          state.recentChats.unshift(action.payload);
        } else {
          // Update existing conversation
          state.recentChats[existingIndex] = action.payload;
          // Move to top
          const conversation = state.recentChats.splice(existingIndex, 1)[0];
          state.recentChats.unshift(conversation);
        }
      })

      // Touch Conversation
      .addCase(touchConversation.fulfilled, (state, action) => {
        // Add to recent chats if not already there
        const existingIndex = state.recentChats.findIndex(chat => chat._id === action.payload._id);
        if (existingIndex === -1) {
          state.recentChats.unshift(action.payload);
        } else {
          // Update existing conversation
          state.recentChats[existingIndex] = action.payload;
          // Move to top
          const conversation = state.recentChats.splice(existingIndex, 1)[0];
          state.recentChats.unshift(conversation);
        }
      })

      // Fetch Messages
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch messages';
      })

      // Send Message
      .addCase(sendMessage.fulfilled, (state, action) => {
        // Add message to current conversation
        state.messages.push(action.payload);
        
        // Update recent chats
        const chatIndex = state.recentChats.findIndex(chat => chat._id === state.activeConversation?._id);
        if (chatIndex !== -1) {
          state.recentChats[chatIndex].messages.push(action.payload);
          state.recentChats[chatIndex].lastMessage = action.payload.createdAt;
          
          // Move to top
          const conversation = state.recentChats.splice(chatIndex, 1)[0];
          state.recentChats.unshift(conversation);
        }
        
        // Clear draft for this chat
        if (state.activeConversation) {
          delete state.drafts[state.activeConversation._id];
        }
      })

      // Send Media Message
      .addCase(sendMediaMessage.fulfilled, (state, action) => {
        // Add message to current conversation
        state.messages.push(action.payload);
        
        // Update recent chats
        const chatIndex = state.recentChats.findIndex(chat => chat._id === state.activeConversation?._id);
        if (chatIndex !== -1) {
          state.recentChats[chatIndex].messages.push(action.payload);
          state.recentChats[chatIndex].lastMessage = action.payload.createdAt;
          
          // Move to top
          const conversation = state.recentChats.splice(chatIndex, 1)[0];
          state.recentChats.unshift(conversation);
        }
        
        // Clear draft for this chat
        if (state.activeConversation) {
          delete state.drafts[state.activeConversation._id];
        }
      })

      // Add Reaction
      .addCase(addReaction.fulfilled, (state, action) => {
        const messageIndex = state.messages.findIndex(msg => msg._id === action.payload._id);
        if (messageIndex !== -1) {
          state.messages[messageIndex] = action.payload;
        }
      })

      // Remove Reaction
      .addCase(removeReaction.fulfilled, (state, action) => {
        const { messageId, emoji } = action.payload;
        const messageIndex = state.messages.findIndex(msg => msg._id === messageId);
        if (messageIndex !== -1) {
          state.messages[messageIndex].reactions = state.messages[messageIndex].reactions.filter(
            reaction => !(reaction.emoji === emoji)
          );
        }
      })

      // Archive Chat
      .addCase(archiveChat.fulfilled, (state, action) => {
        const chatId = action.payload;
        state.recentChats = state.recentChats.filter(chat => chat._id !== chatId);
        if (state.activeConversation?._id === chatId) {
          state.activeConversation = null;
          state.messages = [];
        }
      })

      // Unarchive Chat
      .addCase(unarchiveChat.fulfilled, () => {
        // Chat will be re-added when user fetches recent chats
      })

      // Delete Chat
      .addCase(deleteChat.fulfilled, (state, action) => {
        const chatId = action.payload;
        state.recentChats = state.recentChats.filter(chat => chat._id !== chatId);
        if (state.activeConversation?._id === chatId) {
          state.activeConversation = null;
          state.messages = [];
        }
      });
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
  clearSearchResults,
  clearChatState,
} = chatSlice.actions;

export default chatSlice.reducer; 