import React, { useState } from 'react';
import { PARTNER_LOGO_CONFIG, getResponsiveLogoSize } from '../../config/partnerLogo';

/**
 * ============================================================================
 * SUPPORTED BY SECTION COMPONENT
 * ============================================================================
 * 
 * PURPOSE:
 * Menampilkan logo "Supported by" secara dinamis tanpa hardcode nama partner.
 * Logo dapat dengan mudah diganti via config, env, atau props.
 * 
 * FEATURES:
 * ✅ Fully dynamic - tidak hardcode ke BSI atau partner manapun
 * ✅ Responsive - berbeda tampilan di mobile, tablet, desktop
 * ✅ Flexible sizing - ukuran logo relative to main logo
 * ✅ Fallback behavior - graceful handling jika logo not found
 * ✅ Accessibility - proper alt text dan semantic HTML
 * ✅ Reusable - dapat digunakan di footer, banner, atau tempat lain
 * ✅ Customizable - bisa override config via props
 * 
 * USAGE:
 * ──────
 * 
 * Basic (menggunakan default config):
 * <SupportedBySection mainLogoSize={100} />
 * 
 * Custom (override config):
 * <SupportedBySection 
 *   mainLogoSize={100}
 *   customText="In partnership with"
 *   customLogoPath="/custom-logo.png"
 * />
 * 
 * No section (jika disabled di config):
 * Komponen tidak render apa-apa
 * 
 * ============================================================================
 */

export default function SupportedBySection({
  // Ukuran logo utama (Baznas) dalam pixel - untuk menghitung ukuran partner
  mainLogoSize = 100,

  // Optional: Override tekst "Supported by"
  customText = null,

  // Optional: Override path logo partner
  customLogoPath = null,

  // Optional: Override config keseluruhan
  customConfig = null,

  // Optional: CSS class tambahan
  className = '',

  // Optional: Callback jika logo error
  onLogoError = null,

  // Optional: Layout direction (flex-row atau flex-col)
  direction = null,
}) {
  // State untuk tracking jika logo error
  const [logoError, setLogoError] = useState(false);

  // Use custom config jika provided, otherwise use default
  const config = customConfig || PARTNER_LOGO_CONFIG;

  // Jika feature disabled di config, jangan render apa-apa
  if (!config.enabled) {
    return null;
  }

  // Get logo path - priority: customLogoPath > config.getLogoPath()
  const logoPath = customLogoPath || config.getLogoPath();

  // Jika tidak ada logo path, return null
  if (!logoPath) {
    return null;
  }

  // Get support text
  const supportText = customText || config.supportText;

  // Hitung ukuran logo partner
  const partnerLogoSize = getResponsiveLogoSize('desktop', mainLogoSize);

  // Handle image error
  const handleImageError = () => {
    setLogoError(true);
    if (onLogoError) {
      onLogoError();
    }
  };

  // Render fallback jika logo error
  if (logoError && config.fallback.showPlaceholder) {
    return (
      <div className={`${config.styling.containerClass} ${className}`}>
        <div className={config.fallback.placeholderClass}>
          {config.fallback.placeholderText}
        </div>
      </div>
    );
  }

  // Tentukan layout direction
  const layoutDirection = direction || config.styling.containerClass;

  return (
    <div
      className={`
        flex 
        items-center 
        justify-center 
        md:justify-start 
        gap-4 
        py-4 
        ${className}
      `}
    >
      {/* Support Text - "Supported by" */}
      <div className={config.styling.textClass}>{supportText}</div>

      {/* Partner Logo */}
      <div className="flex items-center flex-shrink-0">
        <img
          src={logoPath}
          alt={config.partnerName}
          title={config.partnerName}
          width={partnerLogoSize}
          height={partnerLogoSize}
          style={{
            ...config.styling.logoStyle,
            maxWidth: `${partnerLogoSize}px`,
            height: 'auto',
          }}
          onError={handleImageError}
          className="object-contain"
          loading="lazy"
        />
      </div>
    </div>
  );
}

/**
 * ============================================================================
 * VARIANT: HORIZONTAL LAYOUT (Logo Baznas + Partner Side by Side)
 * ============================================================================
 * 
 * Gunakan component ini untuk menampilkan kedua logo secara horizontal
 * (Baznas di kiri, Partner di kanan)
 * 
 * USAGE:
 * <SupportedByLogoBadge mainLogo={<AppLogo />} mainLogoSize={100} />
 * 
 */
export function SupportedByLogoBadge({
  // Component logo utama (bukan path, tapi JSX component)
  mainLogo = null,

  // Ukuran main logo (untuk kalkulasi partner logo size)
  mainLogoSize = 100,

  // Optional: Override custom config
  customConfig = null,

  // Optional: Custom styling
  className = '',

  // Optional: Arah layout
  layoutDirection = 'row', // 'row' atau 'col'
}) {
  // State untuk tracking jika logo error - MUST be before any early returns
  const [logoError, setLogoError] = useState(false);

  const config = customConfig || PARTNER_LOGO_CONFIG;

  if (!config.enabled) {
    return mainLogo || null;
  }

  const logoPath = config.getLogoPath();
  if (!logoPath) {
    return mainLogo || null;
  }

  const partnerLogoSize = getResponsiveLogoSize('desktop', mainLogoSize);

  if (logoError && config.fallback.showPlaceholder) {
    return mainLogo || null;
  }

  return (
    <div
      className={`
        flex 
        ${layoutDirection === 'row' ? 'flex-row' : 'flex-col'} 
        items-center 
        ${layoutDirection === 'row' ? 'gap-4' : 'gap-2'} 
        ${className}
      `}
    >
      {/* Main Logo (Baznas) */}
      <div className="flex-shrink-0">{mainLogo}</div>

      {/* Support Text + Partner Logo */}
      <div className="flex items-center gap-2">
        <span className={config.styling.textClass}>{config.supportText}</span>
        <img
          src={logoPath}
          alt={config.partnerName}
          title={config.partnerName}
          width={partnerLogoSize}
          height={partnerLogoSize}
          style={{
            ...config.styling.logoStyle,
            maxWidth: `${partnerLogoSize}px`,
            height: 'auto',
          }}
          onError={() => setLogoError(true)}
          className="object-contain flex-shrink-0"
          loading="lazy"
        />
      </div>
    </div>
  );
}
