import api from './api';

export interface Message {
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

export interface Conversation {
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

export interface User {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  profilePicture?: {
    url?: string;
    filename?: string;
  };
}

// Chat Service
class ChatService {
  // Get all recent chats for the current user
  async getRecentChats(showArchived = false): Promise<Conversation[]> {
    try {
      const response = await api.get(`/chat?showArchived=${showArchived}`);
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to fetch recent chats:', error);
      throw new Error('Failed to load recent chats');
    }
  }

  // Search for users to start a conversation with
  async searchUsers(query: string): Promise<User[]> {
    try {
      if (!query.trim()) return [];
      
      const response = await api.get(`/users/search?query=${encodeURIComponent(query.trim())}`);
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to search users:', error);
      throw new Error('Failed to search users');
    }
  }

  // Create or get a conversation with another user
  async createOrGetConversation(participantId: string): Promise<Conversation> {
    try {
      const response = await api.post('/chat/conversation', { participantId });
      return response.data.data;
    } catch (error) {
      console.error('Failed to create/get conversation:', error);
      throw new Error('Failed to start conversation');
    }
  }

  // Touch a conversation (create if doesn't exist, update if it does)
  async touchConversation(participantId: string): Promise<Conversation> {
    try {
      const response = await api.post('/chat/touch-conversation', { participantId });
      return response.data.data;
    } catch (error) {
      console.error('Failed to touch conversation:', error);
      throw new Error('Failed to touch conversation');
    }
  }

  // Get messages for a specific chat
  async getMessages(chatId: string): Promise<Message[]> {
    try {
      const response = await api.get(`/chat/${chatId}/messages`);
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      throw new Error('Failed to load messages');
    }
  }

  // Send a text message
  async sendMessage(chatId: string, content: string): Promise<Message> {
    try {
      const response = await api.post(`/chat/${chatId}/messages`, {
        content: content.trim(),
        messageType: 'text'
      });
      return response.data.data;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw new Error('Failed to send message');
    }
  }

  // Send a media message
  async sendMediaMessage(chatId: string, file: File, content?: string): Promise<Message> {
    try {
      const formData = new FormData();
      formData.append('media', file);
      if (content?.trim()) {
        formData.append('content', content.trim());
      }

      const response = await api.post(`/chat/${chatId}/media`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data.data;
    } catch (error) {
      console.error('Failed to send media message:', error);
      throw new Error('Failed to send media message');
    }
  }

  // Mark messages as delivered
  async markMessagesAsDelivered(chatId: string, messageIds: string[]): Promise<void> {
    try {
      await api.put(`/chat/${chatId}/messages/delivered`, { messageIds });
    } catch (error) {
      console.error('Failed to mark messages as delivered:', error);
    }
  }

  // Mark messages as read
  async markMessagesAsRead(chatId: string, messageIds: string[]): Promise<void> {
    try {
      await api.put(`/chat/${chatId}/messages/read`, { messageIds });
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
  }

  // Add reaction to a message
  async addReaction(messageId: string, emoji: string): Promise<Message> {
    try {
      const response = await api.post(`/chat/messages/${messageId}/react`, { emoji });
      return response.data.data;
    } catch (error) {
      console.error('Failed to add reaction:', error);
      throw new Error('Failed to add reaction');
    }
  }

  // Remove reaction from a message
  async removeReaction(messageId: string, emoji: string): Promise<void> {
    try {
      await api.delete(`/chat/messages/${messageId}/react`, { data: { emoji } });
    } catch (error) {
      console.error('Failed to remove reaction:', error);
      throw new Error('Failed to remove reaction');
    }
  }

  // Archive a chat
  async archiveChat(chatId: string): Promise<void> {
    try {
      await api.patch(`/chat/${chatId}/archive`);
    } catch (error) {
      console.error('Failed to archive chat:', error);
      throw new Error('Failed to archive chat');
    }
  }

  // Unarchive a chat
  async unarchiveChat(chatId: string): Promise<void> {
    try {
      await api.patch(`/chat/${chatId}/unarchive`);
    } catch (error) {
      console.error('Failed to unarchive chat:', error);
      throw new Error('Failed to unarchive chat');
    }
  }

  // Delete a chat
  async deleteChat(chatId: string): Promise<void> {
    try {
      await api.delete(`/chat/${chatId}`);
    } catch (error) {
      console.error('Failed to delete chat:', error);
      throw new Error('Failed to delete chat');
    }
  }

  // Get user profile for chat display
  async getUserProfile(userId: string): Promise<User> {
    try {
      const response = await api.get(`/users/${userId}`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to get user profile:', error);
      throw new Error('Failed to get user profile');
    }
  }

  // Update user privacy settings
  async updatePrivacySettings(settings: {
    showLastSeen?: boolean;
    showOnlineStatus?: boolean;
  }): Promise<void> {
    try {
      await api.put('/users/privacy-settings', settings);
    } catch (error) {
      console.error('Failed to update privacy settings:', error);
      throw new Error('Failed to update privacy settings');
    }
  }

  // Upload profile picture
  async uploadProfilePicture(file: File): Promise<User> {
    try {
      const formData = new FormData();
      formData.append('profilePicture', file);
      
      const response = await api.put('/users/profile-picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data.data;
    } catch (error) {
      console.error('Failed to upload profile picture:', error);
      throw new Error('Failed to upload profile picture');
    }
  }

  // Remove profile picture
  async removeProfilePicture(): Promise<void> {
    try {
      await api.delete('/users/profile-picture');
    } catch (error) {
      console.error('Failed to remove profile picture:', error);
      throw new Error('Failed to remove profile picture');
    }
  }
}

export default new ChatService(); 