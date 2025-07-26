// --- FULL CHAT PAGE IMPLEMENTATION ---
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAppSelector } from '../hooks/useAppSelector';
import apiClient from '../services/api';
import io, { Socket } from 'socket.io-client';
// Replace the old emoji-mart imports with the new @emoji-mart/react imports
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import Modal from '../components/Modal';
import { Search, Settings, Check, CheckCheck, Paperclip, Send, Smile } from 'lucide-react';
import { User, Chat, Message } from '../types/chat';
import { MessageItem } from '../components/chat/MessageItem';
import UserSettingsModal from '../components/chat/UserSettingsModal';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// Helper to format time
const formatTimestamp = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Emoji reactions (quick)
const emojiReactions = ['👍', '❤️', '😂', '😢', '👏', '🔥'];

// --- Main ChatPage Component ---
const ChatPage: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [activeChats, setActiveChats] = useState<Chat[]>([]);
  const [archivedChats, setArchivedChats] = useState<Chat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [messageText, setMessageText] = useState<string>('');
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalContent, setModalContent] = useState<any>({});
  const [isSelectionMode, setIsSelectionMode] = useState<boolean>(false);
  const [selectedMessagesForDeletion, setSelectedMessagesForDeletion] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const emojiPickerRef = useRef<HTMLDivElement | null>(null);
  const [showUserSearch, setShowUserSearch] = useState<boolean>(false);
  const [userSearchQuery, setUserSearchQuery] = useState<string>('');
  const [userSearchResults, setUserSearchResults] = useState<User[]>([]);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [showArchive, setShowArchive] = useState<boolean>(false);
  const [mutedChats, setMutedChats] = useState<string[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [userStatus, setUserStatus] = useState<any>({});
  const [typingUsers, setTypingUsers] = useState<{[key: string]: string[]}>({});
  
  // New state for enhanced features
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    message: string;
    type: 'system' | 'user';
    timestamp: number;
  }>>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mediaUploading, setMediaUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper function to get the other participant in a chat (not the current user)
  const getOtherParticipant = (chat: any): User | null => {
    if (!chat || !chat.participants || chat.participants.length === 0) return null;
    if (chat.isGroupChat) return null; // For group chats, we'll handle differently
    
    // Find the participant that is not the current user
    const otherParticipant = chat.participants.find((participant: User) => 
      participant._id !== user?._id
    );
    
    return otherParticipant || chat.participants[0]; // Fallback to first participant if not found
  };

  // --- Socket.IO Setup ---
  useEffect(() => {
    if (!user) return;
    const s = io(SOCKET_URL, {
      auth: { token: localStorage.getItem('accessToken') },
      transports: ['websocket', 'polling'], // Allow fallback transports
    });
    s.on('connect', () => console.log('Socket.IO connected:', s.id));
    s.on('disconnect', (reason) => console.log('Socket.IO disconnected:', reason));
    s.on('connect_error', (err) => console.error('Socket.IO connect_error:', err));
    setSocket(s);
    return () => {
      s.disconnect();
    };
  }, [user]);

  // --- Fetch Chats ---
  const fetchChats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/chat'); // Fetches ALL chats
      const allChats = res.data.data || [];

      // Filter chats on the frontend
      const active = allChats.filter((chat: Chat) => !chat.isArchived);
      const archived = allChats.filter((chat: Chat) => chat.isArchived);

      setActiveChats(active);
      setArchivedChats(archived);
      setLoading(false);
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        setError('Chat API not found. Please ensure your backend is running and /api/v1/chat is registered.');
      } else {
        setError('Failed to load chats.');
      }
      setLoading(false);
    }
  }, [user]); // The only dependency should be `user`

  useEffect(() => { fetchChats(); }, [fetchChats]);

  // Update user online status when component mounts
  useEffect(() => {
    if (user) {
      updateUserStatus();
    }
  }, [user]);

  // Fetch user status for chat participants
  useEffect(() => {
    if (selectedChatId && user) {
      const chat = [...activeChats, ...archivedChats].find(c => c._id === selectedChatId);
      if (chat && !chat.isGroupChat) {
        const otherUser = getOtherParticipant(chat);
        if (otherUser) {
          fetchUserStatus(otherUser._id);
        }
      }
    }
  }, [selectedChatId, activeChats, archivedChats, user]);

  // Mark messages as read when chat is selected
  useEffect(() => {
    if (selectedChatId && messages.length > 0) {
      const unreadMessages = messages.filter(
        msg => msg.senderId !== user?._id && !(msg as any).readBy?.some((read: any) => read.userId === user?._id)
      );
      if (unreadMessages.length > 0) {
        const messageIds = unreadMessages.map(msg => msg._id);
        markMessagesAsRead(selectedChatId, messageIds);
      }
    }
  }, [selectedChatId, messages, user]);

  // --- Fetch Messages ---
  const fetchMessages = useCallback(async (chatId: string) => {
    if (!chatId) return;
    setLoading(true);
    try {
      const res = await apiClient.get(`/chat/${chatId}/messages`);
      setMessages(res.data.data || []);
      setLoading(false);
    } catch (error: any) {
      setError('Failed to load messages.');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedChatId) {
      fetchMessages(selectedChatId);
      // Join chat room for real-time updates
      if (socket) {
        socket.emit('join-chat', selectedChatId);
      }
    } else {
      setMessages([]);
    }
    
    // Cleanup: leave previous chat room
    return () => {
      if (socket && selectedChatId) {
        socket.emit('leave-chat', selectedChatId);
      }
    };
  }, [selectedChatId, fetchMessages, socket]);

  // --- Real-time Events ---
  useEffect(() => {
    if (!socket) return;
    
    const handleNewMessage = ({ chatId, message }: { chatId: string, message: Message }) => {
      if (chatId === selectedChatId) {
        setMessages((prev) => [...prev, message]);
      }
      fetchChats(); // Refresh chat list for last message preview
    };

    const handleReactionUpdate = ({ chatId, messageId, message }: { chatId: string, messageId: string, message: Message }) => {
      if (chatId === selectedChatId) {
        setMessages(prevMessages =>
          prevMessages.map(msg =>
            msg._id === messageId ? message : msg
          )
        );
      }
    };

    const updateMessageStatus = ({ messageId, status }: { messageId: string; status: 'delivered' | 'read' }) => {
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg._id === messageId ? { ...msg, status: status } : msg
        )
      );
    };

    const handleUserTyping = ({ userId, userName, isTyping }: { userId: string, userName: string, isTyping: boolean }) => {
      setTypingUsers(prev => ({
        ...prev,
        [selectedChatId!]: isTyping ? [...(prev[selectedChatId!] || []), userName] : (prev[selectedChatId!] || []).filter(name => name !== userName)
      }));
    };

    socket.on('newMessage', handleNewMessage);
    socket.on('reactionUpdate', handleReactionUpdate);
    socket.on('messageStatusUpdate', updateMessageStatus);
    socket.on('user-typing', handleUserTyping);

    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('reactionUpdate', handleReactionUpdate);
      socket.off('messageStatusUpdate', updateMessageStatus);
      socket.off('user-typing', handleUserTyping);
    };
  }, [socket, selectedChatId, fetchChats]);

  // --- Scroll to bottom on new messages ---
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // --- Send Message ---
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedChatId || !socket) return;
    
    // Optimistic UI update
    const tempMessage: Message = {
      _id: `temp-${Date.now()}`,
      chatId: selectedChatId,
      senderId: user!._id,
      senderName: user!.fullName,
      content: messageText,
      messageType: 'text',
      timestamp: new Date().toISOString(),
      status: 'sent',
      reactions: [],
    };
    setMessages(prev => [...prev, tempMessage]);
    
    try {
      await apiClient.post(`/chat/${selectedChatId}/messages`, { content: messageText, type: 'text' });
      setMessageText('');
      setShowEmojiPicker(false);
      setIsTyping(false);
      // Backend will confirm via socket, no need to fetch again here
    } catch (error: any) {
      setError('Failed to send message.');
      // Revert optimistic update on failure
      setMessages(prev => prev.filter(m => m._id !== tempMessage._id));
    }
  };

  // --- Emoji Picker ---
  const handleEmojiSelect = (emoji: { native: string }) => {
    setMessageText((prev) => prev + emoji.native);
  };

  // --- Archive/Exit Chat ---
  const handleArchiveChat = async () => {
    if (!selectedChatId) return;
    try {
      await apiClient.patch(`/chat/${selectedChatId}/archive`);
      // Move chat from active to archived
      const chatToArchive = activeChats.find(c => c._id === selectedChatId);
      if (chatToArchive) {
        const updatedChat = { ...chatToArchive, isArchived: true };
        setActiveChats(activeChats.filter(c => c._id !== selectedChatId));
        setArchivedChats([...archivedChats, updatedChat]);
      }
      setSelectedChatId(null);
    } catch (error: any) {
      setError('Failed to archive chat.');
    }
  };

  // --- Delete Chat ---
  const handleDeleteChat = async () => {
    if (!selectedChatId) return;
    try {
      await apiClient.delete(`/chat/${selectedChatId}`, { data: { confirm: true } });
      setSelectedChatId(null);
      fetchChats();
    } catch (error: any) {
      setError('Failed to delete chat.');
    }
  };

  // --- Delete Selected Messages ---
  const handleDeleteSelectedMessages = async () => {
    if (selectedMessagesForDeletion.length === 0) return;
    try {
      await apiClient.delete(`/chat/${selectedChatId}/messages`, {
        data: { messageIds: selectedMessagesForDeletion }
      });
      setSelectedMessagesForDeletion([]);
      setIsSelectionMode(false);
      fetchMessages(selectedChatId!);
    } catch (error: any) {
      setError('Failed to delete messages.');
    }
  };

  // --- React to Message ---
  const handleReactToMessage = async (messageId: string, emoji: string) => {
    try {
      const response = await apiClient.post(`/chat/messages/${messageId}/react`, { emoji });
      
      // Update messages with the new reaction
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg._id === messageId ? response.data.data : msg
        )
      );

      // Create system notification for reaction
      const reactedMessage = messages.find(m => m._id === messageId);
      if (reactedMessage && (reactedMessage.senderId as any)?._id !== user?._id) {
        const notificationMessage = `${user?.fullName} reacted ${emoji} to a message`;
        const notificationId = `${messageId}-${user?._id}-${Date.now()}`;
        
        setNotifications(prev => [
          ...prev,
          {
            id: notificationId,
            message: notificationMessage,
            type: 'system',
            timestamp: Date.now()
          }
        ]);

        // Auto-remove notification after 5 seconds
        setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== notificationId));
        }, 5000);
      }
    } catch (error: any) {
      setError('Failed to react to message.');
    }
  };

  const handleRemoveReaction = async (messageId: string, emoji: string) => {
    try {
      await apiClient.delete(`/chat/messages/${messageId}/react`, { data: { emoji } });
      fetchMessages(selectedChatId!);
    } catch (error: any) {
      setError('Failed to remove reaction.');
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleMediaUpload = async () => {
    if (!selectedFile || !selectedChatId) return;

    setMediaUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('media', selectedFile);

      const response = await apiClient.post(`/chat/${selectedChatId}/media`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Add the new media message to the messages
      setMessages(prev => [...prev, response.data.data]);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to upload media');
    } finally {
      setMediaUploading(false);
    }
  };

  // --- Get Message Status ---
  const getMessageStatus = async (messageId: string) => {
    try {
      const res = await apiClient.get(`/chat/messages/${messageId}/status`);
      return res.data.data;
    } catch (error: any) {
      console.error('Failed to get message status:', error);
      return null;
    }
  };

  // --- Select Message for Deletion ---
  const handleSelectMessage = (messageId: string) => {
    setSelectedMessagesForDeletion(prev =>
      prev.includes(messageId)
        ? prev.filter(id => id !== messageId)
        : [...prev, messageId]
    );
  };

  // --- Toggle Selection Mode ---
  const handleToggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedMessagesForDeletion([]);
  };

  // --- User Search ---
  const handleUserSearch = async (query: string) => {
    setUserSearchQuery(query);
    if (!query.trim()) {
      setUserSearchResults([]);
      return;
    }
    setSearchLoading(true);
    setSearchError(null);
    try {
      const res = await apiClient.get(`/users/search?query=${encodeURIComponent(query)}`);
      // Exclude self and users already in a chat
      const existingIds = [...activeChats, ...archivedChats].flatMap(c => c.participants.map(p => p._id));
      setUserSearchResults((res.data.data || []).filter((u: User) => u._id !== user?._id && !existingIds.includes(u._id)));
      setSearchLoading(false);
    } catch (error: any) {
      setSearchError('Failed to search users.');
      setSearchLoading(false);
    }
  };

  // Start new chat with selected user
  const handleStartChatWithUser = async (userId: string) => {
    try {
      const res = await apiClient.post('/chat/conversation', { participantId: userId });
      setShowUserSearch(false);
      setUserSearchQuery('');
      setUserSearchResults([]);
      setSelectedChatId(res.data.data._id);
      fetchChats();
      setTimeout(() => {
        const chatListDiv = document.querySelector('.chat-list-scroll');
        if (chatListDiv) chatListDiv.scrollTop = 0;
      }, 200);
    } catch (error: any) {
      setError('Failed to start chat.');
    }
  };

  // Mark messages as delivered
  const markMessagesAsDelivered = async (chatId: string, messageIds: string[]) => {
    try {
      await apiClient.put(`/chat/${chatId}/messages/delivered`, { messageIds });
    } catch (error: any) {
      console.error('Failed to mark messages as delivered:', error);
    }
  };

  // Mark messages as read
  const markMessagesAsRead = async (chatId: string, messageIds: string[]) => {
    try {
      await apiClient.put(`/chat/${chatId}/messages/read`, { messageIds });
    } catch (error: any) {
      console.error('Failed to mark messages as read:', error);
    }
  };

  // Get user status
  const fetchUserStatus = async (userId: string) => {
    try {
      const res = await apiClient.get(`/users/${userId}/status`);
      setUserStatus((prev: any) => ({
        ...prev,
        [userId]: res.data.data
      }));
    } catch (error: any) {
      console.error('Failed to fetch user status:', error);
    }
  };

  // Update user status
  const updateUserStatus = async () => {
    try {
      await apiClient.put('/users/online-status', { isOnline: true });
    } catch (error: any) {
      console.error('Failed to update user status:', error);
    }
  };

  // --- Block/Unblock, Mute, Archive/Unarchive Chat Features ---
  // Archive chat
  const handleUnarchiveChat = async (chatId: string) => {
    try {
      await apiClient.patch(`/chat/${chatId}/unarchive`);
      // Move chat from archived to active
      const chatToUnarchive = archivedChats.find(c => c._id === chatId);
      if (chatToUnarchive) {
        const updatedChat = { ...chatToUnarchive, isArchived: false };
        setArchivedChats(archivedChats.filter(c => c._id !== chatId));
        setActiveChats([...activeChats, updatedChat]);
      }
    } catch (error: any) {
      setError('Failed to unarchive chat.');
    }
  };
  // Mute chat
  const handleMuteChat = (chatId: string) => {
    setMutedChats([...mutedChats, chatId]);
  };
  // Unmute chat
  const handleUnmuteChat = (chatId: string) => {
    setMutedChats(mutedChats.filter(id => id !== chatId));
  };
  // Block user
  const handleBlockUser = (userId: string) => {
    setBlockedUsers([...blockedUsers, userId]);
    setSelectedChatId(null);
  };
  // Unblock user
  const handleUnblockUser = (userId: string) => {
    setBlockedUsers(blockedUsers.filter(id => id !== userId));
  };

  // Get the current chat list based on showArchive state
  const visibleChats = showArchive ? archivedChats : activeChats;

  // Get message status icon
  const getMessageStatusIcon = (message: Message, isOwnMessage: boolean) => {
    if (!isOwnMessage) return null;
    
    switch (message.status) {
      case 'sent':
        return <Check className="w-4 h-4 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="w-4 h-4 text-gray-400" />;
      case 'read':
        return <CheckCheck className="w-4 h-4 text-blue-500" />;
      default:
        return <Check className="w-4 h-4 text-gray-400" />;
    }
  };

  // Format last seen time
  const formatLastSeen = (lastSeen: string) => {
    const now = new Date();
    const lastSeenDate = new Date(lastSeen);
    const diffInMinutes = Math.floor((now.getTime() - lastSeenDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  // --- Render ---
  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-inter">
      {/* Header */}
      <header className="bg-blue-600 dark:bg-blue-800 p-4 text-white shadow-md flex justify-between items-center rounded-b-lg">
        <h1 className="text-2xl font-bold">Realtime Chat</h1>
        {user && (
          <div className="text-sm flex items-center">
            Logged in as: <span className="font-semibold ml-1">{user.fullName}</span> (ID: {user._id?.substring(0, 8)}...)
            {typingUsers[selectedChatId!] && typingUsers[selectedChatId!].length > 0 && (
              <span className="ml-4 text-xs italic text-blue-200">
                {typingUsers[selectedChatId!].join(', ')} typing...
              </span>
            )}
          </div>
        )}
      </header>
      {/* User Search Modal */}
      {showUserSearch && (
        <Modal isOpen={showUserSearch} onClose={() => setShowUserSearch(false)} title="Start New Chat">
          <div className="p-4">
            <input
              type="text"
                      placeholder="Search users by name, email, or userId..."
              value={userSearchQuery}
                      onChange={(e) => handleUserSearch(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg mb-4 text-gray-900 bg-white/90 placeholder-gray-500 chat-search-input shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchLoading && <div className="text-center py-4">Searching...</div>}
            {searchError && <div className="text-red-500 text-center py-2">{searchError}</div>}
            <div className="max-h-60 overflow-y-auto">
              {userSearchResults.map((user) => (
                <div
                  key={user._id}
                  onClick={() => handleStartChatWithUser(user._id)}
                  className="flex items-center p-3 hover:bg-blue-50 cursor-pointer rounded-lg border-b border-gray-100 bg-white/90 backdrop-blur-sm transition-all duration-200"
                >
                                                    <img
                    src={(user as any).profilePicture?.filename 
                      ? `http://localhost:5000/uploads/profile-pictures/${(user as any).profilePicture.filename}`
                      : 'https://placehold.co/40x40/CCCCCC/FFFFFF?text=U'}
                    alt={user.fullName}
                    className="w-10 h-10 rounded-full mr-3 object-cover"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{user.fullName}</div>
                    <div className="text-sm text-gray-600">{user.email}</div>
                    <div className="text-xs text-gray-500">ID: {user.userId}</div>
                  </div>
                </div>
              ))}
          </div>
          </div>
        </Modal>
      )}

      {/* Main Chat Interface */}
      <div className="flex flex-1">
        {/* Chat List */}
        <div className="w-full md:w-1/3 lg:w-1/4 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Conversations</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowArchive(false)}
                className={`px-3 py-1 rounded text-sm ${!showArchive ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'}`}
              >
                Active
              </button>
              <button
                onClick={() => setShowArchive(true)}
                className={`px-3 py-1 rounded text-sm ${showArchive ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'}`}
              >
                Archived
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto chat-list-scroll">
            {loading ? (
              <div className="p-4 text-center">Loading chats...</div>
            ) : visibleChats.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No conversations yet</div>
            ) : (
              visibleChats.map((chat) => (
                <div
                  key={chat._id}
                  onClick={() => setSelectedChatId(chat._id)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-blue-50/50 transition-all duration-200 ${
                    selectedChatId === chat._id ? 'bg-blue-100/80 border-l-4 border-l-blue-500 shadow-sm' : 'bg-white/70'
                  }`}
                  >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {chat.isGroupChat ? (
                        <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                          {chat.groupName?.charAt(0) || 'G'}
                        </div>
                      ) : (
                        <img
                          src={(getOtherParticipant(chat) as any)?.profilePicture?.filename 
                            ? `http://localhost:5000/uploads/profile-pictures/${(getOtherParticipant(chat) as any)?.profilePicture.filename}`
                            : 'https://placehold.co/48x48/CCCCCC/FFFFFF?text=U'}
                          alt={getOtherParticipant(chat)?.fullName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 chat-user-name">
                          {chat.isGroupChat ? chat.groupName : getOtherParticipant(chat)?.fullName}
                        </div>
                        <div className="text-sm text-gray-600 truncate">
                          {chat.lastMessage?.content || 'No messages yet'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">
                        {chat.lastMessage?.timestamp ? formatTimestamp(chat.lastMessage.timestamp) : ''}
                      </div>
                      {chat.unreadCount > 0 && (
                        <div className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center mt-1">
                          {chat.unreadCount}
                      </div>
                    )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 flex flex-col bg-gradient-to-b from-blue-50/50 to-indigo-100/50">
          {selectedChatId ? (
            <>
              {/* Chat Header */}
              <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200 p-4 flex items-center justify-between shadow-lg">
                <div className="flex items-center space-x-3">
                  {(() => {
                    const chat = [...activeChats, ...archivedChats].find(c => c._id === selectedChatId);
                    if (!chat) return null;
                    return chat.isGroupChat ? (
                      <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                        {chat.groupName?.charAt(0) || 'G'}
                      </div>
                    ) : (
                      <img
                        src={(getOtherParticipant(chat) as any)?.profilePicture?.filename 
                          ? `http://localhost:5000/uploads/profile-pictures/${(getOtherParticipant(chat) as any)?.profilePicture.filename}`
                          : 'https://placehold.co/40x40/CCCCCC/FFFFFF?text=U'}
                        alt={getOtherParticipant(chat)?.fullName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    );
                  })()}
                  <div>
                    <div className="font-medium text-gray-900 chat-user-name">
                      {(() => {
                        const chat = [...activeChats, ...archivedChats].find(c => c._id === selectedChatId);
                        return chat?.isGroupChat ? chat.groupName : getOtherParticipant(chat)?.fullName;
                      })()}
                    </div>
                    <div className="text-sm text-gray-500">
                                              {isTyping ? 'Typing...' : (() => {
                          const chat = [...activeChats, ...archivedChats].find(c => c._id === selectedChatId);
                          if (!chat || chat.isGroupChat) return 'Online';
                          const otherUser = getOtherParticipant(chat);
                          if (!otherUser) return 'Online';
                          
                          const status = userStatus[otherUser._id];
                          if (status?.isOnline) return 'Online';
                          if (status?.lastSeen && (otherUser as any).preferences?.showLastSeen) {
                            return `Last seen ${formatLastSeen(status.lastSeen)}`;
                          }
                          return 'Offline';
                        })()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleToggleSelectionMode}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                    title="Select Messages"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  <button
                    onClick={handleArchiveChat}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                    title="Archive Chat"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-14 0h14" />
                    </svg>
                  </button>
                  <button
                    onClick={handleDeleteChat}
                    className="p-2 hover:bg-red-100 rounded-lg text-red-600"
                    title="Delete Chat"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Chat messages area */}
              <div
                ref={messagesEndRef}
                className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar"
                style={{ scrollBehavior: 'smooth' }}
              >
                {loading ? (
                  <div className="text-center py-8 text-gray-500">Loading messages...</div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No messages yet</div>
                ) : (
                  <>
                    {/* Messages */}
                    {messages.map((message) => (
                      <MessageItem 
                        key={message._id}
                        message={message}
                        currentUser={user}
                        onReact={handleReactToMessage}
                        onRemoveReaction={handleRemoveReaction}
                      />
                    ))}
                    
                    {/* System Notifications */}
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className="flex justify-center text-center text-gray-600 dark:text-gray-400 text-sm font-mono italic"
                      >
                        {notification.message}
                      </div>
                    ))}
                  </>
                )}
              </div>

              {/* Message input area */}
              <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center rounded-t-lg shadow-inner">
                {/* Media Preview */}
                {selectedFile && (
                  <div className="media-preview-container p-2 border border-gray-300 dark:border-gray-600 rounded-lg mr-2 flex items-center">
                    {selectedFile.type.startsWith('image/') && (
                      <img src={URL.createObjectURL(selectedFile)} alt="Preview" className="h-16 w-16 object-cover rounded-md" />
                    )}
                    {selectedFile.type.startsWith('video/') && (
                      <video src={URL.createObjectURL(selectedFile)} controls className="h-16 w-16 object-cover rounded-md" />
                    )}
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 truncate max-w-[100px]">{selectedFile.name}</span>
                    <button
                      onClick={() => setSelectedFile(null)}
                      className="ml-2 p-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-800 dark:text-red-300 dark:hover:bg-red-700 transition-colors duration-200"
                      title="Remove media"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                  </div>
                )}

                <input
                  type="text"
                  className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                  placeholder={selectedFile ? "Add a caption (optional)..." : "Type your message..."}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSendMessage(e as any);
                    }
                  }}
                  disabled={!!selectedFile && messageText.trim() === '' && !selectedFile}
                />
                
                {/* Hidden file input */}
                <input
                  type="file"
                  id="media-upload-input"
                  className="hidden"
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                />
                {/* Label acts as the clickable upload button */}
                <label
                  htmlFor="media-upload-input"
                  className="ml-2 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-200"
                  title="Upload media"
                >
                  <svg className="w-6 h-6 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.414a4 4 0 00-5.656-5.656l-6.415 6.415a6 6 0 108.486 8.486L20.5 13.5"></path></svg>
                </label>

                <button
                  onClick={handleSendMessage}
                  className="ml-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition-colors duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Send
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">💬</div>
                <h2 className="text-2xl font-semibold mb-2">Welcome to Secure Messaging</h2>
                <p className="text-gray-600 mb-4">Select a conversation or start a new chat to begin messaging</p>
            <button
                  onClick={() => setShowUserSearch(true)}
                  className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
            >
                  Start New Chat
            </button>
          </div>
            </div>
          )}
        </div>
      </div>

      {/* User Settings Modal */}
      <UserSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        user={user}
        onUpdate={() => {
          // Refresh user data
          window.location.reload();
        }}
      />

      {/* Error Display */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-4 text-white hover:text-gray-200"
          >
            ×
          </button>
          </div>
      )}
    </div>
  );
};

export default ChatPage; 