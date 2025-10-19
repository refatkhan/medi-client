import { useState, useEffect } from 'react';

export const useTheme = () => {
    // Default to 'light' theme, but check localStorage first
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        // Also check user's system preference as a fallback
        const userPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        return savedTheme || (userPrefersDark ? 'dark' : 'light');
    });

    useEffect(() => {
        const root = window.document.documentElement;

        // Remove old theme class and add the new one
        root.classList.remove(theme === 'dark' ? 'light' : 'dark');
        root.classList.add(theme);

        // Save the theme preference to localStorage
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    return { theme, toggleTheme };
};
