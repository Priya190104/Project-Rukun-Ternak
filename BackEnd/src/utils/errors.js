/**
 * Error Handling Utilities
 * Centralized error handling untuk konsistensi response format
 */

/**
 * Custom API Error class
 */
class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = 'ApiError';
  }
}

/**
 * Validation Error (400)
 */
class ValidationError extends ApiError {
  constructor(message, fields = null) {
    super(400, message, fields);
    this.name = 'ValidationError';
  }
}

/**
 * Unauthorized Error (401)
 */
class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized') {
    super(401, message);
    this.name = 'UnauthorizedError';
  }
}

/**
 * Forbidden Error (403)
 */
class ForbiddenError extends ApiError {
  constructor(message = 'Forbidden') {
    super(403, message);
    this.name = 'ForbiddenError';
  }
}

/**
 * Not Found Error (404)
 */
class NotFoundError extends ApiError {
  constructor(resource = 'Resource') {
    super(404, `${resource} not found`);
    this.name = 'NotFoundError';
  }
}

/**
 * Conflict Error (409)
 */
class ConflictError extends ApiError {
  constructor(message = 'Conflict') {
    super(409, message);
    this.name = 'ConflictError';
  }
}

/**
 * Server Error (500)
 */
class ServerError extends ApiError {
  constructor(message = 'Internal server error') {
    super(500, message);
    this.name = 'ServerError';
  }
}

/**
 * Send successful JSON response
 * @param {Object} res - Express response object
 * @param {any} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code (default 200)
 */
function sendSuccess(res, data = null, message = 'Success', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
}

/**
 * Send error JSON response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {any} details - Error details (optional)
 */
function sendError(res, statusCode = 500, message = 'Server error', details = null) {
  const response = {
    success: false,
    message
  };

  if (details) {
    response.details = details;
  }

  return res.status(statusCode).json(response);
}

/**
 * Handle caught exception
 * @param {Object} res - Express response object
 * @param {Error} error - Error object
 * @param {string} context - Error context untuk logging
 */
function handleError(res, error, context = 'Unknown') {
  console.error(`[${context}] Error:`, error.message);

  // Check if it's a custom API error
  if (error instanceof ApiError) {
    return sendError(res, error.statusCode, error.message, error.details);
  }

  // Check if it's a validation error
  if (error.name === 'ValidationError') {
    return sendError(res, 400, error.message, error.details);
  }

  // Database errors
  if (error.code === '23505') { // Duplicate key
    return sendError(res, 409, 'Data already exists');
  }

  if (error.code === '23503') { // Foreign key violation
    return sendError(res, 400, 'Invalid reference to related data');
  }

  // Default server error
  return sendError(res, 500, 'Internal server error');
}

/**
 * Async handler wrapper untuk mencegah unhandled rejections
 * Usage: router.get('/path', asyncHandler(async (req, res) => {...}))
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Validate request body
 * @param {Object} body - Request body
 * @param {Array<string>} requiredFields - Required field names
 * @throws {ValidationError}
 */
function validateRequestBody(body, requiredFields = []) {
  const missingFields = [];

  requiredFields.forEach(field => {
    if (!body[field]) {
      missingFields.push(field);
    }
  });

  if (missingFields.length > 0) {
    throw new ValidationError(
      'Missing required fields',
      missingFields
    );
  }
}

/**
 * Log error dengan context
 * @param {string} context - Context name
 * @param {Error} error - Error object
 * @param {Object} additionalData - Additional data untuk logging
 */
function logError(context, error, additionalData = {}) {
  const timestamp = new Date().toISOString();
  const errorData = {
    timestamp,
    context,
    name: error.name,
    message: error.message,
    stack: error.stack,
    ...additionalData
  };

  console.error('[ERROR]', JSON.stringify(errorData, null, 2));
}

module.exports = {
  // Error classes
  ApiError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ServerError,
  // Response helpers
  sendSuccess,
  sendError,
  handleError,
  asyncHandler,
  // Validation
  validateRequestBody,
  // Logging
  logError
};
