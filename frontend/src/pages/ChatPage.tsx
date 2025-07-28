import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

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

interface Notification {
  id: string;
  message: string;
  type: 'system' | 'user';
  timestamp: number;
}

interface UserProfile {
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
}

interface Conversation {
  _id: string;
  participants: UserProfile[];
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

// --- Components ---
const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-gray-900">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
    <p className="ml-4 text-blue-500">Loading chat...</p>
  </div>
);

const ReactionPicker: React.FC<{
  onSelect: (emoji: string) => void;
  onClose: () => void;
  position: { x: number; y: number };
}> = ({ onSelect, onClose, position }) => {
  const emojis = ['👍', '❤️', '😂', '😮', '😢', '🙏', '🔥', '🎉'];
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div
      ref={pickerRef}
      className="absolute bg-white dark:bg-gray-700 p-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 z-50 flex flex-wrap gap-1"
      style={{ top: position.y, left: position.x }}
    >
      {emojis.map((emoji) => (
        <button
          key={emoji}
          className="p-1 text-xl hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors duration-200"
          onClick={() => onSelect(emoji)}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
};

const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <div className="p-4 overflow-y-auto flex-1 custom-scrollbar">{children}</div>
      </div>
    </div>
  );
};

// --- Main ChatPage Component ---
// Constants - moved outside component to prevent recreation
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const ChatPage: React.FC = () => {
  // --- State ---
  const [socket, setSocket] = useState<Socket | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessageText, setNewMessageText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showReactionPicker, setShowReactionPicker] = useState<{
    messageId: string;
    position: { x: number; y: number };
  } | null>(null);
  const [selectedMediaFile, setSelectedMediaFile] = useState<File | null>(null);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [showUserSearchModal, setShowUserSearchModal] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [profileSettings, setProfileSettings] = useState({
    showLastSeen: true,
    showOnlineStatus: true,
  });
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { token, user } = useSelector((state: RootState) => state.auth);
  
  console.log('API_BASE:', API_BASE);
  console.log('SOCKET_URL:', SOCKET_URL);
  
  // Memoize axios instance to prevent recreation
  const axiosAuth = useMemo(() => axios.create({
    baseURL: API_BASE,
    headers: { Authorization: token ? `Bearer ${token}` : '' },
  }), [token]);

  // --- Socket.IO Connection ---
  useEffect(() => {
    if (!token || !user) {
      setLoading(false);
      return;
    }

    // Prevent multiple connections
    if (socket && socket.connected) {
      console.log('Socket already connected, skipping new connection');
      return;
    }

    console.log('Attempting to connect to Socket.IO at:', SOCKET_URL);
    console.log('Token available:', !!token);

    const newSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    });

    newSocket.on('connect', () => {
      console.log('Socket connected successfully:', newSocket.id);
      setLoading(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setLoading(false);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    newSocket.on('newMessage', (data: { chatId: string; message: Message }) => {
      console.log('New message received:', data);
      if (activeConversation?._id === data.chatId) {
        setMessages(prev => [...prev, data.message]);
      }
      // Update conversation list
      fetchConversations();
    });

    newSocket.on('reactionUpdate', (data: { chatId: string; messageId: string; message: Message }) => {
      console.log('Reaction update received:', data);
      if (activeConversation?._id === data.chatId) {
        setMessages(prev => prev.map(msg => 
          msg._id === data.messageId ? data.message : msg
        ));
      }
    });

    newSocket.on('user-typing', (data: { userId: string; userName: string; isTyping: boolean }) => {
      // Handle typing indicators
      console.log('User typing:', data);
    });

    setSocket(newSocket);

    return () => {
      console.log('Cleaning up Socket.IO connection');
      newSocket.close();
    };
  }, [token, user]); // Removed SOCKET_URL since it's now a constant

  // --- Fetch Conversations ---
  const fetchConversations = async () => {
    try {
      const response = await axiosAuth.get('/chat');
      setConversations(response.data.data);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    }
  };

  // --- Fetch Messages ---
  const fetchMessages = async (chatId: string) => {
    try {
      const response = await axiosAuth.get(`/chat/${chatId}/messages`);
      setMessages(response.data.data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  // --- Load Conversations on Mount ---
  useEffect(() => {
    if (socket && socket.connected) {
      fetchConversations();
    }
  }, [socket]);

  // --- Cleanup on unmount ---
  useEffect(() => {
    return () => {
      if (socket) {
        console.log('Component unmounting, closing socket connection');
        socket.close();
      }
    };
  }, [socket]);

  // --- User Search ---
  const handleUserSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      console.log('Searching for:', searchQuery);
      const results = await searchUsers(searchQuery);
      console.log('Search results:', results);
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
      setNotifications(prev => [...prev, {
        id: Date.now().toString(),
        message: 'Failed to search users. Please try again.',
        type: 'system',
        timestamp: Date.now()
      }]);
    } finally {
      setSearching(false);
    }
  };

  const searchUsers = async (query: string) => {
    if (!query.trim()) return [];
    try {
      console.log('Making search request to:', `${API_BASE}/users/search?query=${encodeURIComponent(query)}`);
      const res = await axiosAuth.get(`/users/search?query=${encodeURIComponent(query)}`);
      console.log('Search response:', res.data);
      return res.data.data || [];
    } catch (error: any) {
      console.error('Search request failed:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      throw error;
    }
  };

  // --- Start New Conversation ---
  const handleStartNewChat = async (targetUser: any) => {
    try {
      const response = await axiosAuth.post('/chat/conversation', {
        participantId: targetUser._id
      });
      
      if (response.data.success) {
        const conversation = response.data.data;
        setActiveConversation(conversation);
        setMessages([]);
        setShowUserSearchModal(false);
        setSearchQuery('');
        setSearchResults([]);
        
        // Join the chat room
        if (socket) {
          socket.emit('join-chat', conversation._id);
        }
        
        // Fetch messages for this conversation
        await fetchMessages(conversation._id);
      }
    } catch (error) {
      console.error('Failed to start new chat:', error);
    }
  };

  // --- Send Message ---
  const sendMessage = async () => {
    if (!activeConversation || (!newMessageText.trim() && !selectedMediaFile)) return;

    try {
      let response;
      
      if (selectedMediaFile) {
        const formData = new FormData();
        formData.append('media', selectedMediaFile);
        if (newMessageText.trim()) {
          formData.append('content', newMessageText.trim());
        }
        
        response = await axiosAuth.post(`/chat/${activeConversation._id}/media`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setSelectedMediaFile(null);
      } else {
        response = await axiosAuth.post(`/chat/${activeConversation._id}/messages`, {
          content: newMessageText.trim(),
          messageType: 'text'
        });
      }

      if (response.data.success) {
        setNewMessageText('');
        // Message will be added via socket event
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setNotifications(prev => [...prev, {
        id: Date.now().toString(),
        message: 'Failed to send message. Please try again.',
        type: 'system',
        timestamp: Date.now()
      }]);
    }
  };

  // --- Handle File Selection ---
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedMediaFile(event.target.files[0]);
    }
  };

  const clearMediaSelection = () => {
    setSelectedMediaFile(null);
  };

  // --- Add Reaction ---
  const addReaction = async (messageId: string, emoji: string) => {
    try {
      await axiosAuth.post(`/chat/messages/${messageId}/react`, { emoji });
      setShowReactionPicker(null);
    } catch (error) {
      console.error('Failed to add reaction:', error);
    }
  };

  const handleReactionButtonClick = (messageId: string, event: React.MouseEvent<HTMLButtonElement>) => {
    const buttonRect = event.currentTarget.getBoundingClientRect();
    setShowReactionPicker({
      messageId,
      position: {
        x: buttonRect.right + window.scrollX - 200,
        y: buttonRect.top + window.scrollY - 150,
      },
    });
  };

  // --- Profile Picture Management ---
  const handleProfilePictureUpload = async () => {
    if (!profilePictureFile) return;
    setUploadingPicture(true);
    try {
      console.log('Uploading profile picture:', profilePictureFile.name);
      const response = await uploadProfilePicture(profilePictureFile);
      console.log('Upload response:', response);
      setProfilePictureFile(null);
      setShowProfileModal(false);
      setNotifications(prev => [...prev, {
        id: Date.now().toString(),
        message: 'Profile picture updated successfully!',
        type: 'system',
        timestamp: Date.now()
      }]);
    } catch (error) {
      console.error('Profile picture upload failed:', error);
      setNotifications(prev => [...prev, {
        id: Date.now().toString(),
        message: 'Failed to upload profile picture. Please try again.',
        type: 'system',
        timestamp: Date.now()
      }]);
    } finally {
      setUploadingPicture(false);
    }
  };

  const handleRemoveProfilePicture = async () => {
    try {
      await removeProfilePicture();
      setShowProfileModal(false);
      setNotifications(prev => [...prev, {
        id: Date.now().toString(),
        message: 'Profile picture removed successfully!',
        type: 'system',
        timestamp: Date.now()
      }]);
    } catch (error) {
      console.error('Profile picture removal failed:', error);
      setNotifications(prev => [...prev, {
        id: Date.now().toString(),
        message: 'Failed to remove profile picture. Please try again.',
        type: 'system',
        timestamp: Date.now()
      }]);
    }
  };

  const uploadProfilePicture = async (file: File) => {
    const formData = new FormData();
    formData.append('profilePicture', file);
    const res = await axiosAuth.put('/users/profile-picture', formData);
    return res.data.data;
  };

  const removeProfilePicture = async () => {
    await axiosAuth.delete('/users/profile-picture');
  };

  // --- Privacy Settings ---
  const handlePrivacySettingsUpdate = async () => {
    try {
      await updatePrivacySettings(profileSettings);
      setShowProfileModal(false);
      setNotifications(prev => [...prev, {
        id: Date.now().toString(),
        message: 'Privacy settings updated successfully!',
        type: 'system',
        timestamp: Date.now()
      }]);
    } catch (error) {
      console.error('Privacy settings update failed:', error);
      setNotifications(prev => [...prev, {
        id: Date.now().toString(),
        message: 'Failed to update privacy settings. Please try again.',
        type: 'system',
        timestamp: Date.now()
      }]);
    }
  };

  const updatePrivacySettings = async (settings: { showLastSeen?: boolean; showOnlineStatus?: boolean }) => {
    await axiosAuth.put('/users/privacy-settings', settings);
  };

  // --- Theme Toggle ---
  useEffect(() => {
    const root = window.document.documentElement;
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    root.classList.remove(isDark ? 'light' : 'dark');
    root.classList.add(isDark ? 'dark' : 'light');
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => {
      if (prevTheme === 'light') return 'dark';
      if (prevTheme === 'dark') return 'system';
      return 'light';
    });
  };

  // --- Auto-scroll to bottom ---
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // --- Loading State ---
  if (loading) {
    return <LoadingSpinner />;
  }

  // --- UI ---
  const activeChatPartner = activeConversation?.participants.find(p => p._id !== user?._id);

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-inter">
      {/* Header */}
      <header className="bg-blue-600 dark:bg-blue-800 p-4 text-white shadow-md flex justify-between items-center rounded-b-lg">
        <h1 className="text-2xl font-bold">Realtime Chat</h1>
        {user && (
          <div className="text-sm flex items-center">
            Logged in as: <span className="font-semibold ml-1">{user.fullName}</span>
            <button onClick={() => setShowProfileModal(true)} className="ml-4 px-3 py-1 bg-blue-700 hover:bg-blue-800 rounded-md text-white text-sm">Profile</button>
            <button onClick={toggleTheme} className="ml-2 p-2 rounded-full bg-blue-700 hover:bg-blue-800 text-white">{theme === 'light' ? '☀️' : theme === 'dark' ? '🌙' : '⚙️'}</button>
          </div>
        )}
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel: Recent Chats & User Search */}
        <div className="w-1/3 max-w-xs bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Chats</h2>
            <button onClick={() => setShowUserSearchModal(true)} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm">New Chat</button>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {conversations.length === 0 ? (
              <p className="p-4 text-gray-500 dark:text-gray-400 text-center">No recent chats. Start a new one!</p>
            ) : (
              conversations.map((conv) => {
                const otherParticipant = conv.participants.find(p => p._id !== user?._id);
                const displayUserName = otherParticipant?.fullName || 'Unknown User';
                return (
                  <div 
                    key={conv._id} 
                    className={`flex items-center p-3 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 ${activeConversation?._id === conv._id ? 'bg-blue-100 dark:bg-blue-900' : ''}`} 
                    onClick={() => {
                      setActiveConversation(conv);
                      fetchMessages(conv._id);
                      if (socket) {
                        socket.emit('join-chat', conv._id);
                      }
                    }}
                  >
                    <img 
                      src={otherParticipant?.profilePicture?.url || `https://placehold.co/40x40/cccccc/000000?text=${displayUserName.charAt(0)}`} 
                      alt="Profile" 
                      className="w-10 h-10 rounded-full object-cover mr-3" 
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 dark:text-gray-100">
                        <span>{displayUserName}</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {conv.messages.length > 0 ? conv.messages[conv.messages.length - 1].content : 'No messages yet.'}
                      </p>
                      {conv.lastMessage && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {new Date(conv.lastMessage).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Panel: Active Chat Window */}
        <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900">
          {!activeConversation ? (
            <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400 text-lg">
              Select a chat or start a new one.
            </div>
          ) : (
            <>
              {/* Active Chat Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800 shadow-sm">
                <div className="flex items-center">
                  <img 
                    src={activeChatPartner?.profilePicture?.url || `https://placehold.co/40x40/cccccc/000000?text=${activeChatPartner?.fullName?.charAt(0) || '?'}`} 
                    alt="Profile" 
                    className="w-10 h-10 rounded-full object-cover mr-3" 
                  />
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {activeChatPartner?.fullName || 'Chat'}
                    </h2>
                    {activeChatPartner?.showLastSeen && activeChatPartner.lastSeen && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Last seen: {new Date(activeChatPartner.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => setActiveConversation(null)} 
                    className="px-3 py-1 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md text-sm dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100"
                  >
                    Exit Chat
                  </button>
                </div>
              </div>

              {/* Chat messages area */}
              <div ref={chatContainerRef} className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar" style={{ scrollBehavior: 'smooth' }}>
                {messages.length === 0 ? (
                  <p className="text-center text-gray-500 dark:text-gray-400">No messages in this chat yet. Start typing!</p>
                ) : (
                  messages.map((message) => {
                    const isMyMessage = message.senderId._id === user?._id;
                    const messageTime = new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    
                    return (
                      <div key={message._id} className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                        <div className={`relative max-w-xs lg:max-w-md p-3 rounded-lg shadow-md ${isMyMessage ? 'bg-blue-500 text-white rounded-br-none' : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none'}`}>
                          {!isMyMessage && (
                            <div className="font-semibold text-sm mb-1">{message.senderId.fullName}</div>
                          )}
                          
                          {message.type === 'image' ? (
                            <img src={`${API_BASE}${message.fileUrl}`} alt="Chat Media" className="chat-media-content" />
                          ) : message.type === 'video' ? (
                            <video src={`${API_BASE}${message.fileUrl}`} controls className="chat-media-content" />
                          ) : (
                            <p className="break-words">{message.content}</p>
                          )}
                          
                          <div className={`text-xs mt-1 ${isMyMessage ? 'text-blue-200' : 'text-gray-500 dark:text-gray-400'} flex justify-between items-center`}>
                            <span>{messageTime}</span>
                            <button 
                              onClick={(e) => handleReactionButtonClick(message._id, e)} 
                              className={`ml-2 p-1 rounded-full hover:bg-opacity-20 transition-colors duration-200 ${isMyMessage ? 'hover:bg-blue-200' : 'hover:bg-gray-300 dark:hover:bg-gray-600'}`} 
                              title="React to message"
                            >
                              😊
                            </button>
                          </div>
                          
                          {message.reactions && message.reactions.length > 0 && (
                            <div className="absolute -bottom-2 -right-2 bg-gray-200 dark:bg-gray-800 rounded-full p-1 text-xs shadow-md flex items-center justify-center min-w-[24px] min-h-[24px]">
                              {Array.from(new Set(message.reactions.map(r => r.emoji))).map((emoji, index) => (
                                <span key={index}>{emoji}</span>
                              ))}
                              {message.reactions.length > 1 && (
                                <span className="ml-1 text-gray-600 dark:text-gray-400">{message.reactions.length}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                
                {notifications.map((notification) => (
                  <div key={notification.id} className="flex justify-center text-center text-gray-600 dark:text-gray-400 text-sm font-mono italic">
                    {notification.message}
                  </div>
                ))}
                
                {showReactionPicker && (
                  <ReactionPicker 
                    onSelect={(emoji) => addReaction(showReactionPicker.messageId, emoji)} 
                    onClose={() => setShowReactionPicker(null)} 
                    position={showReactionPicker.position} 
                  />
                )}
              </div>

              {/* Message input area */}
              <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center rounded-t-lg shadow-inner">
                {selectedMediaFile && (
                  <div className="media-preview-container p-2 border border-gray-300 dark:border-gray-600 rounded-lg mr-2 flex items-center">
                    {selectedMediaFile.type.startsWith('image/') && (
                      <img src={URL.createObjectURL(selectedMediaFile)} alt="Preview" className="h-16 w-16 object-cover rounded-md" />
                    )}
                    {selectedMediaFile.type.startsWith('video/') && (
                      <video src={URL.createObjectURL(selectedMediaFile)} controls className="h-16 w-16 object-cover rounded-md" />
                    )}
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 truncate max-w-[100px]">
                      {selectedMediaFile.name}
                    </span>
                    <button 
                      onClick={clearMediaSelection} 
                      className="ml-2 p-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-800 dark:text-red-300 dark:hover:bg-red-700 transition-colors duration-200" 
                      title="Remove media"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                  </div>
                )}
                
                <input 
                  type="text" 
                  className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100" 
                  placeholder={selectedMediaFile ? "Add a caption (optional)..." : "Type your message..."} 
                  value={newMessageText} 
                  onChange={(e) => setNewMessageText(e.target.value)} 
                  onKeyPress={(e) => { if (e.key === 'Enter') { sendMessage(); } }} 
                />
                
                <input type="file" id="media-upload-input" className="hidden" accept="image/*,video/*" onChange={handleFileChange} />
                <label 
                  htmlFor="media-upload-input" 
                  className="ml-2 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-200" 
                  title="Upload media"
                >
                  <svg className="w-6 h-6 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.414a4 4 0 00-5.656-5.656l-6.415 6.415a6 6 0 108.486 8.486L20.5 13.5"></path>
                  </svg>
                </label>
                
                <button 
                  onClick={sendMessage} 
                  disabled={newMessageText.trim() === '' && !selectedMediaFile} 
                  className="ml-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition-colors duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Profile Modal */}
      <Modal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} title="Profile Settings">
        <div className="space-y-6">
          {/* Profile Picture Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Profile Picture</h3>
            <div className="flex items-center space-x-4">
              <img 
                src={user?.profilePicture?.url || `https://placehold.co/80x80/cccccc/000000?text=${user?.fullName?.charAt(0) || 'U'}`} 
                alt="Profile" 
                className="w-20 h-20 rounded-full object-cover border-2 border-gray-300 dark:border-gray-600" 
              />
              <div className="flex flex-col space-y-2">
                <input 
                  type="file" 
                  id="profile-picture-input" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={(e) => setProfilePictureFile(e.target.files?.[0] || null)} 
                />
                <label 
                  htmlFor="profile-picture-input" 
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md cursor-pointer text-center text-sm"
                >
                  Upload New Picture
                </label>
                {profilePictureFile && (
                  <button 
                    onClick={handleProfilePictureUpload}
                    disabled={uploadingPicture}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm disabled:opacity-50"
                  >
                    {uploadingPicture ? 'Uploading...' : 'Save Picture'}
                  </button>
                )}
                <button 
                  onClick={handleRemoveProfilePicture}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm"
                >
                  Remove Picture
                </button>
              </div>
            </div>
          </div>

          {/* Privacy Settings Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Privacy Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">Show Last Seen</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Allow others to see when you were last active</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={profileSettings.showLastSeen}
                    onChange={(e) => setProfileSettings(prev => ({ ...prev, showLastSeen: e.target.checked }))}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">Show Online Status</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Show others when you are online</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={profileSettings.showOnlineStatus}
                    onChange={(e) => setProfileSettings(prev => ({ ...prev, showOnlineStatus: e.target.checked }))}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button 
              onClick={() => setShowProfileModal(false)}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              Cancel
            </button>
            <button 
              onClick={handlePrivacySettingsUpdate}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
            >
              Save Settings
            </button>
          </div>
        </div>
      </Modal>

      {/* New Chat Modal */}
      <Modal isOpen={showUserSearchModal} onClose={() => setShowUserSearchModal(false)} title="Start New Chat">
        <div className="space-y-4">
          {/* Search Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Users
            </label>
            <div className="flex space-x-2">
              <input 
                type="text" 
                placeholder="Search by name, email, or user ID..." 
                className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => { if (e.key === 'Enter') handleUserSearch(); }}
              />
              <button 
                onClick={handleUserSearch}
                disabled={searching}
                className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
              >
                {searching ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>

          {/* Search Results */}
          <div className="max-h-64 overflow-y-auto">
            {searchResults.length === 0 && searchQuery && !searching ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-4">No users found</p>
            ) : searchResults.length > 0 ? (
              <div className="space-y-2">
                {searchResults.map((user) => (
                  <div 
                    key={user._id} 
                    className="flex items-center p-3 border-b border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                    onClick={() => handleStartNewChat(user)}
                  >
                    <img 
                      src={user.profilePicture?.url || `https://placehold.co/40x40/cccccc/000000?text=${user.fullName?.charAt(0) || 'U'}`} 
                      alt="Profile" 
                      className="w-10 h-10 rounded-full object-cover mr-3" 
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{user.fullName}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{user.role}</p>
                    </div>
                    <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm">
                      Chat
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          {/* Close Button */}
          <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
            <button 
              onClick={() => {
                setShowUserSearchModal(false);
                setSearchQuery('');
                setSearchResults([]);
              }}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ChatPage; 