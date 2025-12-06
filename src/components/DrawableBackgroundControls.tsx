'use client';

import React, { useState, RefObject } from 'react';
import { DrawableBackgroundRef } from './DrawableBackground';

interface DrawableBackgroundControlsProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  canvasRef: RefObject<DrawableBackgroundRef>;
  strokeColor: string;
  onColorChange: (color: string) => void;
  strokeWidth: number;
  onWidthChange: (width: number) => void;
}

const DrawableBackgroundControls: React.FC<DrawableBackgroundControlsProps> = ({
  enabled,
  onToggle,
  canvasRef,
  strokeColor,
  onColorChange,
  strokeWidth,
  onWidthChange,
}) => {
  const handleClear = () => {
    canvasRef.current?.clear();
  };
  const [isOpen, setIsOpen] = useState(false);

  const colors = [
    { name: 'Blue', value: 'rgba(93, 170, 255, 0.3)' },
    { name: 'Red', value: 'rgba(239, 68, 68, 0.3)' },
    { name: 'Green', value: 'rgba(34, 197, 94, 0.3)' },
    { name: 'Purple', value: 'rgba(168, 85, 247, 0.3)' },
    { name: 'Orange', value: 'rgba(249, 115, 22, 0.3)' },
    { name: 'White', value: 'rgba(255, 255, 255, 0.4)' },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="relative">
        {/* Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
          aria-label="Drawing controls"
        >
          <svg
            className="w-6 h-6 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            />
          </svg>
        </button>

        {/* Controls Panel */}
        {isOpen && (
          <div className="absolute bottom-16 right-0 bg-white/95 backdrop-blur-md border border-gray-200 rounded-2xl shadow-2xl p-4 min-w-[280px] space-y-4">
            {/* Enable/Disable Toggle */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Enable Drawing</label>
              <button
                onClick={() => onToggle(!enabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  enabled ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Color Picker */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Color</label>
              <div className="grid grid-cols-3 gap-2">
                {colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => onColorChange(color.value)}
                    className={`h-10 rounded-lg border-2 transition-all ${
                      strokeColor === color.value
                        ? 'border-blue-600 scale-105'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    style={{ backgroundColor: color.value }}
                    aria-label={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Stroke Width */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Stroke Width: {strokeWidth}px
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={strokeWidth}
                onChange={(e) => onWidthChange(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {/* Clear Button */}
            <button
              onClick={handleClear}
              disabled={!enabled}
              className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Clear Canvas
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DrawableBackgroundControls;

