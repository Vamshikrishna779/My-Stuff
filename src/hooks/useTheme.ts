import { useState, useEffect } from 'react';
import { STORAGE_KEYS } from '../utils/constants';
import { THEMES } from '../utils/themes';

export type Theme = string;

export const useTheme = () => {
    const [theme, setTheme] = useState<Theme>(() => {
        const saved = localStorage.getItem(STORAGE_KEYS.THEME);
        // Check if saved theme exists in our list, default to 'dark'
        return THEMES.find(t => t.id === saved) ? saved! : 'dark';
    });

    useEffect(() => {
        const currentTheme = THEMES.find(t => t.id === theme) || THEMES[1]; // Default to dark

        // Apply CSS variables
        const root = document.documentElement;
        root.setAttribute('data-theme', theme); // Keep for backward compatibility/CSS selectors

        Object.entries(currentTheme.colors).forEach(([key, value]) => {
            root.style.setProperty(key, value);
        });

        localStorage.setItem(STORAGE_KEYS.THEME, theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    return { theme, setTheme, toggleTheme };
};
