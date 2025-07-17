import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../../store";
import { addUserMessage, sendAIMessage } from "../../features/ai/aiSlice";

const AIPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { messages, loading, error } = useSelector((state: RootState) => state.ai);
  const [input, setInput] = useState("");

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    dispatch(addUserMessage(input));
    await dispatch(sendAIMessage(input));
    setInput("");
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
        {loading && <div className="flex justify-center items-center"><span className="animate-spin h-6 w-6 border-4 border-blue-400 border-t-transparent rounded-full"></span></div>}
        {error && <div className="text-red-600 text-center mt-2">{error}</div>}
      </div>
      <form onSubmit={handleSend} className="flex gap-2">
        <input
          className="flex-1 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type your health question..."
        />
        <button className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 transition" type="submit" disabled={loading}>Send</button>
      </form>
      <img src="https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=600&q=80" alt="Kenyan healthcare" className="rounded-lg shadow mt-8 w-full max-w-xl mx-auto" />
    </div>
  );
};

export default AIPage;
