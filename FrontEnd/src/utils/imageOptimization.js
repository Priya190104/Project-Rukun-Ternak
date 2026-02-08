/**
 * Image Optimization Utilities
 * 
 * Provides functions for optimizing images:
 * - Lazy loading
 * - Responsive sizing
 * - Format conversion (WebP)
 * - Size optimization
 * 
 * @module imageOptimization
 */

/**
 * Generate responsive image srcSet for different screen sizes
 * 
 * @param {string} imagePath - Base image path (with or without extension)
 * @param {Array<number>} widths - Array of widths to generate (optional, used only if responsive variants exist)
 * @returns {Object} { webp: string, jpeg: string } srcSet strings
 * 
 * @example
 * const srcSet = generateSrcSet('/images/hero', [640, 1024, 1920]);
 * // Returns: { webp: "/images/hero-640.webp 640w, /images/hero-1024.webp 1024w...", jpeg: "..." }
 * 
 * // For single images (no responsive variants):
 * const srcSet = generateSrcSet('/logo.png');
 * // Returns: { webp: "/logo.png 1x", jpeg: "/logo.png 1x" }
 */
export const generateSrcSet = (imagePath, widths = [640, 1024, 1920]) => {
  // Check if path has extension
  const hasExtension = /\.(webp|jpg|jpeg|png|gif)$/i.test(imagePath);
  const basePath = hasExtension ? imagePath.replace(/\.(webp|jpg|jpeg|png|gif)$/i, '') : imagePath;
  
  // For responsive images, generate multiple sizes
  // For simple images, return the original path
  const webpSrcSet = widths && widths.length > 0
    ? widths
        .map(width => `${basePath}-${width}.webp ${width}w`)
        .join(', ')
    : `${imagePath} 1x`;

  const jpegSrcSet = widths && widths.length > 0
    ? widths
        .map(width => `${basePath}-${width}.jpg ${width}w`)
        .join(', ')
    : `${imagePath} 1x`;

  return { webp: webpSrcSet, jpeg: jpegSrcSet };
};

/**
 * Generate picture element with WebP and fallback
 * 
 * @param {string} imagePath - Base image path without extension
 * @param {string} alt - Alt text for accessibility
 * @param {Object} options - Configuration options
 * @param {number} options.width - Image width
 * @param {number} options.height - Image height
 * @param {string} options.className - CSS classes
 * @param {Array<number>} options.widths - Responsive widths
 * @param {string} options.objectFit - CSS object-fit value
 * @returns {Object} Picture element data
 * 
 * @example
 * const pictureData = generatePictureElement('/images/hero', 'Hero image', {
 *   width: 1200,
 *   height: 600,
 *   className: 'w-full h-auto',
 *   widths: [640, 1024, 1920]
 * });
 */
export const generatePictureElement = (
  imagePath,
  alt,
  options = {}
) => {
  const {
    width,
    height,
    className = '',
    widths = [640, 1024, 1920],
    objectFit = 'cover',
  } = options;

  return {
    sources: [
      {
        type: 'image/webp',
        srcSet: generateSrcSet(imagePath, 'webp', widths),
      },
      {
        type: 'image/jpeg',
        srcSet: generateSrcSet(imagePath, 'jpg', widths),
      },
    ],
    img: {
      src: `${imagePath}-1024.jpg`,
      alt,
      width,
      height,
      className: `${className} object-${objectFit}`,
      loading: 'lazy',
    },
  };
};

/**
 * Calculate optimal image dimensions for responsive display
 * 
 * @param {number} originalWidth - Original image width
 * @param {number} originalHeight - Original image height
 * @param {number} maxWidth - Maximum display width
 * @returns {Object} { width, height } for optimal dimensions
 * 
 * @example
 * const dimensions = calculateOptimalDimensions(1200, 600, 800);
 * // Returns: { width: 800, height: 400 }
 */
export const calculateOptimalDimensions = (originalWidth, originalHeight, maxWidth) => {
  if (originalWidth <= maxWidth) {
    return { width: originalWidth, height: originalHeight };
  }

  const ratio = originalHeight / originalWidth;
  return {
    width: maxWidth,
    height: Math.round(maxWidth * ratio),
  };
};

/**
 * Check if browser supports WebP
 * 
 * @returns {boolean} true if WebP is supported
 */
export const supportsWebP = () => {
  if (typeof window === 'undefined') return false;

  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  
  return (
    canvas.toDataURL('image/webp').indexOf('image/webp') === 5 &&
    canvas.getContext('2d') !== null
  );
};

