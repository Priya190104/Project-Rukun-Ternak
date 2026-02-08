/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './public/index.html',
    './src/**/*.{js,jsx,ts,tsx,html}'
  ],
  theme: {
    extend: {
      colors: {
        // Primary colors (formerly blue)
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',  // Main primary
          800: '#0c4a6e',
          900: '#082f49',
        },
        
        // Status colors - all shades
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          DEFAULT: '#10b981',
          700: '#15803d',
          800: '#166534',
          900: '#145231',
          light: '#d1fae5',
          bg: '#ecfdf5',
        },
        
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#f87171',
          600: '#dc2626',
          DEFAULT: '#ef4444',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          light: '#fee2e2',
          bg: '#fef2f2',
        },
        
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          DEFAULT: '#f59e0b',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          light: '#fef3c7',
          bg: '#fffbeb',
        },
        
        info: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          DEFAULT: '#3b82f6',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          light: '#dbeafe',
          bg: '#eff6ff',
        },
      },
      
      textColor: {
        primary: '#0369a1',
        'primary-50': '#f0f9ff',
        'primary-100': '#e0f2fe',
        'primary-200': '#bae6fd',
        'primary-300': '#7dd3fc',
        'primary-400': '#38bdf8',
        'primary-500': '#0ea5e9',
        'primary-600': '#0284c7',
        'primary-700': '#0369a1',
        'primary-800': '#0c4a6e',
        'primary-900': '#082f49',
        
        secondary: '#6b7280',
        muted: '#9ca3af',
        success: '#10b981',
        danger: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6',
      },
      
      backgroundColor: {
        primary: '#0369a1',
        'primary-50': '#f0f9ff',
        'primary-100': '#e0f2fe',
        'primary-200': '#bae6fd',
        'primary-300': '#7dd3fc',
        'primary-400': '#38bdf8',
        'primary-500': '#0ea5e9',
        'primary-600': '#0284c7',
        'primary-700': '#0369a1',
        'primary-800': '#0c4a6e',
        'primary-900': '#082f49',
        
        'success-50': '#f0fdf4',
        'success-100': '#dcfce7',
        'success-light': '#d1fae5',
        
        'danger-50': '#fef2f2',
        'danger-100': '#fee2e2',
        'danger-light': '#fee2e2',
        
        'warning-50': '#fffbeb',
        'warning-100': '#fef3c7',
        'warning-light': '#fef3c7',
        
        'info-50': '#eff6ff',
        'info-100': '#dbeafe',
        'info-light': '#dbeafe',
      },
      
      borderColor: {
        'primary-50': '#f0f9ff',
        'primary-100': '#e0f2fe',
        'primary-200': '#bae6fd',
        'primary-600': '#0284c7',
        'primary-700': '#0369a1',
        
        'success-100': '#dcfce7',
        'danger-100': '#fee2e2',
        'danger-200': '#fecaca',
        'warning-100': '#fef3c7',
        'info-100': '#dbeafe',
      },
    },
  },
  plugins: [],
};
