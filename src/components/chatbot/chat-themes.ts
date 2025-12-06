'use client';

export type ChatThemeId = 'account' | 'home-hero' | 'cad-generator';

export interface ChatThemeDefinition {
    id: ChatThemeId;
    label: string;
    description: string;
    badge?: string;
    preview: string;
    accent: {
        primary: string;
        secondary: string;
        glow: string;
        bubbleBot: string;
        bubbleUser: string;
        optionBg: string;
        optionText: string;
    };
}

export const CHAT_THEMES: ChatThemeDefinition[] = [
    {
        id: 'account',
        label: 'Account Control',
        description: 'Soft daylight gradients with floating wireframes',
        badge: 'Default',
        preview:
            'linear-gradient(135deg, rgba(247,250,255,1) 0%, rgba(227,238,255,1) 55%, rgba(199,224,255,1) 100%)',
        accent: {
            primary: '#0f172a',
            secondary: '#2563eb',
            glow: '0 10px 30px rgba(59,130,246,0.25)',
            bubbleBot: 'linear-gradient(145deg, rgba(255,255,255,0.95), rgba(232,240,255,0.95))',
            bubbleUser: 'linear-gradient(145deg, #2563eb, #1d4ed8)',
            optionBg: 'rgba(59,130,246,0.08)',
            optionText: '#1d4ed8',
        },
    },
    {
        id: 'home-hero',
        label: 'Hero Showcase',
        description: 'Deep cobalt hero gradient with neon orbits',
        preview:
            'linear-gradient(135deg, rgba(15,118,212,1) 0%, rgba(28,78,216,1) 55%, rgba(14,165,233,1) 100%)',
        accent: {
            primary: '#e0f2fe',
            secondary: '#22d3ee',
            glow: '0 10px 30px rgba(14,165,233,0.35)',
            bubbleBot: 'linear-gradient(145deg, rgba(15,23,42,0.85), rgba(15,23,42,0.75))',
            bubbleUser: 'linear-gradient(145deg, #22d3ee, #0ea5e9)',
            optionBg: 'rgba(14,165,233,0.12)',
            optionText: '#e0f2fe',
        },
    },
    {
        id: 'cad-generator',
        label: 'CAD Generator',
        description: 'Dark blueprint canvas with motion grid',
        preview:
            'linear-gradient(135deg, rgba(255,255,255,0.65), rgba(255,255,255,0.25))',
        accent: {
            primary: '#e2e8f0',
            secondary: '#38bdf8',
            glow: '0 12px 32px rgba(56,189,248,0.35)',
            bubbleBot: 'linear-gradient(145deg, rgba(9,16,40,0.9), rgba(15,23,42,0.85))',
            bubbleUser: 'linear-gradient(145deg, #38bdf8, #0ea5e9)',
            optionBg: 'rgba(14,165,233,0.16)',
            optionText: '#e0f2fe',
        },
    },
];



