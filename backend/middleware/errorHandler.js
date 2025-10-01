import { logError } from '../utils/logger.js';
import ApiResponse from '../utils/apiResponse.js';
import mongoose from 'mongoose';

/**
 * Enhanced Error Handling Middleware
 * Provides comprehensive error handling with proper classification and logging
 */

// Custom error classes
class AppError extends Error {
  constructor(message, statusCode, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, errors) {
    super(message, 422, 'VALIDATION_ERROR');
    this.errors = errors;
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'غير مصرح لك بالوصول إلى هذا المورد') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'غير مصرح لك بالوصول إلى هذا المورد') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

class NotFoundError extends AppError {
  constructor(message = 'المورد المطلوب غير موجود') {
    super(message, 404, 'NOT_FOUND');
  }
}

class ConflictError extends AppError {
  constructor(message = 'تعارض في البيانات') {
    super(message, 409, 'CONFLICT');
  }
}

class RateLimitError extends AppError {
  constructor(message = 'عدد الطلبات كبير جداً، يرجى المحاولة لاحقاً') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
  }
}

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log the error
  logError('Unhandled Error', err, {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userId: req.user?._id,
    body: req.body,
    params: req.params,
    query: req.query
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'معرف غير صحيح';
    error = new NotFoundError(message);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `قيمة ${field} موجودة مسبقاً`;
    error = new ConflictError(message);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = 'بيانات غير صحيحة';
    const errors = Object.values(err.errors).map(val => ({
      field: val.path,
      message: val.message,
      value: val.value
    }));
    error = new ValidationError(message, errors);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'رمز مصادقة غير صحيح';
    error = new AuthenticationError(message);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'انتهت صلاحية رمز المصادقة';
    error = new AuthenticationError(message);
  }

  // Rate limiting errors
  if (err.status === 429) {
    error = new RateLimitError();
  }

  // Default error
  if (!error.statusCode) {
    error.statusCode = 500;
    error.message = 'خطأ داخلي في الخادم';
  }

  // Send error response
  if (error instanceof ValidationError) {
    return ApiResponse.validationError(res, error.errors, error.message);
  }

  if (error instanceof AuthenticationError) {
    return ApiResponse.unauthorized(res, error.message);
  }

  if (error instanceof AuthorizationError) {
    return ApiResponse.forbidden(res, error.message);
  }

  if (error instanceof NotFoundError) {
    return ApiResponse.notFound(res, error.message);
  }

  if (error instanceof ConflictError) {
    return ApiResponse.conflict(res, error.message);
  }

  if (error instanceof RateLimitError) {
    return ApiResponse.tooManyRequests(res, error.message);
  }

  // Generic error response
  return ApiResponse.internalError(res, error.message, error);
};

// Async error wrapper
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 404 handler for undefined routes
const notFoundHandler = (req, res) => {
  return ApiResponse.notFound(res, `المسار ${req.originalUrl} غير موجود`);
};

// Graceful shutdown handler
const gracefulShutdown = (server) => {
  return (signal) => {
    console.log(`\n🔄 Received ${signal}. Starting graceful shutdown...`);
    
    server.close(() => {
      console.log('✅ HTTP server closed');
      
      // Close database connection
      if (mongoose.connection.readyState === 1) {
        mongoose.connection.close(false, () => {
          console.log('✅ Database connection closed');
          process.exit(0);
        });
      } else {
        process.exit(0);
      }
    });

    // Force close after 10 seconds
    setTimeout(() => {
      console.error('❌ Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  };
};

export {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  errorHandler,
  asyncHandler,
  notFoundHandler,
  gracefulShutdown
};
