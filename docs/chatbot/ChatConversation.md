'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, ExternalLink, Loader2, Reply, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  ChatbotContext,
  ChatbotNode,
  ChatbotOption,
  FormNode,
  chatbotFlow,
  getConversationNode,
} from '@/lib/chatbot-flow';
const BOT_AVATAR_BG = 'linear-gradient(135deg, #2563eb, #1d4ed8)';
const USER_BUBBLE_BG = 'linear-gradient(135deg, #2563eb, #1d4ed8)';
const OPTION_BG = 'rgba(37, 99, 235, 0.08)';
const OPTION_BORDER = 'rgba(59, 130, 246, 0.25)';
const OPTION_TEXT = '#1e40af';

export type ConversationEntry =
  | { id: string; role: 'bot'; nodeId: string; metaMessage?: string }
  | { id: string; role: 'user'; text: string };

interface ChatConversationProps {
  history: ConversationEntry[];
  onHistoryChange: React.Dispatch<React.SetStateAction<ConversationEntry[]>>;
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

const ChatConversation: React.FC<ChatConversationProps> = ({ history, onHistoryChange }) => {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [context] = useState<ChatbotContext>({});
  const greetingEntry = {
    id: 'bot-greeting',
    role: 'bot' as const,
    node: chatbotFlow.greeting,
    nodeId: 'greeting',
  };

  const visualEntries = [
    greetingEntry,
    ...history.map((entry) =>
      entry.role === 'bot'
        ? {
            ...entry,
            node: entry.metaMessage
              ? ({
                  id: entry.nodeId,
                  type: 'message',
                  message: entry.metaMessage,
                  options: [],
                } as ChatbotNode)
              : getConversationNode(entry.nodeId),
          }
        : entry
    ),
  ];

  const [isThinking, setIsThinking] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [visualEntries, isThinking]);

  const activeNode = useMemo(() => {
    const reversed = [...visualEntries].reverse();
    const lastBot = reversed.find((entry) => entry.role === 'bot') as typeof visualEntries[number] | undefined;
    if (lastBot && lastBot.role === 'bot') {
      return lastBot.node;
    }
    return chatbotFlow.greeting;
  }, [visualEntries]);

  const appendEntry = useCallback(
    (entry: ConversationEntry) => {
      onHistoryChange((prev) => [...prev, entry]);
    },
    [onHistoryChange]
  );

  const resolveNextNodeId = useCallback(
    (option: ChatbotOption) => {
      if (typeof option.next === 'function') {
        try {
          const result = option.next(context);
          if (typeof result === 'string') {
            return result;
          }
        } catch {
          // fallback to option id
        }
      }
      if (typeof option.next === 'string') {
        return option.next;
      }
      return option.id;
    },
    [context]
  );

  const handleFormSubmit = (node: FormNode) => {
    appendEntry({
      id: `user-form-${Date.now()}`,
      role: 'user',
      text: `Submitted ${node.submitLabel}`,
    });
    setIsThinking(true);
    setTimeout(() => {
      appendEntry({
        id: `bot-${node.successMessage.id}-${Date.now()}`,
        role: 'bot',
        nodeId: node.successMessage.id,
      });
      setIsThinking(false);
    }, 400);
  };

  const handleExternalAction = (option: ChatbotOption) => {
    if (!option.action || !('url' in option) || !option.url) {
      return false;
    }

    if (option.action === 'navigate') {
      router.push(option.url);
      appendEntry({
        id: `bot-nav-${Date.now()}`,
        role: 'bot',
        nodeId: `navigation-${option.id}`,
        metaMessage: `Opening ${option.label}...`,
      });
      return true;
    }

    if (option.action === 'link') {
      window.open(option.url, '_blank', 'noopener');
      appendEntry({
        id: `bot-link-${Date.now()}`,
        role: 'bot',
        nodeId: `navigation-${option.id}`,
        metaMessage: `Opening ${option.label} in a new tab...`,
      });
      return true;
    }

    return false;
  };

  const handleOptionClick = (option: ChatbotOption) => {
    if (isThinking) return;

    appendEntry({ id: `user-${Date.now()}-${option.id}`, role: 'user', text: option.label });

    if (handleExternalAction(option)) {
      return;
    }

    const nextNode = getConversationNode(resolveNextNodeId(option));
    setIsThinking(true);
    setTimeout(() => {
      appendEntry({ id: `bot-${nextNode.id}-${Date.now()}-${option.id}`, role: 'bot', nodeId: nextNode.id });
      setIsThinking(false);
    }, 350);
  };

