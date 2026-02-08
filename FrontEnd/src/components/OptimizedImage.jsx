import React, { useState } from 'react';

/**
 * OptimizedImage - Simple image component with error handling
 * 
 * Fitur:
 * - Basic image rendering
 * - Lazy loading support
 * - Error handling
 * 
 * @param {Object} props
 * @param {string} props.src - Image source URL
 * @param {string} props.alt - Alt text
 * @param {string} props.className - CSS classes
 * @param {boolean} props.lazy - Enable lazy loading (default: true)
 * @param {Function} props.onLoad - Load callback
 * @param {Function} props.onError - Error callback
 * @param {number} props.width - Fixed width (optional)
 * @param {number} props.height - Fixed height (optional)
 * 
 * @example
 * // Basic usage
 * <OptimizedImage 
 *   src="/images/logo.png" 
 *   alt="Logo"
 *   className="w-10 h-10"
 * />
 * 
 * @example
 * // Disable lazy loading for above-fold images
 * <OptimizedImage 
 *   src="/images/hero.png"
 *   alt="Hero"
 *   lazy={false}
 * />
 */
const OptimizedImage = React.forwardRef(
  (
    {
      src,
      alt = 'Image',
      className = '',
      lazy = true,
      onLoad = null,
      onError = null,
      width = null,
      height = null,
      ...props
    },
    ref
  ) => {
    const [hasError, setHasError] = useState(false);

    // Jika error, jangan render apapun
    if (hasError) {
      return null;
    }

    return (
      <img
        ref={ref}
        src={src}
        alt={alt}
        className={className}
        loading={lazy ? 'lazy' : 'eager'}
        width={width}
        height={height}
        onLoad={() => {
          onLoad?.();
        }}
        onError={(err) => {
          setHasError(true);
          console.warn(`Failed to load image: ${src}`);
          onError?.(err);
        }}
        {...props}
      />
    );
  }
);

OptimizedImage.displayName = 'OptimizedImage';

export default OptimizedImage;


