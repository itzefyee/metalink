"use client";
import { useState, useEffect, useRef } from "react";
import { chatViaMCP } from "@/lib/mcp-client";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function Chatbot({ userId: userIdProp }: { userId?: string } = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Generate a persistent user ID
  const [userId, setUserId] = useState<string>("anonymous");
  
  useEffect(() => {
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
  }, [userIdProp]);

  // Load messages from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedMessages = localStorage.getItem(`chat_messages_${userId}`);
      if (storedMessages) {
        try {
          const parsed = JSON.parse(storedMessages);
          setMessages(parsed.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          })));
        } catch (e) {
          console.error('Failed to load chat history:', e);
        }
      }
    }
  }, [userId]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined' && messages.length > 0) {
      localStorage.setItem(`chat_messages_${userId}`, JSON.stringify(messages));
    }
  }, [messages, userId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    // Add user message immediately
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Call MCP chat API
      const response = await chatViaMCP(input.trim(), userId);
      
      const assistantMessage: Message = {
        role: "assistant",
        content: response.message || response.response || "I'm sorry, I couldn't process that request.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Chat error:', error);
      
      // Show error message to user
      const errorMessage: Message = {
        role: "assistant",
        content: error.message?.includes('MCP server unreachable')
          ? "⚠️ MCP server is not running. Please make sure the MCP server is started."
          : `Sorry, I encountered an error: ${error.message || 'Unknown error'}`,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
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
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                <div className="text-center">
                  <div className="text-4xl mb-2">👋</div>
                  <div>Start a conversation with Metalink Assistant</div>
                  <div className="text-xs mt-2 opacity-75">Powered by MCP</div>
                </div>
              </div>
            ) : (
              messages.map((msg, i) => (
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
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 p-3 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder="Ask me anything..."
                disabled={isLoading}
                className="flex-1 px-4 py-2 border rounded-xl focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? "..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

