/**
 * Centralized Color Palette
 * Single source of truth untuk semua warna di aplikasi
 * 
 * Usage:
 * import { colors } from './utils/colors'
 * className={`bg-[${colors.primary}]`} atau gunakan Tailwind config
 */

export const colors = {
  // Primary Colors
  primary: '#0369a1',        // Sky Blue
  primaryLight: '#38bdf8',   // Sky Blue Light
  primaryDark: '#0c4a6e',    // Sky Blue Dark
  
  // Secondary Colors
  secondary: '#6b7280',      // Gray
  secondaryLight: '#f3f4f6', // Gray Light
  secondaryDark: '#374151',  // Gray Dark
  
  // Status Colors
  success: '#10b981',        // Emerald
  successLight: '#d1fae5',   // Emerald Light
  successBg: '#ecfdf5',      // Emerald BG
  
  error: '#ef4444',          // Red
  errorLight: '#fee2e2',     // Red Light
  errorBg: '#fef2f2',        // Red BG
  
  warning: '#f59e0b',        // Amber
  warningLight: '#fef3c7',   // Amber Light
  warningBg: '#fffbeb',      // Amber BG
  
  info: '#3b82f6',           // Blue
  infoLight: '#dbeafe',      // Blue Light
  infoBg: '#eff6ff',         // Blue BG
  
  // Neutral Colors
  white: '#ffffff',
  black: '#000000',
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  
  // Semantic Colors
  background: '#ffffff',
  foreground: '#000000',
  border: '#e5e7eb',
  text: '#111827',
  textMuted: '#6b7280',
  
  // Status State Colors
  active: '#0369a1',
  inactive: '#9ca3af',
  disabled: '#d1d5db',
  hover: '#0c4a6e',
  
  // Brand Colors
  brand: {
    primary: '#0369a1',      // Main brand color
    secondary: '#6366f1',    // Indigo
    accent: '#f59e0b',       // Amber
  }
};

/**
 * Color utilities untuk dynamic color assignment
 */
export const colorUtils = {
  /**
   * Get status color berdasarkan status type
   * @param {string} status - Status type (success, error, warning, info)
   * @returns {object} Object dengan warna untuk text, bg, dan border
   */
  getStatusColor: (status) => {
    const statusMap = {
      success: {
        text: colors.success,
        bg: colors.successBg,
        border: colors.success,
        light: colors.successLight,
      },
      error: {
        text: colors.error,
        bg: colors.errorBg,
        border: colors.error,
        light: colors.errorLight,
      },
      warning: {
        text: colors.warning,
        bg: colors.warningBg,
        border: colors.warning,
        light: colors.warningLight,
      },
      info: {
        text: colors.info,
        bg: colors.infoBg,
        border: colors.info,
        light: colors.infoLight,
      },
    };
    
    return statusMap[status] || statusMap.info;
  },
  
  /**
   * Get role-based color
   * @param {string} role - User role
   * @returns {string} Color hex code
   */
  getRoleColor: (role) => {
    const roleMap = {
      admin: colors.error,
      kelompok: colors.success,
      viewer: colors.info,
    };
    return roleMap[role] || colors.gray[500];
  },
  
  /**
   * Get animal status color
   * @param {string} status - Animal status (AKTIF, TIDAK_AKTIF, TERJUAL)
   * @returns {object} Color object
   */
  getAnimalStatusColor: (status) => {
    const statusMap = {
      AKTIF: {
        text: colors.success,
        bg: colors.successBg,
        badge: 'bg-green-100 text-green-800',
      },
      TIDAK_AKTIF: {
        text: colors.gray[500],
        bg: colors.gray[100],
        badge: 'bg-gray-100 text-gray-800',
      },
      TERJUAL: {
        text: colors.info,
        bg: colors.infoBg,
        badge: 'bg-blue-100 text-blue-800',
      },
    };
    return statusMap[status] || statusMap.AKTIF;
  },
};

/**
 * CSS Variable definitions untuk dark mode compatibility
 */
export const cssVariables = {
  '--color-primary': colors.primary,
  '--color-primary-light': colors.primaryLight,
  '--color-primary-dark': colors.primaryDark,
  '--color-secondary': colors.secondary,
  '--color-success': colors.success,
  '--color-error': colors.error,
  '--color-warning': colors.warning,
  '--color-info': colors.info,
  '--color-background': colors.background,
  '--color-foreground': colors.foreground,
  '--color-border': colors.border,
  '--color-text': colors.text,
  '--color-text-muted': colors.textMuted,
};
