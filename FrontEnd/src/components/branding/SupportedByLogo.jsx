import React, { useState } from 'react';
import { getPartnerLogoPath, calculatePartnerLogoSize, getPartnerLabel } from '../../config/supportedByLogo';

/**
 * SUPPORTED BY LOGO COMPONENT
 * 
 * Simple reusable component untuk logo partner.
 * Fully dynamic - logo dari config, bukan hardcoded.
 * 
 * Usage:
 * <SupportedByLogo mainLogoSize={100} />
 */

export default function SupportedByLogo({
  mainLogoSize = 100,
  customLogoPath = null,
  customLabel = null,
  className = '',
}) {
  const [imageError, setImageError] = useState(false);

  const logoPath = customLogoPath || getPartnerLogoPath();
  
  // Jika tidak ada logo path, jangan render apa-apa
  if (!logoPath) {
    return null;
  }

  const partnerLogoSize = calculatePartnerLogoSize(mainLogoSize);
  const label = customLabel || getPartnerLabel();

  // Jika image error, show text fallback
  if (imageError) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className="text-xs text-gray-500">{label}</span>
      </div>
    );
  }

  // Normal render - dengan logo
  return (
    <div className={`flex items-center gap-2 md:gap-3 ${className}`}>
      {/* Label text */}
      <span className="text-xs md:text-sm text-gray-600 font-medium whitespace-nowrap">
        {label}
      </span>

      {/* Logo image */}
      <img
        src={logoPath}
        alt={label}
        title={label}
        width={partnerLogoSize}
        height={partnerLogoSize}
        style={{
          maxWidth: `${partnerLogoSize}px`,
          height: 'auto',
          maxHeight: '56px',
        }}
        onError={() => setImageError(true)}
        className="object-contain flex-shrink-0"
        loading="lazy"
      />
    </div>
  );
}
