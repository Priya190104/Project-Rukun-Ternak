/**
 * Format datetime to Indonesian locale with WIB timezone
 * @param {string | Date} dateString - ISO datetime string or Date object
 * @returns {string} Formatted date like "17 Desember 2025, 14:30 WIB"
 */
export const formatBeritaDate = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return '';
    }
    
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Jakarta',
    };
    
    const formatter = new Intl.DateTimeFormat('id-ID', options);
    const formatted = formatter.format(date);
    
    // Add WIB timezone indicator
    return `${formatted} WIB`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

/**
 * Get the time to display for berita (publishedAt or fallback to createdAt)
 * @param {Object} berita - Berita object with publishedAt and createdAt
 * @returns {string} Formatted date string
 */
export const getBeritaDisplayDate = (berita) => {
  if (!berita) return '';
  
  // Use publishedAt if available, otherwise use createdAt
  const dateToDisplay = berita.publishedAt || berita.createdAt;
  
  return formatBeritaDate(dateToDisplay);
};
