/**
 * ============================================================================
 * PARTNER LOGO CONFIGURATION - DYNAMIC & FLEXIBLE
 * ============================================================================
 * 
 * PURPOSE:
 * Manage "Supported by" logo branding yang dapat dengan mudah diganti
 * tanpa mengubah struktur UI atau hardcoding nama partner spesifik.
 * 
 * DESIGN PRINCIPLES:
 * 1. Logo pendukung diambil dari config, BUKAN hardcoded di komponen
 * 2. Mudah mengganti logo hanya dengan update file ini
 * 3. Support multiple sources: file, API, env variable
 * 4. Tidak ada referensi spesifik ke "BSI" di kode
 * 5. Naming convention: "partner", "sponsor", "supported by"
 * 
 * CARA MENGGUNAKAN:
 * 
 * Opsi 1 - Default (dari file):
 *   import { PARTNER_LOGO_CONFIG } from '@config/partnerLogo'
 *   const logo = PARTNER_LOGO_CONFIG.getLogoPath()
 * 
 * Opsi 2 - Override via ENV:
 *   REACT_APP_PARTNER_LOGO="/custom-logo.png"
 * 
 * Opsi 3 - Override via API:
 *   const config = await fetchPartnerConfig()
 *   usePartnerLogo(config)
 * 
 * ============================================================================
 */

/**
 * PARTNER LOGO CONFIG
 * 
 * Menentukan logo partner/sponsor/supported by yang ditampilkan
 * di berbagai tempat dalam aplikasi (footer, banner, dll)
 * 
 * DEFAULT: Logo di public/partner-logo.png
 * BISA DIGANTI KE: Logo lain dari public folder atau CDN
 */
export const PARTNER_LOGO_CONFIG = {
  /**
   * Flag: Apakah partner logo ditampilkan atau tidak
   * Set ke false untuk hide seluruh section
   */
  enabled: true,

  /**
   * Nama partner/sponsor (untuk alt text dan accessibility)
   * Jangan gunakan nama spesifik seperti "BSI"
   * Gunakan: "Partner", "Sponsor", "Supported By Partner"
   */
  partnerName: 'Supported By Partner',

  /**
   * Path ke logo partner
   * 
   * OPSI 1 - From public folder (recommended):
   * process.env.PUBLIC_URL + '/partner-logo.png'
   * 
   * OPSI 2 - From env variable (for deployment flexibility):
   * process.env.REACT_APP_PARTNER_LOGO_PATH
   * 
   * OPSI 3 - Hardcoded public path:
   * '/partner-logo.png'
   * 
   * FALLBACK - Environment variable override (highest priority):
   * Jika REACT_APP_PARTNER_LOGO_PATH ada, gunakan itu
   */
  getLogoPath: () => {
    // Priority 1: Environment variable (for production flexibility)
    if (process.env.REACT_APP_PARTNER_LOGO_PATH) {
      return process.env.REACT_APP_PARTNER_LOGO_PATH;
    }

    // Priority 2: Default path (from public folder)
    return process.env.PUBLIC_URL + '/partner-logo.png';
  },

  /**
   * Tekst yang ditampilkan di atas logo
   * Gunakan generik: "Supported by", "In partnership with", "With support from"
   * JANGAN gunakan: "Bank Syariah Indonesia", "BSI", dll
   */
  supportText: 'Supported by',

  /**
   * Ukuran logo relative to Baznas logo (dalam persentase)
   * 
   * Baznas = 100px (default)
   * Partner = 60-70% dari Baznas = 60-70px
   * 
   * NILAI: 0.6 sampai 0.7 (60-70%)
   */
  sizeRatio: 0.65, // 65% dari logo utama

  /**
   * Gap/spacing antar logo (dalam Tailwind units)
   * Contoh: 'gap-4' = 1rem (16px)
   */
  spacing: {
    betweenLogos: 'gap-4', // Jarak antar Baznas dan Partner logo
    verticalPadding: 'py-4', // Padding vertical section
  },

  /**
   * RESPONSIVENESS SETTINGS
   * Bagaimana tampilan di berbagai ukuran layar
   */
  responsive: {
    // Mobile: Bayangkan stacked vertical atau smaller
    mobile: {
      sizeRatio: 0.55, // Sedikit lebih kecil di mobile
      direction: 'flex-col', // Susunan vertikal
      align: 'items-center', // Center align
    },
    // Tablet
    tablet: {
      sizeRatio: 0.60,
      direction: 'flex-row',
      align: 'items-center',
    },
    // Desktop
    desktop: {
      sizeRatio: 0.65,
      direction: 'flex-row',
      align: 'items-center',
    },
  },

  /**
   * STYLING CUSTOMIZATION
   * CSS classes dan inline styles
   */
  styling: {
    // Container class untuk section keseluruhan
    containerClass:
      'flex items-center justify-center md:justify-start gap-4 py-4',

    // Class untuk wrapper logo
    logoWrapperClass: 'flex items-center',

    // Class untuk support text
    textClass: 'text-xs md:text-sm text-slate-500 font-medium',

    // Inline style untuk gambar logo
    logoStyle: {
      filter: 'brightness(0.9)', // Sedikit lebih gelap dari Baznas
      opacity: 0.85, // Slightly transparent
    },
  },

  /**
   * FALLBACK BEHAVIOR
   * Apa yang dilakukan jika logo tidak ditemukan
   */
  fallback: {
    // Show placeholder text jika logo error
    showPlaceholder: true,
    // Placeholder text
    placeholderText: 'Supported By',
    // CSS classes untuk placeholder
    placeholderClass:
      'text-xs px-3 py-2 bg-slate-100 text-slate-600 rounded',
  },
};

