import React, { useState, useRef, useEffect } from 'react';

interface Message {
  id: number;
  sender: 'user' | 'ai';
  text: string;
}

const initialMessages: Message[] = [
  { id: 1, sender: 'ai', text: 'Hello! I am your AI medical assistant. How can I help you today?' },
];

const AIChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMessage: Message = {
      id: messages.length + 1,
      sender: 'user',
      text: input,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    // Simulate AI response (replace with backend call)
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          sender: 'ai',
          text: 'This is a sample AI response. (Integrate with backend for real answers.)',
        },
      ]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-2xl mx-auto bg-white dark:bg-gray-900 rounded-lg shadow p-4 mt-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">AI Medical Assistant</h1>
      <div className="flex-1 overflow-y-auto space-y-2 mb-4 px-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`rounded-lg px-4 py-2 max-w-xs break-words shadow text-sm ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSend} className="flex items-center gap-2 border-t pt-2">
        <input
          type="text"
          className="flex-1 rounded border px-3 py-2 focus:outline-none focus:ring focus:border-blue-400 dark:bg-gray-800 dark:text-white"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default AIChatPage; 