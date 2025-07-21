import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Send,
  Image as ImageIcon,
  ThumbsUp,
  ThumbsDown,
  Clipboard,
  X, // For closing image preview
  Sun, // Light mode
  Moon, // Dark mode
  Bot, // AI icon
  User as UserIcon, // User icon
} from 'lucide-react';
import axios from 'axios';

const LoadingSpinner = ({ size = 'medium', color = 'currentColor' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-8 h-8',
  };
  return (
    <div className={`inline-block animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] text-${color} ${sizeClasses[size]}`} role="status">
      <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
    </div>
  );
};

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text?: string;
  imageUrl?: string;
  feedback?: 'liked' | 'disliked' | null;
  timestamp: string;
}

interface AIChatWidgetProps {
  onClose?: () => void;
  floating?: boolean;
}

const AIChatWidget: React.FC<AIChatWidgetProps> = ({ onClose, floating }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const getAIResponse = useCallback(async (userText: string, imageData: string | null) => {
    setIsLoading(true);
    const newMessageId = Date.now().toString();
    try {
      const response = await axios.post('/api/v1/ai-chat/message', {
        text: userText,
        image: imageData,
      });
      const aiResponseText = response.data?.data?.text || "I'm sorry, I couldn't process that request.";
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: newMessageId,
          sender: 'ai',
          text: aiResponseText,
          feedback: null,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } catch (err) {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: newMessageId,
          sender: 'ai',
          text: "Sorry, there was an error contacting the AI service.",
          feedback: null,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    }
    setIsLoading(false);
  }, []);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() && !selectedImage) return;
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputMessage.trim(),
      imageUrl: selectedImage,
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    const messageToSend = inputMessage.trim();
    const imageToSend = selectedImage;
    setInputMessage('');
    setSelectedImage(null);
    setImageFileName(null);
    await getAIResponse(messageToSend, imageToSend);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImageFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFeedback = (id: string, type: 'liked' | 'disliked') => {
    setMessages(prevMessages =>
      prevMessages.map(msg =>
        msg.id === id ? { ...msg, feedback: type } : msg
      )
    );
  };

  const handleCopyToClipboard = (text: string | undefined) => {
    if (text) {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
      } catch (err) {
        // ignore
      }
      document.body.removeChild(textarea);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className={`flex flex-col w-full max-w-2xl h-[90vh] bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700 ${floating ? 'fixed bottom-4 right-4 z-50' : ''}`}
      style={floating ? { maxWidth: 400, height: 600 } : {}}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md">
        <div className="flex items-center">
          <Bot className="h-7 w-7 mr-3 animate-pulse" />
          <h2 className="text-2xl font-bold">MedBlock AI Assistant</h2>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-md hover:bg-white hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors"
            title="Toggle Theme"
          >
            {theme === 'light' ? <Moon className="h-6 w-6" /> : <Sun className="h-6 w-6" />}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-md hover:bg-white hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-red-300 transition-colors"
              title="Close"
            >
              <X className="h-6 w-6" />
            </button>
          )}
        </div>
      </div>

      {/* Chat Messages Area */}
      <div ref={chatContainerRef} className="flex-1 p-4 overflow-y-auto space-y-6 bg-gray-50 dark:bg-gray-900 chat-messages-container">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400 mt-10">
            <p className="text-xl font-semibold">👋 Hello there!</p>
            <p className="text-md mt-2">I'm your MedBlock AI Assistant. Ask me anything about your health, appointments, or general medical information.</p>
            <p className="text-sm mt-4">Try asking: "What are common symptoms of the flu?" or "How does blockchain secure my medical data?"</p>
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-start ${msg.sender === 'user' ? 'flex-row-reverse' : ''} max-w-[80%]`}>
              {msg.sender === 'user' ? (
                <UserIcon className="h-8 w-8 text-blue-500 dark:text-blue-400 ml-2 mt-1 flex-shrink-0" />
              ) : (
                <Bot className="h-8 w-8 text-purple-500 dark:text-purple-400 mr-2 mt-1 flex-shrink-0" />
              )}
              <div
                className={`relative p-4 rounded-xl shadow-md ${
                  msg.sender === 'user'
                    ? 'bg-blue-500 text-white rounded-br-none'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-bl-none'
                }`}
              >
                {msg.text && <p className="text-sm break-words">{msg.text}</p>}
                {msg.imageUrl && (
                  <div className="mt-3">
                    <img src={msg.imageUrl} alt="Uploaded" className="max-w-full h-auto rounded-lg border border-gray-300 dark:border-gray-600" />
                    {msg.sender === 'user' && imageFileName && (
                      <p className="text-xs text-gray-100 dark:text-gray-400 mt-1 opacity-80">Image: {imageFileName}</p>
                    )}
                  </div>
                )}
                <p className="text-xs opacity-70 mt-2 text-right">
                  {msg.timestamp}
                </p>
                {msg.sender === 'ai' && (
                  <div className="flex items-center justify-end space-x-2 mt-3 pt-2 border-t border-gray-300 dark:border-gray-600">
                    <button
                      onClick={() => handleFeedback(msg.id, 'liked')}
                      className={`p-1 rounded-full ${msg.feedback === 'liked' ? 'bg-green-200 text-green-700 dark:bg-green-700 dark:text-green-200' : 'hover:bg-gray-300 dark:hover:bg-gray-600'} transition-colors`}
                      title="Like"
                    >
                      <ThumbsUp className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleFeedback(msg.id, 'disliked')}
                      className={`p-1 rounded-full ${msg.feedback === 'disliked' ? 'bg-red-200 text-red-700 dark:bg-red-700 dark:text-red-200' : 'hover:bg-gray-300 dark:hover:bg-gray-600'} transition-colors`}
                      title="Dislike"
                    >
                      <ThumbsDown className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleCopyToClipboard(msg.text)}
                      className="p-1 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                      title="Copy to clipboard"
                    >
                      <Clipboard className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-start max-w-[80%]">
              <Bot className="h-8 w-8 text-purple-500 dark:text-purple-400 mr-2 mt-1 flex-shrink-0" />
              <div className="p-4 rounded-xl shadow-md bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-bl-none">
                <LoadingSpinner size="small" />
                <span className="ml-2 text-sm">AI is typing...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Message Input Area */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        {selectedImage && (
          <div className="relative mb-3 p-3 border border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-between bg-gray-100 dark:bg-gray-700 shadow-inner">
            <div className="flex items-center">
              <img src={selectedImage} alt="Preview" className="h-12 w-12 object-cover rounded-md mr-3 border border-gray-200 dark:border-gray-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300 font-medium truncate">{imageFileName}</span>
            </div>
            <button
              onClick={handleRemoveImage}
              className="p-1 rounded-full bg-red-500 text-white hover:bg-red-600 dark:bg-red-700 dark:hover:bg-red-600 transition-colors shadow-sm"
              title="Remove image"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        <div className="flex items-center space-x-3">
          <label htmlFor="image-upload" className="cursor-pointer p-3 rounded-full bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-600 dark:text-blue-300 transition-colors shadow-md flex-shrink-0">
            <ImageIcon className="h-6 w-6" />
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              ref={fileInputRef}
              className="hidden"
            />
          </label>
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            rows={1}
            className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none overflow-hidden transition-all duration-200"
            disabled={isLoading}
            style={{ minHeight: '48px', maxHeight: '120px' }}
          />
          <button
            onClick={handleSendMessage}
            className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            disabled={isLoading || (!inputMessage.trim() && !selectedImage)}
            title="Send Message"
          >
            {isLoading ? <LoadingSpinner size="small" color="white" /> : <Send className="h-6 w-6" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChatWidget; 