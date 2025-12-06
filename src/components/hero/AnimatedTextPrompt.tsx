'use client';

import { useEffect, useState } from 'react';

const prompts = [
  'Generate a steel bracket',
  'Create a custom gear',
  'Design a support beam',
  'Build a mechanical part',
];

export default function AnimatedTextPrompt() {
  const [mounted, setMounted] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const current = prompts[currentPrompt];
    let timeout: NodeJS.Timeout;

    if (!isDeleting && displayText.length < current.length) {
      timeout = setTimeout(() => {
        setDisplayText(current.slice(0, displayText.length + 1));
      }, 100);
    } else if (!isDeleting && displayText.length === current.length) {
      timeout = setTimeout(() => {
        setIsDeleting(true);
      }, 2000);
    } else if (isDeleting && displayText.length > 0) {
      timeout = setTimeout(() => {
        setDisplayText(current.slice(0, displayText.length - 1));
      }, 50);
    } else if (isDeleting && displayText.length === 0) {
      setIsDeleting(false);
      setCurrentPrompt((prev) => (prev + 1) % prompts.length);
    }

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, currentPrompt, mounted]);

  if (!mounted) {
    return (
      <div className="text-center">
        <p className="text-lg md:text-xl text-white/90 mb-2">Try:</p>
        <p className="text-2xl md:text-3xl font-semibold text-white">
          <span className="animate-pulse">|</span>
        </p>
      </div>
    );
  }

  return (
    <div className="text-center">
      <p className="text-lg md:text-xl text-white/90 mb-2">Try:</p>
      <p className="text-2xl md:text-3xl font-semibold text-white">
        {displayText}
        <span className="animate-pulse">|</span>
      </p>
    </div>
  );
}

