'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { DEFAULT_CAD_PROMPTS } from '@/constants/prompts';

interface AnimatedTextPromptProps {
  prompts?: string[];
  typingSpeed?: number;
  pauseDuration?: number;
  deleteSpeed?: number;
  className?: string;
}

export default function AnimatedTextPrompt({
  prompts = DEFAULT_CAD_PROMPTS,
  typingSpeed = 50,
  pauseDuration = 3000,
  deleteSpeed = 30,
  className = '',
}: AnimatedTextPromptProps) {
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Detect reduced motion preference using custom hook
  const prefersReducedMotion = useReducedMotion();

  // Use refs for animation timing to leverage requestAnimationFrame
  const animationFrameRef = useRef<number | undefined>(undefined);
  const lastUpdateTimeRef = useRef<number>(0);

  // Memoized animation update function using requestAnimationFrame
  const updateAnimation = useCallback(
    (timestamp: number) => {
      if (prefersReducedMotion) {
        return;
      }

      const currentPrompt = prompts[currentPromptIndex];
      const elapsed = timestamp - lastUpdateTimeRef.current;

      // Handle typing animation
      if (isTyping && !isPaused && !isDeleting) {
        if (displayedText.length < currentPrompt.length) {
          if (elapsed >= typingSpeed) {
            setDisplayedText(currentPrompt.slice(0, displayedText.length + 1));
            lastUpdateTimeRef.current = timestamp;
          }
          animationFrameRef.current = requestAnimationFrame(updateAnimation);
        } else {
          // Finished typing, pause before deleting
          setIsTyping(false);
          setIsPaused(true);
          setTimeout(() => {
            setIsPaused(false);
            setIsDeleting(true);
            lastUpdateTimeRef.current = performance.now();
          }, pauseDuration);
        }
      }
      // Handle deleting animation
      else if (isDeleting && !isPaused) {
        if (displayedText.length > 0) {
          if (elapsed >= deleteSpeed) {
            setDisplayedText(displayedText.slice(0, -1));
            lastUpdateTimeRef.current = timestamp;
          }
          animationFrameRef.current = requestAnimationFrame(updateAnimation);
        } else {
          // Finished deleting, pause before next prompt
          setIsDeleting(false);
          setIsPaused(true);
          setTimeout(() => {
            setIsPaused(false);
            setIsTyping(true);
            setCurrentPromptIndex((prev) => (prev + 1) % prompts.length);
            lastUpdateTimeRef.current = performance.now();
          }, 500);
        }
      }
    },
    [
      displayedText,
      isTyping,
      isDeleting,
      isPaused,
      currentPromptIndex,
      prompts,
      typingSpeed,
      pauseDuration,
      deleteSpeed,
      prefersReducedMotion,
    ]
  );

  useEffect(() => {
    // If reduced motion is preferred, show static text
    if (prefersReducedMotion) {
      setDisplayedText(prompts[currentPromptIndex]);
      return;
    }

    // Start animation loop with requestAnimationFrame
    const startAnimation = () => {
      lastUpdateTimeRef.current = performance.now();
      animationFrameRef.current = requestAnimationFrame(updateAnimation);
    };

    startAnimation();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [updateAnimation, prefersReducedMotion, prompts, currentPromptIndex]);

  return (
    <div className={`${className}`}>
      {/* Animated prompt display */}
      <div
        className="relative min-h-[60px] md:min-h-[60px]"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="flex items-start space-x-2">
          <span className="text-blue-400 text-2xl md:text-3xl font-mono flex-shrink-0">
          </span>
          <div className="flex-1">
            <p className="text-xl md:text-2xl lg:text-3xl font-medium text-white">
              {displayedText}
              {!prefersReducedMotion && (
                <motion.span
                  className="inline-block w-0.5 bg-white ml-1 h-6 md:h-8"
                  animate={{ opacity: [1, 0] }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    repeatType: 'reverse',
                  }}
                  aria-hidden="true"
                />
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
