import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      className="fixed top-4 right-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full w-12 h-12 flex items-center justify-center cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 z-50"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      title="Toggle between light and dark mode"
    >
      <span className="text-xl">
        {theme === 'dark' ? '☀️' : '🌙'}
      </span>
    </button>
  );
};

export default ThemeToggle;

export default ThemeToggle;