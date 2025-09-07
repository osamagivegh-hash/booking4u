/**
 * Standardized API Response Utility
 * Provides consistent response formatting across all API endpoints
 */

class ApiResponse {
  /**
   * Success response
   * @param {Object} res - Express response object
   * @param {*} data - Response data
   * @param {string} message - Success message
   * @param {number} status - HTTP status code
   * @param {Object} meta - Additional metadata
   */
  static success(res, data = null, message = 'تمت العملية بنجاح', status = 200, meta = {}) {
    const response = {
      success: true,
      message,
      timestamp: new Date().toISOString(),
      ...meta
    };

    if (data !== null) {
      response.data = data;
    }

    return res.status(status).json(response);
  }

  /**
   * Error response
   * @param {Object} res - Express response object
   * @param {string} message - Error message
   * @param {number} status - HTTP status code
   * @param {Array} errors - Validation errors
   * @param {string} code - Error code
   */
  static error(res, message = 'حدث خطأ', status = 500, errors = null, code = null) {
    const response = {
      success: false,
      message,
      timestamp: new Date().toISOString(),
      status
    };

    if (errors) {
      response.errors = errors;
    }

    if (code) {
      response.code = code;
    }

    return res.status(status).json(response);
  }

  /**
   * Created response (201)
   * @param {Object} res - Express response object
   * @param {*} data - Created resource data
   * @param {string} message - Success message
   */
  static created(res, data, message = 'تم إنشاء المورد بنجاح') {
    return this.success(res, data, message, 201);
  }

  /**
   * No content response (204)
   * @param {Object} res - Express response object
   */
  static noContent(res) {
    return res.status(204).send();
  }

  /**
   * Bad request response (400)
   * @param {Object} res - Express response object
   * @param {string} message - Error message
   * @param {Array} errors - Validation errors
   */
  static badRequest(res, message = 'طلب غير صحيح', errors = null) {
    return this.error(res, message, 400, errors, 'BAD_REQUEST');
  }

  /**
   * Unauthorized response (401)
   * @param {Object} res - Express response object
   * @param {string} message - Error message
   */
  static unauthorized(res, message = 'غير مصرح لك بالوصول إلى هذا المورد') {
    return this.error(res, message, 401, null, 'UNAUTHORIZED');
  }

  /**
   * Forbidden response (403)
   * @param {Object} res - Express response object
   * @param {string} message - Error message
   */
  static forbidden(res, message = 'غير مصرح لك بالوصول إلى هذا المورد') {
    return this.error(res, message, 403, null, 'FORBIDDEN');
  }

  /**
   * Not found response (404)
   * @param {Object} res - Express response object
   * @param {string} message - Error message
   */
  static notFound(res, message = 'المورد المطلوب غير موجود') {
    return this.error(res, message, 404, null, 'NOT_FOUND');
  }

  /**
   * Conflict response (409)
   * @param {Object} res - Express response object
   * @param {string} message - Error message
   */
  static conflict(res, message = 'تعارض في البيانات') {
    return this.error(res, message, 409, null, 'CONFLICT');
  }

  /**
   * Validation error response (422)
   * @param {Object} res - Express response object
   * @param {Array} errors - Validation errors
   * @param {string} message - Error message
   */
  static validationError(res, errors, message = 'بيانات غير صحيحة') {
    return this.error(res, message, 422, errors, 'VALIDATION_ERROR');
  }

  /**
   * Too many requests response (429)
   * @param {Object} res - Express response object
   * @param {string} message - Error message
   */
  static tooManyRequests(res, message = 'عدد الطلبات كبير جداً، يرجى المحاولة لاحقاً') {
    return this.error(res, message, 429, null, 'RATE_LIMIT_EXCEEDED');
  }

  /**
   * Internal server error response (500)
   * @param {Object} res - Express response object
   * @param {string} message - Error message
   * @param {Error} error - Error object for logging
   */
  static internalError(res, message = 'خطأ داخلي في الخادم', error = null) {
    // Log the error for debugging
    if (error) {
      console.error('Internal Server Error:', error);
    }
    
    return this.error(res, message, 500, null, 'INTERNAL_ERROR');
  }

  /**
   * Service unavailable response (503)
   * @param {Object} res - Express response object
   * @param {string} message - Error message
   */
  static serviceUnavailable(res, message = 'الخدمة غير متاحة حالياً') {
    return this.error(res, message, 503, null, 'SERVICE_UNAVAILABLE');
  }

  /**
   * Paginated response
   * @param {Object} res - Express response object
   * @param {Array} data - Array of items
   * @param {number} page - Current page
   * @param {number} limit - Items per page
   * @param {number} total - Total number of items
   * @param {string} message - Success message
   */
  static paginated(res, data, page, limit, total, message = 'تم جلب البيانات بنجاح') {
    const pages = Math.ceil(total / limit);
    
    return this.success(res, data, message, 200, {
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages,
        hasNext: page < pages,
        hasPrev: page > 1
      }
    });
  }
}

module.exports = ApiResponse;
