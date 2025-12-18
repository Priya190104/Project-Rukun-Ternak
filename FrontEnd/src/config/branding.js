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
// Opsi 1: Import dari file (jika sudah ada)
// import LogoAsset from '../assets/logo/logo.png';

// Opsi 2: Gunakan file dari public folder (recommended)
const LOGO_PATH = process.env.PUBLIC_URL + '/logo.png';

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
  
  // Warna Brand (Emerald theme)
  COLORS: {
    primary: '#059669',      // emerald-600
    primaryLight: '#d1fae5', // emerald-100
    primaryDark: '#047857',  // emerald-700
    secondary: '#14b8a6',    // teal-500
    accent: '#0ea5e9',       // sky-500
    success: '#10b981',      // green-600
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
