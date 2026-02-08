/**
 * Color Class Mapper - Konversi dari hardcoded Tailwind ke centralized color system
 * Fungsi helper untuk membuat migration lebih mudah
 */

/**
 * Map hardcoded Tailwind color classes ke centralized system
 * @param {string} tailwindClass - Tailwind class string
 * @returns {string} Mapped class string
 */
export const mapColorClass = (tailwindClass) => {
  if (!tailwindClass) return tailwindClass;

  const mappings = {
    // Blue to Primary
    'text-blue-600': 'text-info',
    'text-blue-700': 'text-primary',
    'text-blue-800': 'text-primary-700',
    'text-blue-900': 'text-primary-900',
    'bg-blue-50': 'bg-primary-50',
    'bg-blue-100': 'bg-primary-100',
    'bg-blue-200': 'bg-primary-200',
    'bg-blue-600': 'bg-primary-600',
    'border-blue-200': 'border-primary-200',
    'border-blue-600': 'border-primary-600',
    'from-blue-600': 'from-primary-600',
    'to-blue-50': 'to-primary-50',

    // Red to Danger  
    'text-red-600': 'text-danger',
    'text-red-700': 'text-danger',
    'text-red-800': 'text-danger',
    'bg-red-50': 'bg-danger-bg',
    'bg-red-100': 'bg-danger-light',
    'border-red-200': 'border-danger',
    'border-red-600': 'border-danger',

    // Green to Success
    'text-green-600': 'text-success',
    'text-green-700': 'text-success',
    'text-green-800': 'text-success',
    'bg-green-50': 'bg-success-bg',
    'bg-green-100': 'bg-success-light',
    'border-green-600': 'border-success',

    // Yellow/Amber to Warning
    'text-yellow-600': 'text-warning',
    'text-amber-600': 'text-warning',
    'bg-yellow-50': 'bg-warning-bg',
    'bg-yellow-100': 'bg-warning-light',
    'bg-amber-50': 'bg-warning-bg',
    'bg-amber-100': 'bg-warning-light',

    // Purple to Info
    'text-purple-600': 'text-info',
    'bg-purple-100': 'bg-info-light',
    'border-purple-600': 'border-info',

    // Gray to Muted (keep gray mostly same)
    'text-gray-500': 'text-gray-500',
    'text-gray-600': 'text-muted',
    'text-gray-700': 'text-gray-700',
    'text-gray-900': 'text-gray-900',
  };

  return mappings[tailwindClass] || tailwindClass;
};

/**
 * Map color prop (untuk components dengan color prop)
 * @param {string} colorProp - Color prop value seperti "bg-blue-100 text-blue-600"
 * @returns {string} Mapped color prop
 */
export const mapColorProp = (colorProp) => {
  if (!colorProp) return colorProp;

  return colorProp
    .split(' ')
    .map(cls => mapColorClass(cls))
    .join(' ');
};

/**
 * Batch replace multiple color classes dalam string
 * Berguna untuk mengganti className dengan banyak color classes
 * @param {string} classString - String dengan class-class
 * @returns {string} Mapped class string
 */
export const mapClassString = (classString) => {
  if (!classString) return classString;

  return classString
    .split(/\s+/)
    .map(cls => mapColorClass(cls))
    .filter(Boolean)
    .join(' ');
};

/**
 * Helper untuk status colors - automatic mapping
 * @param {string} status - Status value (AKTIF, TIDAK_AKTIF, TERJUAL, success, error, etc)
 * @returns {string} Appropriate color classes
 */
export const getStatusColorClass = (status) => {
  const statusColorMap = {
    // Animal status
    AKTIF: 'bg-success-light text-success',
    'TIDAK_AKTIF': 'bg-gray-100 text-gray-600',
    TERJUAL: 'bg-info-light text-info',

    // Generic status
    success: 'bg-success-light text-success',
    error: 'bg-danger-light text-danger',
    warning: 'bg-warning-light text-warning',
    info: 'bg-info-light text-info',

    // Role
    admin: 'bg-danger-light text-danger',
    kelompok: 'bg-success-light text-success',
    viewer: 'bg-info-light text-info',
  };

  return statusColorMap[status] || 'bg-gray-100 text-gray-600';
};
