import { useEffect, useRef, useState } from 'react';

/**
 * useLazyImage - Hook untuk optimized image lazy loading
 * 
 * Fitur:
 * - Intersection Observer untuk true lazy loading
 * - Placeholder support
 * - Error handling
 * - Memory efficient
 * 
 * @param {string} src - Image source URL
 * @param {Object} options - Configuration options
 * @param {string} options.placeholder - Placeholder image/color
 * @param {Function} options.onLoad - Callback when image loads
 * @param {Function} options.onError - Callback on load error
 * @param {number} options.threshold - Intersection threshold (0-1)
 * @param {string} options.rootMargin - Preload margin (e.g., '50px')
 * @returns {Object} { ref, isLoaded, error }
 * 
 * @example
 * const { ref, isLoaded } = useLazyImage('/images/large.webp', {
 *   placeholder: '/images/small.jpg',
 *   onLoad: () => console.log('loaded')
 * });
 * 
 * return (
 *   <div ref={ref}>
 *     <img 
 *       data-src="/images/large.webp"
 *       src={placeholder}
 *       alt="Lazy loaded"
 *     />
 *   </div>
 * );
 */
export const useLazyImage = (
  src,
  options = {}
) => {
  const {
    placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 600"%3E%3Crect fill="%23e5e7eb" width="1200" height="600"/%3E%3C/svg%3E',
    onLoad = null,
    onError = null,
    threshold = 0.1,
    rootMargin = '50px',
  } = options;

  const ref = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const img = ref.current;
    if (!img) return;

    // For browser native lazy loading support
    if ('loading' in HTMLImageElement.prototype) {
      img.src = src;
      img.onload = () => {
        setIsLoaded(true);
        onLoad?.();
      };
      img.onerror = (err) => {
        setError(err);
        onError?.(err);
      };
      return;
    }

    // Fallback to Intersection Observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const image = entry.target;
            image.src = src;

            image.onload = () => {
              setIsLoaded(true);
              onLoad?.();
              observer.unobserve(image);
            };

            image.onerror = (err) => {
              setError(err);
              onError?.(err);
              observer.unobserve(image);
            };
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(img);

    return () => {
      if (img) observer.unobserve(img);
    };
  }, [src, onLoad, onError, threshold, rootMargin]);

  return { ref, isLoaded, error };
};

/**
 * useImagePreload - Preload images untuk better performance
 * 
 * @param {Array<string>} imageSources - Array of image URLs to preload
 * @param {Object} options - Configuration options
 * @param {Function} options.onAllLoaded - Callback when all images loaded
 * @returns {Object} { loaded, total, percent }
 * 
 * @example
 * const { loaded, total, percent } = useImagePreload([
 *   '/images/hero.webp',
 *   '/images/secondary.webp'
 * ]);
 * 
 * return <div>Loading: {percent}%</div>;
 */
export const useImagePreload = (imageSources = [], options = {}) => {
  const { onAllLoaded = null } = options;
  const [loadedCount, setLoadedCount] = useState(0);

  useEffect(() => {
    if (!imageSources.length) return;

    let count = 0;

    const preloadImage = (src) => {
      const img = new Image();
      img.onload = () => {
        count++;
        setLoadedCount(count);

        if (count === imageSources.length) {
          onAllLoaded?.();
        }
      };
      img.onerror = () => {
        count++;
        setLoadedCount(count);

        if (count === imageSources.length) {
          onAllLoaded?.();
        }
      };
      img.src = src;
    };

    imageSources.forEach(preloadImage);
  }, [imageSources, onAllLoaded]);

  return {
    loaded: loadedCount,
    total: imageSources.length,
    percent: imageSources.length ? Math.round((loadedCount / imageSources.length) * 100) : 0,
  };
};

/**
 * useResponsiveImage - Hook untuk responsive image srcSet management
 * 
 * @param {string} basePath - Base image path
 * @param {Array<number>} widths - Responsive widths
 * @returns {Object} { srcSet, sizes }
 * 
 * @example
 * const { srcSet, sizes } = useResponsiveImage('/images/hero', [640, 1024, 1920]);
 */
export const useResponsiveImage = (basePath, widths = [640, 1024, 1920]) => {
  const srcSet = widths
    .map(width => `${basePath}-${width}.webp ${width}w`)
    .join(', ');

  const sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1200px';

  return { srcSet, sizes };
};
