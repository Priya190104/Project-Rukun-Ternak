import React, { useState } from 'react';
import { APP_LOGO } from '../../config/branding';

/**
 * APPLOGO COMPONENT
 * 
 * Komponen reusable untuk menampilkan logo aplikasi di berbagai tempat.
 * Logo ini dikelola terpusat melalui config/branding.js
 * 
 * Props:
 * - size: 'sm' | 'md' | 'lg' | 'xl' (default: 'md')
 * - className: string tambahan untuk styling
 * - variant: 'logo' | 'icon' | 'navbar' | 'full' (default: 'logo')
 * - alt: text alternatif (default: 'Rukun Ternak Logo')
 * 
 * @example
 * <AppLogo size="md" />
 * <AppLogo size="lg" className="rounded-xl shadow-md" />
 * <AppLogo variant="navbar" size="sm" />
 * <AppLogo variant="icon" size="sm" />
 */
export default function AppLogo({
  size = 'md',
  className = '',
  variant = 'logo',
  alt = 'Rukun Ternak Logo',
  style = {},
}) {
  const [imageLoadError, setImageLoadError] = useState(false);

  // Ukuran berdasarkan props
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
    '2xl': 'w-20 h-20',
    '3xl': 'w-24 h-24',
    '4xl': 'w-32 h-32',
  };

  const sizeClass = sizeClasses[size] || sizeClasses.md;

  // Fallback icon variant
  const FallbackIcon = () => (
    <div
      className={`
        ${sizeClass}
        flex items-center justify-center
        rounded-lg font-bold
        bg-gradient-to-br from-emerald-600 to-success-600
        text-white
        flex-shrink-0
        ${className}
      `}
      style={style}
      role="img"
      aria-label={alt}
    >
      <span className={size === 'xs' ? 'text-xs' : size === 'sm' ? 'text-sm' : size === 'md' ? 'text-base' : 'text-lg'}>
        RT
      </span>
    </div>
  );

  // For icon variant, try to load image first, fallback to RT badge
  if (variant === 'icon' || variant === 'navbar') {
    if (imageLoadError) {
      return <FallbackIcon />;
    }

    return (
      <img
        src={APP_LOGO}
        alt={alt}
        className={`${sizeClass} object-contain rounded-lg flex-shrink-0 ${className}`}
        loading="eager"
        onError={() => setImageLoadError(true)}
      />
    );
  }

  if (variant === 'full') {
    // Full variant dengan teks
    const textSizes = {
      xs: 'text-xs',
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
      '2xl': 'text-2xl',
      '3xl': 'text-3xl',
    };

    return (
      <div className={`flex items-center gap-3 ${className}`} style={style}>
        <AppLogo size={size} variant="navbar" />
        <span className={`font-bold text-gray-900 ${textSizes[size] || textSizes.md}`}>
          Rukun Ternak
        </span>
      </div>
    );
  }

  // Default variant - logo image
  if (imageLoadError) {
    return <FallbackIcon />;
  }

  return (
    <img
      src={APP_LOGO}
      alt={alt}
      className={`${sizeClass} object-contain ${className}`}
      loading="eager"
      onError={() => setImageLoadError(true)}
    />
  );
}

