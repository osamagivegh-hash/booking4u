import { logError } from '../utils/logger.js';

// Custom error class for more detailed error handling
class AppError extends Error {
  constructor(message, statusCode, errorCode = 'UNKNOWN_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

// Global error handler middleware
const errorHandler = (err, req, res, next) => {
  // Log the full error for backend debugging
  logError('Unhandled Error', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    user: req.user ? req.user._id : 'Unauthenticated'
  });

  // Determine error details
  const statusCode = err.statusCode || 500;
  const errorResponse = {
    success: false,
    message: err.isOperational 
      ? err.message 
      : 'حدث خطأ غير متوقع في النظام',
    errorCode: err.errorCode || 'INTERNAL_SERVER_ERROR',
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      originalError: err.toString() 
    })
  };

  // Send error response
  res.status(statusCode).json(errorResponse);
};

// Async error wrapper to reduce try-catch boilerplate
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Handle 404 Not Found errors
const notFoundHandler = (req, res, next) => {
  const error = new AppError(`المسار ${req.originalUrl} غير موجود`, 404, 'NOT_FOUND');
  next(error);
};

export {
  AppError,
  errorHandler,
  asyncHandler,
  notFoundHandler
};
