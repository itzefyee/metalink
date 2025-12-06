'use client';

import React from 'react';
import { motion } from 'framer-motion';
import WireframeIconLayer from '@/components/layout/WireframeIconLayer';
import BlueprintSketchLayer from '@/components/BlueprintSketchLayer';
import TechnicalPattern from '@/components/TechnicalPattern';
import BlueprintModel3D from '@/components/cad/BlueprintModel3D';
import { ChatThemeId } from './chat-themes';

interface ChatThemeBackgroundProps {
    themeId: ChatThemeId;
}

const glowBubble = (className: string, color: string, delay = 0) => (
    <motion.span
        key={`${className}-${color}`}
        className={`absolute rounded-full blur-3xl ${className}`}
        style={{ background: color }}
        initial={{ opacity: 0.35, scale: 0.9 }}
        animate={{ opacity: [0.35, 0.6, 0.35], scale: [0.9, 1.05, 0.9] }}
        transition={{ repeat: Infinity, duration: 6, delay }}
    />
);

const floatingBlueprintModel = (key: string, className: string, delay = 0) => (
    <motion.div
        key={key}
        className={`absolute pointer-events-none ${className}`}
        animate={{ y: [0, -12, 0], rotate: [0, 2, -2, 0] }}
        transition={{ repeat: Infinity, duration: 10 + delay * 2, ease: 'easeInOut' }}
    >
        <div className="w-56 h-56">
            <BlueprintModel3D />
        </div>
    </motion.div>
);

const ChatThemeBackground: React.FC<ChatThemeBackgroundProps> = ({ themeId }) => {
    switch (themeId) {
        case 'home-hero':
            return (
                <>
                    <div className="absolute inset-0 bg-gradient-to-br from-primary via-blue-600 to-blue-700 overflow-hidden">
                        <div className="absolute inset-0 bg-black/25 z-[1]" />
                        <div className="absolute inset-0 mix-blend-screen opacity-70 z-[2] pointer-events-none">
                            <TechnicalPattern />
                        </div>
                        <BlueprintSketchLayer variant="hero" className="opacity-85 z-[3]" />
                        <div
                            className="absolute inset-0 opacity-25 z-[4] pointer-events-none"
                            style={{
                                backgroundImage:
                                    'linear-gradient(rgba(59,130,246,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.2) 1px, transparent 1px)',
                                backgroundSize: '60px 60px',
                            }}
                        />
                    </div>
                    {glowBubble('-top-8 -left-6 w-40 h-40', 'rgba(59,130,246,0.35)', 0)}
                    {glowBubble('top-1/3 right-4 w-44 h-44', 'rgba(14,165,233,0.4)', 0.8)}
                    {glowBubble('bottom-2 right-10 w-60 h-60', 'rgba(96,165,250,0.35)', 0.4)}
                </>
            );
        case 'cad-generator':
            return (
                <>
                    <div className="absolute inset-0 home-wavy-bg overflow-hidden" />
                    <div className="absolute inset-0 pointer-events-none">
                        {floatingBlueprintModel('model-left', 'bottom-[-120px] left-[-60px]', 0)}
                        {floatingBlueprintModel('model-right', 'top-[-100px] right-[-40px]', 0.6)}
                    </div>
                </>
            );
        default:
            return (
                <>
                    <div
                        className="absolute inset-0"
                        style={{
                            background:
                                'radial-gradient(circle at 10% 10%, rgba(214,239,255,0.45), transparent 60%), radial-gradient(circle at 80% 0%, rgba(224,244,255,0.4), transparent 55%), linear-gradient(135deg, rgba(247,250,255,0.95) 0%, rgba(213,229,255,0.9) 100%)',
                        }}
                    />
                    {glowBubble('-top-4 -right-10 w-36 h-36', 'rgba(191,219,254,0.6)', 0.4)}
                    {glowBubble('bottom-2 -left-4 w-44 h-44', 'rgba(147,197,253,0.45)', 0.2)}
                    <WireframeIconLayer className="opacity-60" />
                </>
            );
    }
};

export default ChatThemeBackground;


