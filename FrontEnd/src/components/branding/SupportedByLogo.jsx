import React, { useState } from 'react';
import { getPartnerLogoPath, getPartnerLabel } from '../../config/supportedByLogo';

/**
 * SUPPORTED BY LOGO COMPONENT
 * 
 * Simple reusable component untuk logo partner.
 * Fully dynamic - logo dari config, bukan hardcoded.
 * 
 * Usage:
 * <SupportedByLogo />
 * <SupportedByLogo size="md" />
 * <SupportedByLogo size="lg" />
 * <SupportedByLogo size="xl" />
 * <SupportedByLogo customLabel="Powered by" />
 */

const SIZE_CONFIG = {
  sm: {
    container: 'h-5',
    text: 'text-xs',
    gap: 'gap-1',
    width: 60,
    height: 20,
  },
  md: {
    container: 'h-8',
    text: 'text-xs md:text-sm',
    gap: 'gap-2 md:gap-3',
    width: 80,
    height: 32,
  },
  lg: {
    container: 'h-10',
    text: 'text-sm md:text-base',
    gap: 'gap-2 md:gap-3',
    width: 100,
    height: 40,
  },
  xl: {
    container: 'h-12',
    text: 'text-base md:text-lg',
    gap: 'gap-3',
    width: 120,
    height: 48,
  },
};

export default function SupportedByLogo({
  customLogoPath = null,
  customLabel = null,
  className = '',
  size = 'md',
}) {
  const [imageError, setImageError] = useState(false);

  const sizeConfig = SIZE_CONFIG[size] || SIZE_CONFIG.md;
  const logoPath = customLogoPath || getPartnerLogoPath();
  
  // Jika tidak ada logo path, jangan render apa-apa
  if (!logoPath) {
    return null;
  }

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
    <div className={`flex items-center ${sizeConfig.gap} ${className}`}>
      {/* Label text */}
      <span className={`${sizeConfig.text} text-gray-700 font-medium whitespace-nowrap`}>
        {label}
      </span>

      {/* Logo image */}
      <img
        src={logoPath}
        alt={label}
        className={`object-contain flex-shrink-0 ${sizeConfig.container} w-auto`}
        width={sizeConfig.width}
        height={sizeConfig.height}
        loading="eager"
        onError={() => setImageError(true)}
      />
    </div>
  );
}

