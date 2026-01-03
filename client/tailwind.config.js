/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primary Colors
        'pink-primary': '#ec4899',
        'purple-primary': '#a855f7',
        'blue-primary': '#3b82f6',
        'indigo-primary': '#4f46e5',

        // Light Mode Colors
        'background': '#FFFFFF',
        'primary-text': '#1f2937',
        'secondary-text': '#4b5563',
        'tertiary-text': '#6b7280',
        'light-text': '#9ca3af',
        'accent-color': '#4f46e5',
        'card-background': '#FFFFFF',
        'border-color': '#E5E5E5',
        'shadow-color': 'rgba(0, 0, 0, 0.1)',
        'hover-shadow': 'rgba(0, 0, 0, 0.15)',

        // Background Colors - Light Mode
        'bg-pink-light': '#fce7f3',
        'bg-purple-light': '#f3e8ff',
        'bg-blue-light': '#dbeafe',
        'bg-pink-lighter': '#fef1f7',
        'bg-purple-lighter': '#faf5ff',
        'bg-blue-lighter': '#eff6ff',

        // Dark Mode Colors
        'background-dark': '#1A1A1A',
        'primary-text-dark': '#f3f4f6',
        'secondary-text-dark': '#d1d5db',
        'tertiary-text-dark': '#9ca3af',
        'light-text-dark': '#6b7280',
        'accent-color-dark': '#6366f1',
        'card-background-dark': '#2A2A2A',
        'border-color-dark': '#404040',
        'shadow-color-dark': 'rgba(0, 0, 0, 0.3)',
        'hover-shadow-dark': 'rgba(0, 0, 0, 0.5)',

        // Background Colors - Dark Mode
        'bg-pink-dark': '#831843',
        'bg-purple-dark': '#581c87',
        'bg-blue-dark': '#1e3a8a',
        'bg-gray-darkest': '#030712',
        'bg-purple-darkest': '#3b0764',
        'bg-gray-darker': '#111827',
        'bg-gray-dark': '#1f2937',

        // Utility Colors
        'white': '#ffffff',
        'white-translucent-80': 'rgba(255, 255, 255, 0.8)',
        'white-translucent-60': 'rgba(255, 255, 255, 0.6)',
        'white-translucent-50': 'rgba(255, 255, 255, 0.5)',

        // Yellow for Theme Toggle
        'yellow-accent': '#fbbf24',
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'sans-serif'],
      },
      animation: {
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.6s ease-out',
        'fade-in-up': 'fadeInUp 0.8s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}