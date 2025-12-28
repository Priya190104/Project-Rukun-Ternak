/**
 * ============================================================================
 * BRANDING CONFIGURATION - SUPPORTED BY LOGO
 * ============================================================================
 * 
 * CENTRALIZED SOURCE untuk logo "Supported By" partner.
 * Logo diambil dari file ini, BUKAN hardcoded di komponen.
 * 
 * ⚠️  UNTUK MENGGANTI LOGO (PALING MUDAH):
 * 1. Ganti file: FrontEnd/public/partner-logo.png
 * 2. Refresh browser
 * 3. SELESAI - Komponen otomatis update (NO CODE CHANGE NEEDED!)
 * 
 * Atau edit config di bawah jika perlu path berbeda.
 */

// ============================================================================
// LOGO CONFIGURATION - SIMPLE & FUNCTIONAL
// ============================================================================

export const SUPPORTED_BY_CONFIG = {
  // Feature flag - set false untuk hide logo
  enabled: true,

  // Logo path - MUDAH diganti
  // Default: FrontEnd/public/partner-logo.png
  logoPath: process.env.PUBLIC_URL + '/partner-logo.png',

  // Teks label - generic (NOT institution-specific)
  label: 'Supported by',

  // Size ratio vs main Baznas logo (0.6 = 60%, 0.65 = 65%, 0.7 = 70%)
  sizeRatio: 0.65,
};


// ============================================================================
// SIMPLE HELPER FUNCTIONS
// ============================================================================

/**
 * Hitung ukuran logo partner (dari ukuran logo Baznas)
 */
export function calculatePartnerLogoSize(mainLogoSize = 100) {
  return Math.round(mainLogoSize * SUPPORTED_BY_CONFIG.sizeRatio);
}

/**
 * Get logo path
 */
export function getPartnerLogoPath() {
  if (!SUPPORTED_BY_CONFIG.enabled) return null;
  return SUPPORTED_BY_CONFIG.logoPath;
}

/**
 * Get label text
 */
export function getPartnerLabel() {
  return SUPPORTED_BY_CONFIG.label;
}

export default SUPPORTED_BY_CONFIG;
