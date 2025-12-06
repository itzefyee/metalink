"use client";
import { useState } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function Chatbot({ userId: userIdProp }: { userId?: string } = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  
  // Generate a persistent user ID
  const [userId, setUserId] = useState<string>("anonymous");
  
  useState(() => {
    if (typeof window !== 'undefined') {
      const storedId = localStorage.getItem('metalink_user_id');
      if (storedId) {
        setUserId(storedId);
      } else {
        const newId = userIdProp || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('metalink_user_id', newId);
        setUserId(newId);
      }
    }
  });

  const sendMessage = useAction(api.actions.chat.sendMessage);
  const session = useQuery(api.queries.getChatSession, {
    userId: userId,
  });

  const handleSend = async () => {
    if (!input.trim()) return;

    await sendMessage({
      userId: userId,
      message: input,
    });
    setInput("");
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full shadow-2xl flex items-center justify-center text-white text-2xl hover:scale-110 transition-transform z-50"
      >
        💬
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-t-2xl flex items-center">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-2xl mr-3">
              🤖
            </div>
            <div>
              <div className="font-bold">Metalink Assistant</div>
              <div className="text-xs opacity-90">Online</div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {session?.messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl ${
                    msg.role === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask me anything..."
                className="flex-1 px-4 py-2 border rounded-xl focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleSend}
                className="px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

