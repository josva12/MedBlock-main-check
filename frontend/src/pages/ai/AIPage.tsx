import React, { useState } from "react";

const AIPage: React.FC = () => {
  const [messages, setMessages] = useState([
    { from: "ai", text: "Hello! How can I help you with your health today?" },
  ]);
  const [input, setInput] = useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages([...messages, { from: "user", text: input }]);
    setInput("");
    // TODO: Call AI API and append response
    setTimeout(() => {
      setMessages(msgs => [...msgs, { from: "ai", text: "This is a demo AI response. Please consult a real doctor for urgent issues." }]);
    }, 1000);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-blue-900 mb-6">AI Health Chat</h2>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-4 h-96 overflow-y-auto flex flex-col">
        {messages.map((msg, idx) => (
          <div key={idx} className={`mb-2 flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`px-4 py-2 rounded-lg max-w-xs ${msg.from === "user" ? "bg-blue-100 text-blue-900" : "bg-green-100 text-green-900"}`}>{msg.text}</div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSend} className="flex gap-2">
        <input
          className="flex-1 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type your health question..."
        />
        <button className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 transition" type="submit">Send</button>
      </form>
      <img src="https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=600&q=80" alt="Kenyan healthcare" className="rounded-lg shadow mt-8 w-full max-w-xl mx-auto" />
    </div>
  );
};

export default AIPage;
