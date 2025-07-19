import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle: React.FC = () => {
  // --- FIX: We now use `theme` as the source of truth ---
  const { theme, setTheme } = useTheme();

  // Determine if dark mode is currently active, even if theme is 'system'
  const isDarkModeActive = theme === 'dark' || 
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const toggleTheme = () => {
    // This logic is now simpler and more reliable
    setTheme(isDarkModeActive ? 'light' : 'dark');
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
      title={isDarkModeActive ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDarkModeActive ? (
        <Sun className="h-5 w-5 text-yellow-500" />
      ) : (
        <Moon className="h-5 w-5 text-gray-600" />
      )}
    </button>
  );
};

export default ThemeToggle;