  const renderMedia = (node: ChatbotNode) => {
    if (node.type !== 'message' || !node.media) return null;
    if (node.media.type === 'image') {
      return (
        <figure className="mt-3">
          <img
            src={node.media.url}
            alt={node.media.alt}
            className="w-full rounded-2xl border border-slate-100 shadow-sm"
          />
          <figcaption className="text-xs text-slate-400 mt-1">{node.media.alt}</figcaption>
        </figure>
      );
    }
    return (
      <video
        className="mt-3 w-full rounded-2xl border border-slate-100 shadow-sm"
        poster={node.media.thumbnail}
        controls
        playsInline
      >
        <source src={node.media.url} />
      </video>
    );
  };

  const renderCarousel = (node: ChatbotNode) => {
    if (node.type !== 'carousel') return null;
    return (
      <div className="mt-3 space-y-3">
        <p
          className="text-sm text-slate-600"
          dangerouslySetInnerHTML={{ __html: markdownToHtml(node.message) }}
        />
        <div className="flex gap-3 overflow-x-auto">
          {node.items.map((item) => (
            <div key={item.title} className="min-w-[200px] glass-card border border-slate-100 p-3">
              <img src={item.image} alt={item.title} className="rounded-xl mb-2 h-28 w-full object-cover" />
              <h4 className="text-sm font-semibold text-slate-800">{item.title}</h4>
              <p className="text-xs text-slate-500 mb-2">{item.description}</p>
              {item.action && (
                <a
                  href={item.action.url}
                  className="text-xs font-semibold text-primary inline-flex items-center gap-1"
                >
                  {item.action.label}
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderForm = (node: ChatbotNode) => {
    if (node.type !== 'form') return null;
    return (
      <div className="mt-3 space-y-3">
        <p
          className="text-sm text-slate-600"
          dangerouslySetInnerHTML={{ __html: markdownToHtml(node.message) }}
        />
        <form
          className="space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            handleFormSubmit(node);
          }}
        >
          {node.formFields.map((field) => (
            <label key={field.id} className="block text-xs text-slate-500">
              <span className="font-semibold text-slate-600">{field.label}</span>
              {field.type === 'textarea' ? (
                <textarea
                  rows={field.rows ?? 3}
                  placeholder={field.placeholder}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm text-slate-700 focus:ring-2 focus:ring-primary/40 focus:border-primary/40"
                  required={field.required}
                  disabled
                />
              ) : field.type === 'select' ? (
                <select
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm text-slate-700 focus:ring-2 focus:ring-primary/40 focus:border-primary/40"
                  required={field.required}
                  disabled
                >
                  <option value="">Select...</option>
                  {field.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm text-slate-700 focus:ring-2 focus:ring-primary/40 focus:border-primary/40"
                  required={field.required}
                  disabled
                />
              )}
            </label>
          ))}
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-primary text-white py-2 text-sm font-semibold shadow-md shadow-primary/30"
          >
            <Sparkles className="w-4 h-4" />
            {node.submitLabel}
          </button>
        </form>
      </div>
    );
  };

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
      >
        <div className="space-y-4">
          {visualEntries.map((entry) =>
            entry.role === 'bot' ? (
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
                  <p dangerouslySetInnerHTML={{ __html: markdownToHtml(entry.node.message) }} />
                  {renderMedia(entry.node)}
                  {renderCarousel(entry.node)}
                  {renderForm(entry.node)}
                </div>
              </div>
            ) : (
              <div key={entry.id} className="flex justify-end">
                <div
                  className="rounded-2xl px-4 py-3 text-sm text-white shadow-lg border border-white/20"
                  style={{ background: USER_BUBBLE_BG }}
                >
                  {entry.text}
                </div>
              </div>
            )
          )}
          {isThinking && <TypingIndicator />}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100" onWheel={handleWheelPassthrough}>
        <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">Choose next</p>
        <div className="flex flex-wrap gap-2">
          {(activeNode.options ?? []).map((option) => (
            <button
              key={`${activeNode.id}-${option.id}`}
              type="button"
              disabled={isThinking}
              onClick={() => handleOptionClick(option)}
              className="px-3 py-2 rounded-2xl text-xs font-semibold flex items-center gap-1 shadow-sm transition-all disabled:opacity-40 hover:-translate-y-0.5 hover:shadow-md"
              style={{
                background: OPTION_BG,
                color: OPTION_TEXT,
                border: `1px solid ${OPTION_BORDER}`,
              }}
            >
              {option.isBack ? <Reply className="w-3 h-3" /> : null}
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatConversation;

