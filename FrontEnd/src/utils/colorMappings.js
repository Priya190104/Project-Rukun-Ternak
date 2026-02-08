/**
 * Color Mapping untuk Migration
 * Mapping dari Tailwind classes lama ke class baru dari color system
 */

const colorMappings = {
  // Blue colors -> Primary
  'text-blue-600': 'text-primary',
  'text-blue-700': 'text-primary-700',
  'text-blue-900': 'text-primary-900',
  'bg-blue-50': 'bg-primary-50',
  'bg-blue-100': 'bg-primary-100',
  'bg-blue-200': 'bg-primary-200',
  'bg-blue-600': 'bg-primary-600',
  'border-blue-200': 'border-primary-200',
  'border-blue-600': 'border-primary-600',
  
  // Red colors -> Danger
  'text-red-600': 'text-danger',
  'text-red-700': 'text-danger',
  'bg-red-50': 'bg-danger-bg',
  'bg-red-100': 'bg-danger-light',
  'border-red-200': 'border-danger',
  'border-red-600': 'border-danger',
  
  // Green colors -> Success
  'text-green-600': 'text-success',
  'text-green-700': 'text-success',
  'bg-green-50': 'bg-success-bg',
  'bg-green-100': 'bg-success-light',
  'border-green-600': 'border-success',
  
  // Yellow/Amber colors -> Warning
  'text-yellow-600': 'text-warning',
  'bg-yellow-50': 'bg-warning-bg',
  'bg-yellow-100': 'bg-warning-light',
  
  // Gray colors (keep mostly the same but standardized)
  'text-gray-500': 'text-gray-500',
  'text-gray-600': 'text-muted',
  'text-gray-700': 'text-gray-700',
  'text-gray-900': 'text-gray-900',
  'bg-gray-50': 'bg-gray-50',
  'bg-gray-100': 'bg-gray-100',
  'border-gray-200': 'border-gray-200',
  'border-gray-300': 'border-gray-300',
  
  // Purple colors
  'text-purple-600': 'text-info',
  'bg-purple-100': 'bg-info-light',
  'border-purple-600': 'border-info',
};

module.exports = colorMappings;
