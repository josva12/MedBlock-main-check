// --- FULL CHAT PAGE IMPLEMENTATION ---
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAppSelector } from '../hooks/useAppSelector';
import apiClient from '../services/api';
import io from 'socket.io-client';
import { Picker } from 'emoji-mart';
import 'emoji-mart/css/emoji-mart.css';
import Modal from '../components/Modal';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// Helper to format time
const formatTimestamp = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Emoji reactions (quick)
const emojiReactions = ['👍', '❤️', '😂', '😢', '👏', '🔥'];

// --- Main ChatPage Component ---
const ChatPage: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [chats, setChats] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({});
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedMessagesForDeletion, setSelectedMessagesForDeletion] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);
  const emojiPickerRef = useRef(null);

  // --- Socket.IO Setup ---
  useEffect(() => {
    if (!user) return;
    const s = io(SOCKET_URL, {
      auth: { token: localStorage.getItem('accessToken') },
      transports: ['websocket'],
    });
    setSocket(s);
    return () => s.disconnect();
  }, [user]);

  // --- Fetch Chats ---
  const fetchChats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/chats');
      setChats(res.data.data || []);
      setLoading(false);
    } catch (e) {
      setError('Failed to load chats.');
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchChats(); }, [fetchChats]);

  // --- Fetch Messages ---
  const fetchMessages = useCallback(async (chatId) => {
    if (!chatId) return;
    setLoading(true);
    try {
      const res = await apiClient.get(`/chats/${chatId}/messages`);
      setMessages(res.data.data || []);
      setLoading(false);
    } catch (e) {
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
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedChatId) return;
    try {
      await apiClient.post(`/chats/${selectedChatId}/messages`, { content: messageText, type: 'text' });
      setMessageText('');
      setShowEmojiPicker(false);
      setIsTyping(false);
      fetchMessages(selectedChatId);
      fetchChats();
    } catch (e) {
      setError('Failed to send message.');
    }
  };

  // --- Emoji Picker ---
  const handleEmojiSelect = (emoji) => {
    setMessageText((prev) => prev + emoji.native);
  };

  // --- Archive/Exit Chat ---
  const handleArchiveChat = async () => {
    if (!selectedChatId) return;
    try {
      await apiClient.patch(`/chats/${selectedChatId}/archive`);
      setSelectedChatId(null);
      fetchChats();
    } catch (e) {
      setError('Failed to archive chat.');
    }
  };

  // --- Delete Chat ---
  const handleDeleteChat = async () => {
    if (!selectedChatId) return;
    try {
      await apiClient.delete(`/chats/${selectedChatId}`, { data: { confirm: true } });
      setSelectedChatId(null);
      fetchChats();
    } catch (e) {
      setError('Failed to delete chat.');
    }
  };

  // --- Delete Selected Messages ---
  const handleDeleteSelectedMessages = async () => {
    if (!selectedChatId || selectedMessagesForDeletion.length === 0) return;
    try {
      await apiClient.delete(`/chats/${selectedChatId}/messages`, {
        data: { messageIds: selectedMessagesForDeletion, confirm: true },
      });
      setSelectedMessagesForDeletion([]);
      setIsSelectionMode(false);
      fetchMessages(selectedChatId);
    } catch (e) {
      setError('Failed to delete messages.');
    }
  };

  // --- Message Reaction ---
  const handleReactToMessage = async (messageId, emoji) => {
    try {
      await apiClient.patch(`/chats/${selectedChatId}/messages/${messageId}/reactions`, { emoji });
      fetchMessages(selectedChatId);
    } catch (e) {
      setError('Failed to react to message.');
    }
  };

  // --- Delivery Status ---
  const getMessageStatus = async (messageId) => {
    try {
      const res = await apiClient.get(`/chats/${selectedChatId}/messages/${messageId}/status`);
      return res.data.status;
    } catch {
      return 'sent';
    }
  };

  // --- UI Handlers ---
  const handleSelectMessage = (messageId) => {
    setSelectedMessagesForDeletion((prev) =>
      prev.includes(messageId) ? prev.filter((id) => id !== messageId) : [...prev, messageId]
    );
  };

  const handleToggleSelectionMode = () => {
    setIsSelectionMode((prev) => !prev);
    setSelectedMessagesForDeletion([]);
  };

  // --- Render ---
  return (
    <div className="min-h-screen bg-gray-100 font-inter flex flex-col">
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 shadow-lg flex justify-between items-center">
        <h1 className="text-3xl font-bold">Secure Messaging</h1>
        <div className="flex items-center space-x-4">
          {user && (
            <div className="flex items-center space-x-2">
              <img
                src={user.avatar || 'https://placehold.co/40x40/CCCCCC/FFFFFF?text=U'}
                alt={user.fullName}
                className="w-10 h-10 rounded-full border-2 border-white shadow-md"
              />
              <span className="text-lg font-medium">{user.fullName}</span>
            </div>
          )}
        </div>
      </header>
      <main className="flex flex-1 overflow-hidden">
        {/* Chat List */}
        <div className="w-1/3 border-r border-gray-200 bg-white overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800">Chats</h2>
          </div>
          {chats.length === 0 ? (
            <p className="p-4 text-gray-500">No chats found. Start a new one!</p>
          ) : (
            chats.map((chat) => {
              const otherParticipant = chat.participants.find((p) => p._id !== user._id);
              const chatName = chat.isGroupChat
                ? chat.groupName || `Group Chat (${chat.participants.length})`
                : otherParticipant?.fullName || 'Unknown Chat';
              const lastMessage = chat.messages?.[chat.messages.length - 1];
              return (
                <div
                  key={chat._id}
                  className={`flex items-center p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${selectedChatId === chat._id ? 'bg-blue-100' : ''}`}
                  onClick={() => setSelectedChatId(chat._id)}
                >
                  <img
                    src={chat.isGroupChat ? 'https://placehold.co/40x40/8E44AD/FFFFFF?text=GC' : otherParticipant?.avatar || 'https://placehold.co/40x40/CCCCCC/FFFFFF?text=U'}
                    alt={chatName}
                    className="w-12 h-12 rounded-full mr-4 shadow-sm"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium text-gray-900">{chatName}</h3>
                      <span className="text-xs text-gray-500">{lastMessage ? formatTimestamp(lastMessage.createdAt) : ''}</span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{lastMessage ? lastMessage.content : 'No messages yet.'}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
        {/* Chat Window */}
        <div className="flex-1 flex flex-col bg-gray-50">
          {/* Chat header */}
          <div className="p-4 border-b border-gray-200 bg-white shadow-sm flex justify-between items-center">
            <div className="flex items-center">
              <button
                onClick={handleArchiveChat}
                className="text-gray-600 hover:text-gray-800 p-2 rounded-full mr-3 transition-colors"
                title="Close Chat"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
              </button>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">{selectedChatId ? chats.find((c) => c._id === selectedChatId)?.groupName || chats.find((c) => c._id === selectedChatId)?.participants?.filter((p) => p._id !== user._id).map((p) => p.fullName).join(', ') : 'Select a chat'}</h2>
              </div>
            </div>
            <div className="flex space-x-2">
              {!isSelectionMode && (
                <button
                  onClick={() => setShowModal({ type: 'deleteChat' })}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-md transition-colors duration-200 flex items-center justify-center"
                  title="Delete Whole Conversation"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2 mr-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                  Delete Chat
                </button>
              )}
              <button
                onClick={handleToggleSelectionMode}
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg shadow-md transition-colors duration-200 flex items-center justify-center"
                title="Select Messages"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-square mr-2"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="m9 12 2 2 4-4"/></svg>
                {isSelectionMode ? 'Cancel' : 'Select Messages'}
              </button>
              {isSelectionMode && (
                <button
                  onClick={() => setShowModal({ type: 'deleteMessages' })}
                  disabled={selectedMessagesForDeletion.length === 0}
                  className={`px-4 py-2 rounded-lg shadow-md transition-colors duration-200 flex items-center justify-center ${selectedMessagesForDeletion.length > 0 ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                  title="Delete Selected Messages"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2 mr-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                  Delete ({selectedMessagesForDeletion.length})
                </button>
              )}
            </div>
          </div>
          {/* Messages */}
          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
            {messages.length === 0 ? (
              <p className="text-center text-gray-500 mt-10">No messages yet. Say hello!</p>
            ) : (
              messages.map((msg) => (
                <div key={msg._id} className={`flex mb-4 ${msg.senderId === user._id ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`relative max-w-[70%] p-3 rounded-xl shadow-md cursor-pointer ${msg.senderId === user._id ? 'bg-blue-500 text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'} ${isSelectionMode && selectedMessagesForDeletion.includes(msg._id) ? 'ring-2 ring-purple-500' : ''}`}
                    onClick={() => isSelectionMode ? handleSelectMessage(msg._id) : null}
                  >
                    <p className="text-sm break-words">{msg.content}</p>
                    <div className={`text-xs mt-1 flex items-center ${msg.senderId === user._id ? 'text-blue-200 justify-end' : 'text-gray-500 justify-start'}`}>
                      <span>{formatTimestamp(msg.createdAt)}</span>
                      {/* Delivery ticks (async) */}
                      {msg.senderId === user._id && (
                        <span className="ml-2 flex items-center">
                          {/* TODO: Use getMessageStatus(msg._id) to show ticks */}
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check text-gray-400"><path d="M20 6 9 17l-5-5"/></svg>
                        </span>
                      )}
                    </div>
                    {/* Reactions */}
                    {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                      <div className="absolute -bottom-2 -right-2 bg-white rounded-full px-2 py-1 shadow-lg text-xs flex items-center border border-gray-200">
                        {Object.entries(msg.reactions).map(([emoji, users]) => (
                          <span key={emoji} className="mr-1">{emoji} {users.length > 0 && <span className="text-gray-600">{users.length}</span>}</span>
                        ))}
                      </div>
                    )}
                    {/* Emoji reactions */}
                    <div className="absolute top-0 right-0 flex space-x-1">
                      {emojiReactions.map((emoji) => (
                        <button key={emoji} className="text-xl" onClick={() => handleReactToMessage(msg._id, emoji)}>{emoji}</button>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
            {isTyping && <div className="text-gray-500 text-sm italic mb-2">Someone is typing...</div>}
            <div ref={messagesEndRef} />
          </div>
          {/* Message input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white relative">
            <div className="flex items-center space-x-3">
              <button type="button" onClick={() => setShowEmojiPicker((v) => !v)} className="bg-gray-200 text-gray-700 p-3 rounded-lg shadow-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all duration-200 flex items-center justify-center" title="Emojis">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-smile"><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" x2="9.01" y1="9" y2="9" /><line x1="15" x2="15.01" y1="9" y2="9" /></svg>
              </button>
              <input type="text" value={messageText} onChange={(e) => setMessageText(e.target.value)} placeholder="Type a message..." className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 text-gray-800" />
              <button type="submit" className="bg-blue-600 text-white p-3 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-send"><path d="m22 2-7 20-4-9-9-4 20-7Z" /><path d="M15 7l-6 6" /></svg>
              </button>
            </div>
            {showEmojiPicker && (
              <div ref={emojiPickerRef} className="absolute bottom-full right-0 mb-2 bg-white p-4 rounded-lg shadow-xl border border-gray-200 z-50" style={{ width: '300px' }}>
                <Picker onSelect={handleEmojiSelect} showPreview={false} showSkinTones={false} />
              </div>
            )}
          </form>
        </div>
      </main>
      {/* Confirmation Modal */}
      <Modal
        isOpen={!!showModal}
        onClose={() => setShowModal(false)}
        title={showModal?.type === 'deleteChat' ? 'Delete Whole Conversation?' : 'Delete Selected Messages?'}
      >
        <div>
          <p className="mb-4">
            {showModal?.type === 'deleteChat'
              ? 'Are you sure you want to delete the entire conversation? This action cannot be undone.'
              : `Are you sure you want to delete ${selectedMessagesForDeletion.length} message(s)? This action cannot be undone.`}
          </p>
          <div className="flex justify-end space-x-3">
            <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors">Cancel</button>
            <button
              onClick={showModal?.type === 'deleteChat' ? handleDeleteChat : handleDeleteSelectedMessages}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Confirm
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ChatPage; 