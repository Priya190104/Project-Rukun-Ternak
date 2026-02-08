/**
 * CENTRALIZED BRANDING CONFIGURATION
 * 
 * Semua logo dan asset branding dikelola dari satu file ini.
 * Untuk mengganti logo ke depannya, cukup ubah path di file ini.
 * 
 * Jangan hardcode logo path di komponen mana pun.
 * Import logo dari file ini saja.
 */

// Logo dapat di-import dari assets, atau gunakan URL publik
// Gunakan file dari public folder
const LOGO_PATH = '/logo.webp';

// Jika logo belum tersedia, gunakan placeholder
const LogoAsset = LOGO_PATH;

/**
 * Konfigurasi Branding Rukun Ternak
 * 
 * @property {string} APP_NAME - Nama aplikasi
 * @property {string} APP_LOGO - Path ke logo aplikasi
 * @property {object} COLORS - Palet warna brand
 */
export const BRANDING_CONFIG = {
  // Informasi Aplikasi
  APP_NAME: 'Rukun Ternak',
  APP_DESCRIPTION: 'Sistem Manajemen Laporan Budidaya Ternak',
  
  // Logo - Pastikan file ada di: FrontEnd/public/logo.png
  APP_LOGO: LogoAsset,
  
  // Warna Brand (Blue theme)
  COLORS: {
    primary: '#2563eb',      // blue-600
    primaryLight: '#dbeafe', // blue-100
    primaryDark: '#1d4ed8',  // blue-700
    secondary: '#0284c7',    // sky-600
    accent: '#0ea5e9',       // sky-500
    success: '#3b82f6',      // blue-500
    error: '#ef4444',        // red-500
    warning: '#f59e0b',      // amber-500
    gray: '#6b7280',         // gray-500
  },
};

/**
 * Export logo langsung untuk kemudahan akses
 */
export const APP_LOGO = BRANDING_CONFIG.APP_LOGO;
export const APP_NAME = BRANDING_CONFIG.APP_NAME;

export default BRANDING_CONFIG;
