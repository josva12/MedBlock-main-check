import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { setTheme, updateThemePreference, type Theme } from '../../features/ui/uiSlice';
import type { RootState } from '../../store';

const ThemeToggle: React.FC = () => {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state: RootState) => state.ui.theme);

  // Determine if dark mode is currently active, even if theme is 'system'
  const isDarkModeActive = theme === 'dark' || 
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const toggleTheme = () => {
    const newTheme: Theme = isDarkModeActive ? 'light' : 'dark';
    dispatch(setTheme(newTheme));
    dispatch(updateThemePreference(newTheme === 'dark'));
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