/**
 * HELPER FUNCTION: Get responsive logo size
 * 
 * @param {string} screenSize - 'mobile', 'tablet', atau 'desktop'
 * @param {number} baznasLogoSize - Ukuran logo Baznas dalam pixel
 * @returns {number} Ukuran logo partner dalam pixel
 * 
 * CONTOH:
 * const partnerSize = getResponsiveLogoSize('mobile', 100)
 * // Returns: 55 (55% dari 100px)
 */
export function getResponsiveLogoSize(screenSize = 'desktop', baznasLogoSize = 100) {
  const config = PARTNER_LOGO_CONFIG;
  const screenConfig = config.responsive[screenSize] || config.responsive.desktop;
  return Math.round(baznasLogoSize * screenConfig.sizeRatio);
}

/**
 * HELPER FUNCTION: Get logo path dengan fallback
 * 
 * @returns {string} Path ke logo, atau empty string jika disabled
 */
export function getPartnerLogoPath() {
  if (!PARTNER_LOGO_CONFIG.enabled) {
    return null;
  }
  return PARTNER_LOGO_CONFIG.getLogoPath();
}

/**
 * HELPER FUNCTION: Check apakah partner logo enabled
 * 
 * @returns {boolean} True jika enabled
 */
export function isPartnerLogoEnabled() {
  return PARTNER_LOGO_CONFIG.enabled;
}

/**
 * ============================================================================
 * CARA MENGUBAH LOGO PARTNER
 * ============================================================================
 * 
 * METODE 1: Via File Replacement (Easiest)
 * ──────────────────────────────────────
 * 1. Ganti file: FrontEnd/public/partner-logo.png
 * 2. Selesai! (tidak perlu edit kode)
 * 
 * METODE 2: Via Environment Variable
 * ───────────────────────────────────
 * 1. Di .env file, tambah:
 *    REACT_APP_PARTNER_LOGO_PATH=/custom-logo.png
 * 2. Restart npm start
 * 3. Logo akan otomatis berubah
 * 
 * METODE 3: Via API Call (For Dynamic Sponsor)
 * ──────────────────────────────────────────
 * 1. Fetch sponsor config dari backend API
 * 2. Pass ke component via props atau context
 * 3. Component akan render dengan logo dari API
 * 
 * METODE 4: Via Inline Override di Komponen
 * ──────────────────────────────────────────
 * 1. Di komponen, pass custom config:
 *    <SupportedBySection customConfig={{ getLogoPath: () => '/my-logo.png' }} />
 * 2. Component akan menggunakan custom logo
 * 
 * ============================================================================
 */

export default PARTNER_LOGO_CONFIG;
