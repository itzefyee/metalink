'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, Loader2, Send } from 'lucide-react';
import { chatViaMCP } from '@/lib/mcp-client';

const BOT_AVATAR_BG = 'linear-gradient(135deg, #2563eb, #1d4ed8)';
const USER_BUBBLE_BG = 'linear-gradient(135deg, #2563eb, #1d4ed8)';

export type ConversationEntry =
  | { id: string; role: 'assistant'; content: string; timestamp: Date }
  | { id: string; role: 'user'; content: string; timestamp: Date };

interface ChatConversationProps {
  history: ConversationEntry[];
  onHistoryChange: React.Dispatch<React.SetStateAction<ConversationEntry[]>>;
  userId: string;
}

const markdownToHtml = (value: string): string =>
  value
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br />');

const TypingIndicator: React.FC = () => (
  <div className="flex items-center gap-2 text-xs text-slate-500 mt-3">
    <Loader2 className="w-4 h-4 animate-spin text-primary" />
    SteelBot is thinking...
  </div>
);

const ChatConversation: React.FC<ChatConversationProps> = ({ history, onHistoryChange, userId }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [history, isLoading]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ConversationEntry = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    onHistoryChange((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatViaMCP(userMessage.content, userId);
      
      const assistantMessage: ConversationEntry = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.message || response.response || "I'm sorry, I couldn't process that request.",
        timestamp: new Date(),
      };

      onHistoryChange((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Chat error:', error);
      
      const errorMessage: ConversationEntry = {
        id: `assistant-error-${Date.now()}`,
        role: 'assistant',
        content: error.message?.includes('MCP server unreachable')
          ? "⚠️ MCP server is not running. Please make sure the MCP server is started."
          : `Sorry, I encountered an error: ${error.message || 'Unknown error'}`,
        timestamp: new Date(),
      };

      onHistoryChange((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }, [input, isLoading, userId, onHistoryChange]);

  const handleWheelPassthrough = useCallback(
    (event: React.WheelEvent<HTMLDivElement>) => {
      if (!scrollRef.current) return;
      if (
        (event.deltaY < 0 && scrollRef.current.scrollTop <= 0) ||
        (event.deltaY > 0 &&
          scrollRef.current.scrollTop + scrollRef.current.clientHeight >= scrollRef.current.scrollHeight)
      ) {
        return;
      }
      event.preventDefault();
      scrollRef.current.scrollBy({ top: event.deltaY, behavior: 'auto' });
    },
    []
  );

  return (
    <div className="flex flex-col h-full min-h-0">
      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto pr-1"
        style={{ paddingRight: '0.35rem', paddingBottom: '1.5rem' }}
        onWheel={handleWheelPassthrough}
      >
        <div className="space-y-4">
          {history.length === 0 ? (
            <div className="flex items-center justify-center h-full text-slate-400 text-sm">
              <div className="text-center">
                <div className="text-4xl mb-2">👋</div>
                <div>Start a conversation with SteelBot</div>
                <div className="text-xs mt-2 opacity-75">Powered by MCP</div>
              </div>
            </div>
          ) : (
            history.map((entry) =>
              entry.role === 'assistant' ? (
                <div key={entry.id} className="flex items-start gap-3">
                  <motion.div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white border border-white/30 shadow"
                    style={{ background: BOT_AVATAR_BG }}
                    animate={{ y: [0, 6, 0] }}
                    transition={{ repeat: Infinity, duration: 3, repeatType: 'reverse', ease: 'easeInOut' as const }}
                  >
                    <Bot className="w-4 h-4" />
                  </motion.div>
                  <div className="flex-1 rounded-2xl px-4 py-3 border border-slate-200 bg-white/90 text-sm text-slate-700 shadow-sm">
                    <p dangerouslySetInnerHTML={{ __html: markdownToHtml(entry.content) }} />
                  </div>
                </div>
              ) : (
                <div key={entry.id} className="flex justify-end">
                  <div
                    className="rounded-2xl px-4 py-3 text-sm text-white shadow-lg border border-white/20"
                    style={{ background: USER_BUBBLE_BG }}
                  >
                    {entry.content}
                  </div>
                </div>
              )
            )
          )}
          {isLoading && <TypingIndicator />}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask me anything..."
            disabled={isLoading}
            className="flex-1 px-4 py-2 rounded-xl border border-slate-200 bg-white/80 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 rounded-xl bg-primary text-white shadow-md shadow-primary/30 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatConversation;

