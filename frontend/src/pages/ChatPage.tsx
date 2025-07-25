// --- FULL CHAT PAGE IMPLEMENTATION ---
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAppSelector } from '../hooks/useAppSelector';
import apiClient from '../services/api';
import io, { Socket } from 'socket.io-client';
// Replace the old emoji-mart imports with the new @emoji-mart/react imports
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import Modal from '../components/Modal';
import { Search } from 'lucide-react';
import { User, Chat, Message } from '../types/chat';

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
  const [chats, setChats] = useState<Chat[]>([]);
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
  const [archivedChats, setArchivedChats] = useState<string[]>([]);
  const [showArchive, setShowArchive] = useState<boolean>(false);
  const [mutedChats, setMutedChats] = useState<string[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);

  // --- Socket.IO Setup ---
  useEffect(() => {
    if (!user) return;
    const s = io(SOCKET_URL, {
      auth: { token: localStorage.getItem('accessToken') },
      // transports: ['websocket'], // Allow fallback transports in dev
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
      const res = await apiClient.get('/chat');
      setChats(res.data.data || []);
      setLoading(false);
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        setError('Chat API not found. Please ensure your backend is running and /api/v1/chat is registered.');
      } else {
        setError('Failed to load chats.');
      }
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchChats(); }, [fetchChats]);

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
    if (selectedChatId) fetchMessages(selectedChatId);
    else setMessages([]);
  }, [selectedChatId, fetchMessages]);

  // --- Real-time Events ---
  useEffect(() => {
    if (!socket) return;
    socket.on('newMessage', ({ chatId, message }) => {
      if (chatId === selectedChatId) setMessages((msgs) => [...msgs, message]);
      fetchChats();
    });
    socket.on('messageDelivered', fetchChats);
    socket.on('messageRead', fetchChats);
    return () => {
      socket.off('newMessage');
      socket.off('messageDelivered');
      socket.off('messageRead');
    };
  }, [socket, selectedChatId, fetchChats]);

  // --- Scroll to bottom on new messages ---
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // --- Send Message ---
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedChatId) return;
    try {
      await apiClient.post(`/chat/${selectedChatId}/messages`, { content: messageText, type: 'text' });
      setMessageText('');
      setShowEmojiPicker(false);
      setIsTyping(false);
      fetchMessages(selectedChatId);
      fetchChats();
    } catch (error: any) {
      setError('Failed to send message.');
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
      setArchivedChats([...archivedChats, selectedChatId]);
      setSelectedChatId(null);
      fetchChats();
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
      await apiClient.post(`/chat/messages/${messageId}/react`, { emoji });
      fetchMessages(selectedChatId!);
    } catch (error: any) {
      setError('Failed to react to message.');
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
      const existingIds = chats.flatMap(c => c.participants.map(p => p._id));
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

  // --- Block/Unblock, Mute, Archive/Unarchive Chat Features ---
  // Archive chat
  const handleUnarchiveChat = async (chatId: string) => {
    try {
      await apiClient.patch(`/chat/${chatId}/archive`, { unarchive: true });
      setArchivedChats(archivedChats.filter(id => id !== chatId));
      fetchChats();
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

  // Only show unarchived chats in main list
  const visibleChats = chats.filter(c => !archivedChats.includes(c._id));

  // --- Render ---
  return (
    <div className="min-h-screen bg-gray-100 font-inter flex flex-col">
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 shadow-lg flex justify-between items-center">
        <h1 className="text-3xl font-bold">Secure Messaging</h1>
        <div className="flex items-center space-x-4">
          {user && (
            <div className="flex items-center space-x-2">
              <img
                src={user.profilePicture || 'https://placehold.co/40x40/CCCCCC/FFFFFF?text=U'}
                alt={user.fullName}
                className="w-10 h-10 rounded-full border-2 border-white shadow-md"
              />
              <span className="text-lg font-medium">{user.fullName}</span>
            </div>
          )}
          <span className="text-sm bg-blue-700 px-3 py-1 rounded-full opacity-80">
            User ID: {user?._id || 'N/A'}
          </span>
          <button
            onClick={() => setShowUserSearch(true)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow-md transition-colors duration-200 flex items-center"
          >
            <Search className="h-5 w-5 mr-2" /> + New Chat
          </button>
        </div>
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
              className="w-full p-3 border border-gray-300 rounded-lg mb-4"
            />
            {searchLoading && <div className="text-center py-4">Searching...</div>}
            {searchError && <div className="text-red-500 text-center py-2">{searchError}</div>}
            <div className="max-h-60 overflow-y-auto">
              {userSearchResults.map((user) => (
                <div
                  key={user._id}
                  onClick={() => handleStartChatWithUser(user._id)}
                  className="flex items-center p-3 hover:bg-gray-100 cursor-pointer rounded-lg border-b"
                >
                  <img
                    src={user.profilePicture || 'https://placehold.co/40x40/CCCCCC/FFFFFF?text=U'}
                    alt={user.fullName}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <div>
                    <div className="font-medium">{user.fullName}</div>
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
      <div className="flex-1 flex">
        {/* Chat List */}
        <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold mb-2">Conversations</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowArchive(false)}
                className={`px-3 py-1 rounded ${!showArchive ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              >
                Active
              </button>
              <button
                onClick={() => setShowArchive(true)}
                className={`px-3 py-1 rounded ${showArchive ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
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
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                    selectedChatId === chat._id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
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
                          src={chat.participants[0]?.profilePicture || 'https://placehold.co/48x48/CCCCCC/FFFFFF?text=U'}
                          alt={chat.participants[0]?.fullName}
                          className="w-12 h-12 rounded-full"
                        />
                      )}
                      <div className="flex-1">
                        <div className="font-medium">
                          {chat.isGroupChat ? chat.groupName : chat.participants[0]?.fullName}
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
        <div className="flex-1 flex flex-col">
          {selectedChatId ? (
            <>
              {/* Chat Header */}
              <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {(() => {
                    const chat = chats.find(c => c._id === selectedChatId);
                    if (!chat) return null;
                    return chat.isGroupChat ? (
                      <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                        {chat.groupName?.charAt(0) || 'G'}
                      </div>
                    ) : (
                      <img
                        src={chat.participants[0]?.profilePicture || 'https://placehold.co/40x40/CCCCCC/FFFFFF?text=U'}
                        alt={chat.participants[0]?.fullName}
                        className="w-10 h-10 rounded-full"
                      />
                    );
                  })()}
                  <div>
                    <div className="font-medium">
                      {(() => {
                        const chat = chats.find(c => c._id === selectedChatId);
                        return chat?.isGroupChat ? chat.groupName : chat?.participants[0]?.fullName;
                      })()}
                    </div>
                    <div className="text-sm text-gray-500">
                      {isTyping ? 'Typing...' : 'Online'}
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

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loading ? (
                  <div className="text-center py-8">Loading messages...</div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No messages yet</div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message._id}
                      className={`flex ${message.senderId === user?._id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.senderId === user?._id
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-800'
                        }`}
                      >
                        <div className="text-sm font-medium mb-1">
                          {message.senderName}
                        </div>
                        <div className="text-sm">{message.content}</div>
                        <div className="text-xs opacity-75 mt-1">
                          {formatTimestamp(message.timestamp)}
                        </div>
                        {message.reactions && message.reactions.length > 0 && (
                          <div className="flex space-x-1 mt-2">
                            {message.reactions.map((reaction, index) => (
                              <span key={index} className="text-xs bg-white bg-opacity-20 px-1 rounded">
                                {reaction.emoji}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="bg-white border-t border-gray-200 p-4">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Type a message..."
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {showEmojiPicker && (
                      <div ref={emojiPickerRef} className="absolute bottom-full right-0 mb-2">
                        <Picker
                          data={data}
                          onEmojiSelect={handleEmojiSelect}
                          theme="light"
                          set="native"
                        />
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-3 hover:bg-gray-100 rounded-lg"
                  >
                    😊
                  </button>
                  <button
                    type="submit"
                    disabled={!messageText.trim()}
                    className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send
                  </button>
                </form>
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