import React from 'react';
import ChatInterface from '../components/chat/ChatInterface';

const ChatPage: React.FC = () => {
  return (
    <div className="h-screen">
      <ChatInterface className="h-full" />
    </div>
  );
};

export default ChatPage; 