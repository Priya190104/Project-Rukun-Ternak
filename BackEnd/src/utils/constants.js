/**
 * Shared Constants
 * Centralized constants untuk menghindari magic strings/numbers
 */

// HTTP Status Codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500
};

// User Roles
const USER_ROLES = {
  ADMIN: 'admin',
  KELOMPOK: 'kelompok',
  VIEWER: 'viewer'
};

const ROLE_DISPLAY_NAME = {
  'admin': 'Administrator',
  'kelompok': 'Kelompok Ternak',
  'viewer': 'Penonton'
};

// User Status
const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending'
};

// Laporan Types / Jenis Laporan
const LAPORAN_JENIS = {
  KELAHIRAN: 'Kelahiran',
  KEMATIAN: 'Kematian',
  KURBAN_AQIQAH: 'Kurban-Aqiqah',
  BUDIDAYA_PAKAN: 'Budidaya-Pakan',
  BUDIDAYA_KANDANG: 'Budidaya-Kandang',
  BUDIDAYA_KESEHATAN: 'Budidaya-Kesehatan',
  POPULASI: 'Populasi'
};

const LAPORAN_JENIS_DISPLAY = {
  'Kelahiran': 'Kelahiran',
  'Kematian': 'Kematian',
  'Kurban-Aqiqah': 'Kurban / Aqiqah',
  'Budidaya-Pakan': 'Budidaya - Pakan',
  'Budidaya-Kandang': 'Budidaya - Kandang',
  'Budidaya-Kesehatan': 'Budidaya - Kesehatan',
  'Populasi': 'Populasi'
};

const LAPORAN_JENIS_ARRAY = Object.values(LAPORAN_JENIS);

// Animal Types / Jenis Ternak
const JENIS_TERNAK = {
  DOMBA: 'Domba',
  KAMBING: 'Kambing',
  SAPI: 'Sapi',
  KERBAU: 'Kerbau'
};

const JENIS_TERNAK_ARRAY = Object.values(JENIS_TERNAK);

// Animal Gender / Jenis Kelamin
const JENIS_KELAMIN = {
  JANTAN: 'Jantan',
  BETINA: 'Betina'
};

const JENIS_KELAMIN_ARRAY = Object.values(JENIS_KELAMIN);

// Health Status / Status Kesehatan
const HEALTH_STATUS = {
  SEHAT: 'Sehat',
  SAKIT: 'Sakit',
  CEMAS: 'Cemas'
};

const HEALTH_STATUS_ARRAY = Object.values(HEALTH_STATUS);

// Feed Type / Jenis Pakan
const PAKAN_JENIS = {
  RUMPUT: 'Rumput',
  HIJAUAN: 'Hijauan',
  KONSENTRAT: 'Konsentrat',
  LIMBAH: 'Limbah'
};

const PAKAN_JENIS_ARRAY = Object.values(PAKAN_JENIS);

// Shed Type / Jenis Kandang
const KANDANG_JENIS = {
  PERMANEN: 'Permanen',
  SEMI_PERMANEN: 'Semi-Permanen',
  SEMI_PORTABLE: 'Semi-Portable'
};

// Pagination defaults
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  MIN_LIMIT: 1
};

// File upload
const FILE_UPLOAD = {
  MAX_SIZE_MB: 5,
  MAX_SIZE_BYTES: 5 * 1024 * 1024,
  ALLOWED_FORMATS: ['jpg', 'jpeg', 'png', 'gif'],
  UPLOAD_DIR: 'uploads'
};

// Banner
const BANNER = {
  MAX_SIZE_MB: 5,
  MAX_SIZE_BYTES: 5 * 1024 * 1024,
  ALLOWED_FORMATS: ['jpg', 'jpeg'],
  STATUS_ACTIVE: true,
  STATUS_INACTIVE: false,
  UPLOAD_DIR: 'uploads'
};

