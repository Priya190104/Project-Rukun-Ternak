/**
 * Data Formatting Utilities
 * Centralized formatting functions untuk konsistensi tampilan data
 */

const LOCALE = 'id-ID';

/**
 * Format date untuk display (D MMMM YYYY)
 * @param {string | Date} dateValue - ISO string atau Date object
 * @returns {string} Formatted date atau empty string
 */
function formatDate(dateValue) {
  if (!dateValue) return '';

  try {
    const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
    if (isNaN(date.getTime())) return '';

    return date.toLocaleDateString(LOCALE, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (e) {
    return '';
  }
}

/**
 * Format date dan time (D MMMM YYYY HH:MM)
 * @param {string | Date} dateValue
 * @returns {string}
 */
function formatDateTime(dateValue) {
  if (!dateValue) return '';

  try {
    const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
    if (isNaN(date.getTime())) return '';

    const datePart = date.toLocaleDateString(LOCALE, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const timePart = date.toLocaleTimeString(LOCALE, {
      hour: '2-digit',
      minute: '2-digit'
    });

    return `${datePart} ${timePart}`;
  } catch (e) {
    return '';
  }
}

/**
 * Format date untuk input HTML (YYYY-MM-DD)
 * @param {string | Date} dateValue
 * @returns {string}
 */
function formatDateForInput(dateValue) {
  if (!dateValue) return '';

  try {
    const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
    if (isNaN(date.getTime())) return '';

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  } catch (e) {
    return '';
  }
}

/**
 * Format currency (Indonesia Rupiah)
 * @param {number} amount
 * @returns {string}
 */
function formatCurrency(amount) {
  if (typeof amount !== 'number' || isNaN(amount)) return 'Rp 0';

  return new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Format number dengan separator
 * @param {number} num
 * @returns {string}
 */
function formatNumber(num) {
  if (typeof num !== 'number' || isNaN(num)) return '0';

  return new Intl.NumberFormat(LOCALE).format(num);
}

/**
 * Format percentage
 * @param {number} value - 0-100
 * @param {number} decimals - jumlah desimal
 * @returns {string}
 */
function formatPercentage(value, decimals = 1) {
  if (typeof value !== 'number' || isNaN(value)) return '0%';
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format phone number (display format)
 * @param {string} phone
 * @returns {string}
 */
function formatPhone(phone) {
  if (!phone || typeof phone !== 'string') return '';

  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length < 9) return phone;

  // Format: +62 XXX-XXXX-XXXX or 0XXX-XXXX-XXXX
  if (cleaned.startsWith('62')) {
    return `+62 ${cleaned.slice(2, 5)}-${cleaned.slice(5, 9)}-${cleaned.slice(9)}`;
  } else {
    return `0${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
  }
}

/**
 * Format file size untuk display
 * @param {number} bytes
 * @returns {string}
 */
function formatFileSize(bytes) {
  if (typeof bytes !== 'number' || bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format text untuk display (capitalize first letter)
 * @param {string} text
 * @returns {string}
 */
function formatText(text) {
  if (!text || typeof text !== 'string') return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Format enum value ke readable text
 * @param {string} value - enum value
 * @param {Object} map - mapping object
 * @returns {string}
 */
function formatEnum(value, map = {}) {
  return map[value] || value;
}

/**
 * Format laporan jenis ke readable text
 * @param {string} jenis
 * @returns {string}
 */
function formatLaporanJenis(jenis) {
  const map = {
    'Kelahiran': 'Kelahiran',
    'Kematian': 'Kematian',
    'Kurban-Aqiqah': 'Kurban / Aqiqah',
    'Budidaya-Pakan': 'Budidaya - Pakan',
    'Budidaya-Kandang': 'Budidaya - Kandang',
    'Budidaya-Kesehatan': 'Budidaya - Kesehatan',
    'Populasi': 'Populasi'
  };
  return map[jenis] || jenis;
}

/**
 * Format user role ke readable text
 * @param {string} role
 * @returns {string}
 */
function formatRole(role) {
  const map = {
    'admin': 'Administrator',
    'kelompok': 'Kelompok Ternak',
    'viewer': 'Penonton'
  };
  return map[role] || role;
}

/**
 * Truncate text dengan ellipsis
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
function truncateText(text, maxLength = 50) {
  if (!text || typeof text !== 'string') return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

module.exports = {
  formatDate,
  formatDateTime,
  formatDateForInput,
  formatCurrency,
  formatNumber,
  formatPercentage,
  formatPhone,
  formatFileSize,
  formatText,
  formatEnum,
  formatLaporanJenis,
  formatRole,
  truncateText,
  // Constants
  LOCALE
};
