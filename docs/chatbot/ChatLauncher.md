'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { Bot } from 'lucide-react';
import { ChatThemeDefinition } from './chat-themes';

interface ChatLauncherProps {
  isOpen: boolean;
  onToggle: () => void;
  theme: ChatThemeDefinition;
}

const ChatLauncher: React.FC<ChatLauncherProps> = ({ isOpen, onToggle, theme }) => {
  const variants: Variants = {
    idle: {
      y: [0, -10],
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: {
        y: {
          duration: 1.6,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut' as const,
        },
      },
    },
    open: {
      y: [0, 30, 120],
      opacity: [1, 0.9, 0],
      scale: [1, 0.95, 0.9],
      rotate: 6,
      transition: {
        duration: 0.65,
        ease: 'easeInOut' as const,
      },
    },
  };

  return (
    <motion.button
      type="button"
      aria-expanded={isOpen}
      aria-label={isOpen ? 'Hide SteelBot assistant' : 'Open SteelBot assistant'}
      onClick={onToggle}
      className="fixed bottom-6 right-4 sm:bottom-8 sm:right-8 z-[55] group"
      style={{ pointerEvents: isOpen ? 'none' : 'auto' }}
      variants={variants}
      animate={isOpen ? 'open' : 'idle'}
      whileHover={{ scale: isOpen ? 1 : 1.08 }}
      whileTap={{ scale: 0.96 }}
    >
      <div className="relative">
        <span
          className="absolute inset-0 rounded-full blur-2xl opacity-70 transition-opacity duration-300"
          style={{ background: 'rgba(59,130,246,0.35)' }}
        />
        <div className="relative flex items-center justify-center p-2 rounded-full bg-white/90 shadow-xl shadow-slate-900/5 border border-white/70 backdrop-blur-xl">
          <div
            className="relative flex items-center justify-center w-10 h-10 rounded-full text-white shadow-lg"
            style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}
          >
            <div className="absolute inset-[3px] rounded-full border border-white/30" />
            <Bot className="w-6 h-6 relative z-10" />
          </div>
        </div>
      </div>
    </motion.button>
  );
};

export default ChatLauncher;

