import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { io, Socket } from 'socket.io-client';
import {
  fetchRecentChats,
  searchUsers,
  createOrGetConversation,
  fetchMessages,
  sendMessage,
  sendMediaMessage,
  addReaction,
  archiveChat,
  deleteChat,
  setActiveConversation,
  setMessages,
  addMessage,
  updateMessageReaction,
  setDraftMessage,
  clearDraftMessage,
  clearSearchResults,
} from '../../features/chat/chatSlice';
import { Message, Conversation, User } from '../../services/chatService';
import LoadingSpinner from '../common/LoadingSpinner';

interface ChatInterfaceProps {
  className?: string;
  showArchived?: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  className = '', 
  showArchived = false 
}) => {
  const dispatch = useAppDispatch();
  const { user, token } = useAppSelector(state => state.auth);
  const {
    recentChats,
    activeConversation,
    messages,
    searchResults,
    loading,
    searching,
    error,
    drafts
  } = useAppSelector(state => state.chat);

  // Local state
  const [socket, setSocket] = useState<Socket | null>(null);
  const [newMessageText, setNewMessageText] = useState<string>('');
  const [selectedMediaFile, setSelectedMediaFile] = useState<File | null>(null);
  const [showUserSearchModal, setShowUserSearchModal] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [typingUsers, setTypingUsers] = useState<{ [chatId: string]: string[] }>({});
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [showReactionPicker, setShowReactionPicker] = useState<{
    messageId: string;
    position: { x: number; y: number };
  } | null>(null);

  // Refs
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Constants
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
  const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

  // Socket.IO Connection
  useEffect(() => {
    if (!token || !user) return;

    const newSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    });

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
    });

    newSocket.on('newMessage', (data: { chatId: string; message: Message }) => {
      console.log('New message received:', data);
      
      // Update messages if this conversation is currently active
      if (activeConversation?._id === data.chatId) {
        dispatch(addMessage(data.message));
        // Auto-scroll to bottom
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
      
      // Update Redux state for real-time persistence
      dispatch(addMessage(data.message));
    });

    newSocket.on('reactionUpdate', (data: { chatId: string; messageId: string; message: Message }) => {
      console.log('Reaction update received:', data);
      if (activeConversation?._id === data.chatId) {
        dispatch(updateMessageReaction({ messageId: data.messageId, reaction: data.message.reactions }));
      }
    });

    newSocket.on('user-typing', (data: { chatId: string; userId: string; userName: string; isTyping: boolean }) => {
      console.log('User typing:', data);
      if (data.isTyping) {
        setTypingUsers(prev => ({
          ...prev,
          [data.chatId]: [...(prev[data.chatId] || []).filter(id => id !== data.userId), data.userId]
        }));
      } else {
        setTypingUsers(prev => ({
          ...prev,
          [data.chatId]: (prev[data.chatId] || []).filter(id => id !== data.userId)
        }));
      }
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    return () => {
      if (newSocket.connected) {
        newSocket.close();
      }
    };
  }, [token, user, dispatch, activeConversation]);

  // Load recent chats on mount
  useEffect(() => {
    if (user && token) {
      dispatch(fetchRecentChats(showArchived));
    }
  }, [user, token, dispatch, showArchived]);

  // Load draft when opening conversation
  useEffect(() => {
    if (activeConversation) {
      if (drafts[activeConversation._id]) {
        setNewMessageText(drafts[activeConversation._id]);
      } else {
        setNewMessageText('');
      }
    }
  }, [activeConversation, drafts]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Open conversation
  const openConversation = useCallback(async (conversation: Conversation) => {
    dispatch(setActiveConversation(conversation));
    dispatch(setMessages([]));
    
    // Join the chat room
    if (socketRef.current) {
      socketRef.current.emit('join-chat', conversation._id);
    }
    
    // Fetch messages for this conversation
    await dispatch(fetchMessages(conversation._id));
  }, [dispatch]);

  // Start new conversation
  const startNewChat = useCallback(async (targetUser: User) => {
    try {
      console.log('Starting new chat with user:', targetUser.fullName);
      
      const result = await dispatch(createOrGetConversation(targetUser._id));
      if (createOrGetConversation.fulfilled.match(result)) {
        const conversation = result.payload;
        await openConversation(conversation);
        
        setShowUserSearchModal(false);
        setSearchQuery('');
        dispatch(clearSearchResults());
        
        console.log('New chat started successfully:', conversation._id);
      }
    } catch (error) {
      console.error('Failed to start new chat:', error);
    }
  }, [dispatch, openConversation]);

  // Handle user search
  const handleUserSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      dispatch(clearSearchResults());
      return;
    }
    
    await dispatch(searchUsers(searchQuery.trim()));
  }, [searchQuery, dispatch]);

  // Typing indicator functions
  const handleTyping = useCallback(() => {
    if (!activeConversation || !socketRef.current) return;
    
    if (!isTyping) {
      setIsTyping(true);
      socketRef.current.emit('typing', {
        chatId: activeConversation._id,
        userId: user?._id,
        userName: user?.fullName,
        isTyping: true
      });
    }
  }, [activeConversation, user, isTyping]);

  const handleStopTyping = useCallback(() => {
    if (!activeConversation || !socketRef.current) return;
    
    setIsTyping(false);
    socketRef.current.emit('typing', {
      chatId: activeConversation._id,
      userId: user?._id,
      userName: user?.fullName,
      isTyping: false
    });
  }, [activeConversation, user]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setNewMessageText(text);
    
    // Save draft to Redux
    if (activeConversation) {
      dispatch(setDraftMessage({ chatId: activeConversation._id, text }));
    }
    
    // Handle typing indicators
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    handleTyping();
    
    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping();
    }, 3000);
  }, [handleTyping, handleStopTyping, activeConversation, dispatch]);

  // Send message
  const handleSendMessage = useCallback(async () => {
    if (!activeConversation || (!newMessageText.trim() && !selectedMediaFile)) return;

    try {
      if (selectedMediaFile) {
        await dispatch(sendMediaMessage({
          chatId: activeConversation._id,
          file: selectedMediaFile,
          content: newMessageText.trim() || undefined
        }));
        setSelectedMediaFile(null);
      } else {
        await dispatch(sendMessage({
          chatId: activeConversation._id,
          content: newMessageText.trim()
        }));
      }

      setNewMessageText('');
      dispatch(clearDraftMessage(activeConversation._id));
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }, [activeConversation, newMessageText, selectedMediaFile, dispatch]);

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedMediaFile(event.target.files[0]);
    }
  };

  const clearMediaSelection = () => {
    setSelectedMediaFile(null);
  };

  // Add reaction
  const handleAddReaction = useCallback(async (messageId: string, emoji: string) => {
    try {
      await dispatch(addReaction({ messageId, emoji }));
      setShowReactionPicker(null);
    } catch (error) {
      console.error('Failed to add reaction:', error);
    }
  }, [dispatch]);

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

  // Archive/delete chat
  const handleArchiveChat = useCallback(async (chatId: string) => {
    try {
      await dispatch(archiveChat(chatId));
    } catch (error) {
      console.error('Failed to archive chat:', error);
    }
  }, [dispatch]);

  const handleDeleteChat = useCallback(async (chatId: string) => {
    if (window.confirm('Are you sure you want to delete this chat? This action cannot be undone.')) {
      try {
        await dispatch(deleteChat(chatId));
      } catch (error) {
        console.error('Failed to delete chat:', error);
      }
    }
  }, [dispatch]);

  // Reaction picker component
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

  // Modal component
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
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <div className="p-4 overflow-y-auto flex-1">{children}</div>
        </div>
      </div>
    );
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const activeChatPartner = activeConversation?.participants.find(p => p._id !== user?._id);

  return (
    <div className={`flex flex-col h-full bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 ${className}`}>
      {/* Header */}
      <header className="bg-blue-600 dark:bg-blue-800 p-4 text-white shadow-md flex justify-between items-center">
        <h1 className="text-xl font-bold">Chat</h1>
        <button 
          onClick={() => setShowUserSearchModal(true)} 
          className="px-3 py-1 bg-blue-700 hover:bg-blue-800 rounded-md text-white text-sm"
        >
          New Chat
        </button>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel: Recent Chats */}
        <div className="w-1/3 max-w-xs bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Chats</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {recentChats.length === 0 ? (
              <p className="p-4 text-gray-500 dark:text-gray-400 text-center">No recent chats. Start a new one!</p>
            ) : (
              recentChats.map((conv) => {
                const otherParticipant = conv.participants.find(p => p._id !== user?._id);
                const displayUserName = otherParticipant?.fullName || 'Unknown User';
                const draft = drafts[conv._id];
                
                return (
                  <div 
                    key={conv._id} 
                    className={`flex items-center p-3 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 ${activeConversation?._id === conv._id ? 'bg-blue-100 dark:bg-blue-900' : ''}`} 
                    onClick={() => openConversation(conv)}
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
                        {draft ? (
                          <span className="italic text-blue-600 dark:text-blue-400">
                            (Draft) {draft}
                          </span>
                        ) : conv.messages.length > 0 ? (
                          conv.messages[conv.messages.length - 1].content
                        ) : (
                          'No messages yet.'
                        )}
                      </p>
                      {conv.lastMessage && !draft && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {new Date(conv.lastMessage).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col space-y-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleArchiveChat(conv._id);
                        }}
                        className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        title="Archive chat"
                      >
                        📁
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteChat(conv._id);
                        }}
                        className="text-xs text-red-500 hover:text-red-700"
                        title="Delete chat"
                      >
                        🗑️
                      </button>
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
                    onClick={() => {
                      dispatch(setActiveConversation(null));
                      dispatch(setMessages([]));
                      setNewMessageText('');
                    }} 
                    className="px-3 py-1 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md text-sm dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100"
                  >
                    Exit Chat
                  </button>
                </div>
              </div>

              {/* Chat messages area */}
              <div ref={chatContainerRef} className="flex-1 p-4 overflow-y-auto space-y-4" style={{ scrollBehavior: 'smooth' }}>
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
                            <img src={`${API_BASE}${message.fileUrl}`} alt="Chat Media" className="max-w-full h-auto rounded-lg" />
                          ) : message.type === 'video' ? (
                            <video src={`${API_BASE}${message.fileUrl}`} controls className="max-w-full h-auto rounded-lg" />
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
                
                {/* Typing Indicator */}
                {activeConversation && typingUsers[activeConversation._id] && typingUsers[activeConversation._id].length > 0 && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-sm p-2 rounded-lg rounded-bl-none">
                      <div className="flex items-center space-x-1">
                        <span className="typing-dots">
                          <span className="dot"></span>
                          <span className="dot"></span>
                          <span className="dot"></span>
                        </span>
                        <span>
                          {typingUsers[activeConversation._id].length === 1 
                            ? `${typingUsers[activeConversation._id][0]} is typing...`
                            : `${typingUsers[activeConversation._id].length} people are typing...`
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Message input area */}
              <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center">
                {selectedMediaFile && (
                  <div className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg mr-2 flex items-center">
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
                  onChange={handleInputChange} 
                  onKeyPress={(e) => { if (e.key === 'Enter') { handleSendMessage(); } }} 
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
                  onClick={handleSendMessage} 
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
                    onClick={() => startNewChat(user)}
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
                dispatch(clearSearchResults());
              }}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* Reaction Picker */}
      {showReactionPicker && (
        <ReactionPicker 
          onSelect={(emoji) => handleAddReaction(showReactionPicker.messageId, emoji)} 
          onClose={() => setShowReactionPicker(null)} 
          position={showReactionPicker.position} 
        />
      )}

      {/* Error Display */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50">
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default ChatInterface; 