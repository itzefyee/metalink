'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Minus, Palette } from 'lucide-react';
import ChatThemeBackground from './ChatThemeBackground';
import { CHAT_THEMES, ChatThemeDefinition, ChatThemeId } from './chat-themes';

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ChatThemeDefinition;
  activeThemeId: ChatThemeId;
  onSelectTheme: (themeId: ChatThemeId) => void;
  children: React.ReactNode;
}

const ThemeMenuButton: React.FC<{
  activeThemeId: ChatThemeId;
  onSelect: (themeId: ChatThemeId) => void;
}> = ({ activeThemeId, onSelect }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const activeTheme = CHAT_THEMES.find((theme) => theme.id === activeThemeId) ?? CHAT_THEMES[0];

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        aria-label="Change chat background"
        onClick={() => setOpen((prev) => !prev)}
        className={`w-10 h-10 rounded-full shadow-md shadow-black/10 flex items-center justify-center ${
          activeThemeId === 'account' ? 'border border-black/30 bg-transparent' : 'border border-white/40'
        }`}
        style={{ background: activeTheme.preview }}
      >
        <Palette
          className={`w-4 h-4 drop-shadow ${
            activeThemeId === 'home-hero' ? 'text-white' : 'text-gray-900'
          }`}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.15 }}
            className="absolute top-14 right-0 z-[70] border border-black/20 rounded-2xl shadow-2xl p-2 flex flex-col gap-1 bg-white"
          >
            {CHAT_THEMES.map((theme, index) => {
              const isActive = theme.id === activeThemeId;
              return (
                <button
                  key={theme.id}
                  type="button"
                  aria-label={`Switch to ${theme.label}`}
                  onClick={() => {
                    onSelect(theme.id);
                    setOpen(false);
                  }}
                  className={`relative w-8 h-8 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                    index === 2 || index === 0 ? 'border border-black/30 bg-transparent' : 'border border-white/70'
                  }`}
                    style={{ background: index === 2 ? 'transparent' : theme.preview }}
                >
                  {isActive && (
                    <span className="absolute inset-0 rounded-full border border-primary shadow-[0_0_0_2px_rgba(37,99,235,0.25)]" />
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ChatPanel: React.FC<ChatPanelProps> = ({
  isOpen,
  onClose,
  theme,
  activeThemeId,
  onSelectTheme,
  children,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          key="steelbot-panel"
          initial={{ opacity: 0, x: 48, scale: 0.96 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 40, scale: 0.94 }}
          transition={{ type: 'spring', stiffness: 260, damping: 28 }}
          className="fixed inset-y-6 right-0 sm:right-6 z-[60] w-full sm:w-[400px] px-3 sm:px-0"
        >
          <div className="relative glass-card-with-liquid overflow-hidden rounded-[32px] shadow-2xl border border-white/40 backdrop-blur-[18px] h-full">
            <div className="absolute inset-0">
              <ChatThemeBackground themeId={theme.id} />
              <div className="absolute inset-0 bg-white/5 backdrop-blur-2xl" />
            </div>

            <div className="relative z-10 flex flex-col h-full">
              <div className="px-5 pb-5 pt-14 flex-1 flex flex-col min-h-0">
                <div className="glass-card bg-white/90 shadow-xl border border-white/70 rounded-2xl p-4 flex-1 flex flex-col overflow-hidden hover:translate-y-0 hover:scale-100 hover:shadow-xl">
                  <div className="flex-1 min-h-0 flex flex-col">{children}</div>
                </div>
              </div>

              <div className="absolute top-3 right-6 flex items-center gap-2 z-20">
                <ThemeMenuButton activeThemeId={activeThemeId} onSelect={onSelectTheme} />
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Minimize assistant"
                  className="p-2 rounded-full bg-black/25 text-white hover:bg-black/30 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
                >
                  <Minus className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};

export default ChatPanel;


