export interface ThemeDefinition {
    id: string;
    name: string;
    type: 'light' | 'dark';
    colors: {
        '--bg-color': string;
        '--card-bg': string;
        '--header-bg': string;
        '--text-color': string;
        '--text-secondary': string;
        '--border-color': string;
        '--hover-bg': string;
        '--primary-color': string;
        '--secondary-color': string;
        '--card-bg-rgb': string;
        '--shadow-soft': string;
    };
}

export const THEMES: ThemeDefinition[] = [
    {
        id: 'light',
        name: 'Light (Gold)',
        type: 'light',
        colors: {
            '--bg-color': '#ffffff',
            '--card-bg': '#fafafa',
            '--header-bg': 'rgba(255, 255, 255, 0.9)',
            '--text-color': '#0f172a',
            '--text-secondary': '#475569',
            '--border-color': '#e5e7eb',
            '--hover-bg': '#f1f5f9',
            '--primary-color': '#facc15',
            '--secondary-color': '#eab308',
            '--card-bg-rgb': '250, 250, 250',
            '--shadow-soft': '0 12px 32px rgba(0, 0, 0, 0.08)',
        }
    },
    {
        id: 'dark',
        name: 'Dark (Gold)',
        type: 'dark',
        colors: {
            '--bg-color': '#0a0a0a',
            '--card-bg': '#141414',
            '--header-bg': 'rgba(10, 10, 10, 0.9)',
            '--text-color': '#f8fafc',
            '--text-secondary': '#cbd5e1',
            '--border-color': '#2a2a2a',
            '--hover-bg': '#1f1f1f',
            '--primary-color': '#facc15',
            '--secondary-color': '#eab308',
            '--card-bg-rgb': '20, 20, 20',
            '--shadow-soft': '0 20px 55px rgba(0, 0, 0, 0.8)',
        }
    },
    {
        id: 'one-piece',
        name: 'One Piece',
        type: 'light',
        colors: {
            '--bg-color': '#ffffff',
            '--card-bg': '#f0f9ff', // Slight blue tint
            '--header-bg': 'rgba(255, 255, 255, 0.9)',
            '--text-color': '#0f172a',
            '--text-secondary': '#475569',
            '--border-color': '#dbeafe',
            '--hover-bg': '#f0f9ff',
            '--primary-color': '#facc15',
            '--secondary-color': '#ef4444',
            '--card-bg-rgb': '240, 249, 255',
            '--shadow-soft': '0 18px 42px rgba(14, 116, 144, 0.2)',
        }
    },
    {
        id: 'cyberpunk',
        name: 'Cyberpunk',
        type: 'dark',
        colors: {
            '--bg-color': '#09090b',
            '--card-bg': '#18181b',
            '--header-bg': 'rgba(9, 9, 11, 0.9)',
            '--text-color': '#e2e8f0',
            '--text-secondary': '#94a3b8',
            '--border-color': '#27272a',
            '--hover-bg': '#27272a',
            '--primary-color': '#d946ef', // Neon Pink
            '--secondary-color': '#06b6d4', // Cyan
            '--card-bg-rgb': '24, 24, 27',
            '--shadow-soft': '0 20px 55px rgba(217, 70, 239, 0.15)',
        }
    },
    {
        id: 'forest',
        name: 'Forest',
        type: 'dark',
        colors: {
            '--bg-color': '#052e16', // Dark Green
            '--card-bg': '#14532d',
            '--header-bg': 'rgba(5, 46, 22, 0.9)',
            '--text-color': '#f0fdf4',
            '--text-secondary': '#86efac',
            '--border-color': '#166534',
            '--hover-bg': '#15803d',
            '--primary-color': '#4ade80', // Green
            '--secondary-color': '#facc15', // Gold
            '--card-bg-rgb': '20, 83, 45',
            '--shadow-soft': '0 20px 55px rgba(0, 0, 0, 0.5)',
        }
    },
    {
        id: 'ocean',
        name: 'Deep Ocean',
        type: 'dark',
        colors: {
            '--bg-color': '#0f172a', // Slate 900
            '--card-bg': '#1e293b', // Slate 800
            '--header-bg': 'rgba(15, 23, 42, 0.9)',
            '--text-color': '#f1f5f9',
            '--text-secondary': '#94a3b8',
            '--border-color': '#334155',
            '--hover-bg': '#334155',
            '--primary-color': '#38bdf8', // Sky Blue
            '--secondary-color': '#0ea5e9',
            '--card-bg-rgb': '30, 41, 59',
            '--shadow-soft': '0 20px 55px rgba(14, 165, 233, 0.15)',
        }
    },
    {
        id: 'sunset',
        name: 'Sunset',
        type: 'dark',
        colors: {
            '--bg-color': '#2a0a18', // Dark Purple/Red
            '--card-bg': '#4a1028',
            '--header-bg': 'rgba(42, 10, 24, 0.9)',
            '--text-color': '#fff1f2',
            '--text-secondary': '#fda4af',
            '--border-color': '#831843',
            '--hover-bg': '#831843',
            '--primary-color': '#fb923c', // Orange
            '--secondary-color': '#db2777', // Pink
            '--card-bg-rgb': '74, 16, 40',
            '--shadow-soft': '0 20px 55px rgba(251, 146, 60, 0.15)',
        }
    },
    {
        id: 'dracula',
        name: 'Dracula',
        type: 'dark',
        colors: {
            '--bg-color': '#282a36',
            '--card-bg': '#44475a',
            '--header-bg': 'rgba(40, 42, 54, 0.9)',
            '--text-color': '#f8f8f2',
            '--text-secondary': '#6272a4',
            '--border-color': '#6272a4',
            '--hover-bg': '#6272a4',
            '--primary-color': '#ff79c6', // Pink
            '--secondary-color': '#bd93f9', // Purple
            '--card-bg-rgb': '68, 71, 90',
            '--shadow-soft': '0 20px 55px rgba(0, 0, 0, 0.5)',
        }
    },
    {
        id: 'nord',
        name: 'Nord',
        type: 'dark',
        colors: {
            '--bg-color': '#2e3440',
            '--card-bg': '#3b4252',
            '--header-bg': 'rgba(46, 52, 64, 0.9)',
            '--text-color': '#eceff4',
            '--text-secondary': '#d8dee9',
            '--border-color': '#4c566a',
            '--hover-bg': '#434c5e',
            '--primary-color': '#88c0d0', // Frost
            '--secondary-color': '#81a1c1',
            '--card-bg-rgb': '59, 66, 82',
            '--shadow-soft': '0 20px 55px rgba(0, 0, 0, 0.3)',
        }
    },
    {
        id: 'coffee',
        name: 'Coffee',
        type: 'light',
        colors: {
            '--bg-color': '#f5f5dc', // Beige
            '--card-bg': '#fff8e7',
            '--header-bg': 'rgba(245, 245, 220, 0.9)',
            '--text-color': '#4a3b32', // Dark Brown
            '--text-secondary': '#8b7355',
            '--border-color': '#d2b48c',
            '--hover-bg': '#e6d2b5',
            '--primary-color': '#8b4513', // Saddle Brown
            '--secondary-color': '#a0522d',
            '--card-bg-rgb': '255, 248, 231',
            '--shadow-soft': '0 12px 32px rgba(139, 69, 19, 0.1)',
        }
    },
    {
        id: 'midnight',
        name: 'Midnight',
        type: 'dark',
        colors: {
            '--bg-color': '#020617', // Very dark blue
            '--card-bg': '#0f172a',
            '--header-bg': 'rgba(2, 6, 23, 0.9)',
            '--text-color': '#e2e8f0',
            '--text-secondary': '#64748b',
            '--border-color': '#1e293b',
            '--hover-bg': '#1e293b',
            '--primary-color': '#6366f1', // Indigo
            '--secondary-color': '#8b5cf6', // Violet
            '--card-bg-rgb': '15, 23, 42',
            '--shadow-soft': '0 20px 55px rgba(99, 102, 241, 0.15)',
        }
    },
    {
        id: 'retro',
        name: 'Retro 80s',
        type: 'dark',
        colors: {
            '--bg-color': '#2c003e', // Deep Purple
            '--card-bg': '#510a32',
            '--header-bg': 'rgba(44, 0, 62, 0.9)',
            '--text-color': '#ffe6f2',
            '--text-secondary': '#ff80bf',
            '--border-color': '#c724b1',
            '--hover-bg': '#80125a',
            '--primary-color': '#feac5e', // Orange/Yellow
            '--secondary-color': '#4bc0c8', // Teal
            '--card-bg-rgb': '81, 10, 50',
            '--shadow-soft': '0 20px 55px rgba(254, 172, 94, 0.2)',
        }
    }
];
