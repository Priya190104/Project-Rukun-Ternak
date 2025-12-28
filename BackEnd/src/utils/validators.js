/**
 * Input Validation Utilities
 * Centralized validation functions untuk mencegah duplikasi logic
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^(\+62|0)[0-9]{9,12}$/;
const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,}$/;
const PASSWORD_MIN_LENGTH = 6;

/**
 * Validate required fields
 * @param {Object} data - Data to validate
 * @param {Array<string>} fields - Required field names
 * @returns {Object} {isValid: boolean, errors: Array<string>}
 */
function validateRequired(data, fields) {
  const errors = [];
  fields.forEach(field => {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      errors.push(`${field} is required`);
    }
  });
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate email format
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  return EMAIL_REGEX.test(email.trim());
}

/**
 * Validate phone number (Indonesia format)
 * @param {string} phone
 * @returns {boolean}
 */
function isValidPhone(phone) {
  if (!phone || typeof phone !== 'string') return false;
  return PHONE_REGEX.test(phone.replace(/\s/g, ''));
}

/**
 * Validate username format
 * @param {string} username
 * @returns {boolean}
 */
function isValidUsername(username) {
  if (!username || typeof username !== 'string') return false;
  return USERNAME_REGEX.test(username);
}

/**
 * Validate password strength
 * @param {string} password
 * @returns {Object} {isValid: boolean, errors: Array<string>}
 */
function validatePassword(password) {
  const errors = [];
  if (!password || password.length < PASSWORD_MIN_LENGTH) {
    errors.push(`Password harus minimal ${PASSWORD_MIN_LENGTH} karakter`);
  }
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate user registration data
 * @param {Object} data - {username, password, email, full_name}
 * @returns {Object} {isValid: boolean, errors: Array<string>}
 */
function validateUserRegistration(data) {
  const errors = [];

  // Check required fields
  const { isValid: reqValid, errors: reqErrors } = validateRequired(data, ['username', 'password', 'full_name']);
  if (!reqValid) errors.push(...reqErrors);

  // Username format
  if (data.username && !isValidUsername(data.username)) {
    errors.push('Username must contain only letters, numbers, and underscores (min 3 characters)');
  }

  // Password strength
  if (data.password) {
    const { errors: pwdErrors } = validatePassword(data.password);
    errors.push(...pwdErrors);
  }

  // Email if provided
  if (data.email && !isValidEmail(data.email)) {
    errors.push('Invalid email format');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate kelompok data
 * @param {Object} data - Kelompok data
 * @returns {Object} {isValid: boolean, errors: Array<string>}
 */
function validateKelompok(data) {
  const errors = [];

  const { isValid: reqValid, errors: reqErrors } = validateRequired(data, ['name', 'desa', 'kecamatan']);
  if (!reqValid) errors.push(...reqErrors);

  if (data.pic1_no_hp && !isValidPhone(data.pic1_no_hp)) {
    errors.push('Invalid phone number format for PIC 1');
  }

  if (data.pic2_no_hp && !isValidPhone(data.pic2_no_hp)) {
    errors.push('Invalid phone number format for PIC 2');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate laporan data
 * @param {Object} data - Laporan data
 * @returns {Object} {isValid: boolean, errors: Array<string>}
 */
function validateLaporan(data) {
  const errors = [];

  const { isValid: reqValid, errors: reqErrors } = validateRequired(data, ['jenis', 'tanggal']);
  if (!reqValid) errors.push(...reqErrors);

  // Validate date format (YYYY-MM-DD)
  if (data.tanggal && !/^\d{4}-\d{2}-\d{2}$/.test(data.tanggal)) {
    errors.push('Invalid date format (use YYYY-MM-DD)');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Sanitize string input (remove XSS risks)
 * @param {string} str
 * @returns {string}
 */
function sanitizeString(str) {
  if (typeof str !== 'string') return '';
  return str
    .trim()
    .replace(/[<>]/g, '') // Remove dangerous brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .slice(0, 500); // Limit length
}

module.exports = {
  validateRequired,
  isValidEmail,
  isValidPhone,
  isValidUsername,
  validatePassword,
  validateUserRegistration,
  validateKelompok,
  validateLaporan,
  sanitizeString,
  // Constants
  EMAIL_REGEX,
  PHONE_REGEX,
  USERNAME_REGEX,
  PASSWORD_MIN_LENGTH
};
