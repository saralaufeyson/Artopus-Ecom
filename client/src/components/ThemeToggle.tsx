import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { toggleTheme } = useTheme();

  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      title="Toggle between light and dark mode"
    />
  );
};

export default ThemeToggle;