// Certificate
const CERTIFICATE = {
  PAPER_SIZES: {
    A4: 'A4',
    A5: 'A5',
    LETTER: 'Letter'
  },
  DEFAULT_PAPER: 'A4',
  FORMAT_PDF: 'pdf',
  ASSET_DIR: 'assets',
  OUTPUT_DIR: 'certificates'
};

// Search/Filter defaults
const SEARCH = {
  DEFAULT_SORT: 'created_at',
  SORT_ORDER_ASC: 'asc',
  SORT_ORDER_DESC: 'desc',
  DEFAULT_ORDER: 'desc'
};

// Time constants
const TIME = {
  JWT_EXPIRES_IN: '7d',
  SESSION_TIMEOUT_MINUTES: 30,
  CACHE_TTL_SECONDS: 3600
};

// Validation rules
const VALIDATION = {
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 50,
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_MAX_LENGTH: 100,
  FULL_NAME_MIN_LENGTH: 3,
  FULL_NAME_MAX_LENGTH: 100,
  KELOMPOK_NAME_MIN_LENGTH: 3,
  KELOMPOK_NAME_MAX_LENGTH: 100,
  DESA_MIN_LENGTH: 3,
  DESA_MAX_LENGTH: 100,
  KECAMATAN_MIN_LENGTH: 3,
  KECAMATAN_MAX_LENGTH: 100,
  CAPTION_MAX_LENGTH: 1000,
  CONTENT_MAX_LENGTH: 50000
};

// Error messages
const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Username atau password salah',
  UNAUTHORIZED: 'Anda tidak memiliki izin untuk mengakses resource ini',
  FORBIDDEN: 'Akses ditolak',
  NOT_FOUND: 'Resource tidak ditemukan',
  DUPLICATE_USERNAME: 'Username sudah terdaftar',
  DUPLICATE_EMAIL: 'Email sudah terdaftar',
  SERVER_ERROR: 'Terjadi kesalahan di server',
  VALIDATION_ERROR: 'Data tidak valid',
  FILE_TOO_LARGE: 'Ukuran file terlalu besar',
  INVALID_FILE_FORMAT: 'Format file tidak didukung'
};

// Success messages
const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login berhasil',
  LOGOUT_SUCCESS: 'Logout berhasil',
  CREATE_SUCCESS: 'Data berhasil dibuat',
  UPDATE_SUCCESS: 'Data berhasil diperbarui',
  DELETE_SUCCESS: 'Data berhasil dihapus',
  UPLOAD_SUCCESS: 'File berhasil diunggah',
  EXPORT_SUCCESS: 'Data berhasil diekspor'
};

// Email templates
const EMAIL_TEMPLATES = {
  WELCOME: 'welcome',
  PASSWORD_RESET: 'password_reset',
  NOTIFICATION: 'notification'
};

// Notification types
const NOTIFICATION_TYPES = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  SUCCESS: 'success'
};

module.exports = {
  // HTTP
  HTTP_STATUS,
  // User related
  USER_ROLES,
  ROLE_DISPLAY_NAME,
  USER_STATUS,
  // Laporan
  LAPORAN_JENIS,
  LAPORAN_JENIS_DISPLAY,
  LAPORAN_JENIS_ARRAY,
  // Animal
  JENIS_TERNAK,
  JENIS_TERNAK_ARRAY,
  JENIS_KELAMIN,
  JENIS_KELAMIN_ARRAY,
  HEALTH_STATUS,
  HEALTH_STATUS_ARRAY,
  PAKAN_JENIS,
  PAKAN_JENIS_ARRAY,
  KANDANG_JENIS,
  // Pagination
  PAGINATION,
  // File upload
  FILE_UPLOAD,
  BANNER,
  CERTIFICATE,
  // Search
  SEARCH,
  // Time
  TIME,
  // Validation
  VALIDATION,
  // Messages
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  EMAIL_TEMPLATES,
  NOTIFICATION_TYPES
};