/**
 * Get optimal image format based on browser support
 * 
 * @param {string} basePath - Image path (with or without extension)
 * @param {boolean} supportsWebP - Whether browser supports WebP
 * @returns {string} File path with optimal extension (.webp or original format)
 * 
 * @example
 * const imagePath = getOptimalImagePath('/images/hero.jpg', true);
 * // Returns: "/images/hero.webp" if supported, "/images/hero.jpg" otherwise
 * 
 * const imagePath = getOptimalImagePath('/logo.png', false);
 * // Returns: "/logo.png" (PNG unchanged)
 */
export const getOptimalImagePath = (basePath, supportsWebP = false) => {
  // If no extension, assume jpg and return as-is
  if (!/\.(webp|jpg|jpeg|png|gif)$/i.test(basePath)) {
    return basePath;
  }

  // If WebP is supported and it's not already WebP, convert to WebP
  if (supportsWebP && !/\.webp$/i.test(basePath)) {
    return basePath.replace(/\.(jpg|jpeg|png|gif)$/i, '.webp');
  }

  // Return original path
  return basePath;
};

/**
 * Create placeholder image (blur effect)
 * 
 * @param {string} color - Placeholder color (hex)
 * @param {number} width - Width in pixels
 * @param {number} height - Height in pixels
 * @returns {string} Base64 encoded SVG data URL
 * 
 * @example
 * const placeholder = createPlaceholder('#e5e7eb', 1200, 600);
 * // Use as src or background image
 */
export const createPlaceholder = (color = '#e5e7eb', width = 1200, height = 600) => {
  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${width}" height="${height}" fill="${color}"/>
  </svg>`;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

/**
 * Image loading hook configuration
 * 
 * @typedef {Object} ImageLoadConfig
 * @property {string} src - Image source
 * @property {string} alt - Alt text
 * @property {string} placeholder - Placeholder image/color
 * @property {boolean} lazy - Enable lazy loading
 * @property {Function} onLoad - Callback when image loads
 * @property {Function} onError - Callback on load error
 */

/**
 * Best practices for image optimization:
 * 
 * 1. **Format Selection**:
 *    - WebP for modern browsers (20-30% smaller)
 *    - JPEG as fallback (baseline compression)
 *    - PNG only for transparency needs
 *    - Avoid BMP, TIFF in web
 * 
 * 2. **Responsive Images**:
 *    - Use srcSet for different device sizes
 *    - Use picture element for art direction
 *    - Min: 640px, 1024px, 1920px variants
 * 
 * 3. **Lazy Loading**:
 *    - Use loading="lazy" for below-fold images
 *    - Intersection Observer for custom logic
 *    - Always provide dimensions to prevent layout shift
 * 
 * 4. **Compression**:
 *    - JPEG: 75-85% quality typically optimal
 *    - WebP: 80% quality ~ JPEG 90% quality
 *    - Use tools: ImageOptim, TinyPNG, Squoosh
 * 
 * 5. **Dimensions**:
 *    - Never load images larger than needed
 *    - Use CSS aspect-ratio to prevent layout shift
 *    - Provide explicit width/height on img tags
 * 
 * 6. **Delivery**:
 *    - Use CDN for serving images
 *    - Enable gzip compression
 *    - Consider image hosting service (Cloudinary, Imgix)
 * 
 * @example
 * // Best practice implementation
 * <picture>
 *   <source type="image/webp" srcSet={generateSrcSet('/img/hero', 'webp')} />
 *   <source type="image/jpeg" srcSet={generateSrcSet('/img/hero', 'jpg')} />
 *   <img
 *     src="/img/hero-1024.jpg"
 *     alt="Hero banner"
 *     width={1200}
 *     height={600}
 *     loading="lazy"
 *     className="w-full h-auto object-cover"
 *   />
 * </picture>
 */

/**
 * Image optimization checklist for developers:
 * 
 * □ Use WebP format with JPEG fallback
 * □ Implement lazy loading for below-fold images
 * □ Provide explicit width/height on img tags
 * □ Use srcSet for responsive images
 * □ Use picture element for art direction
 * □ Optimize file sizes (target: < 100KB for hero)
 * □ Compress all images (75-85% JPEG quality)
 * □ Test with Lighthouse
 * □ Monitor with Web Vitals (LCP, CLS)
 * □ Consider image hosting service for dynamic resizing
 */
