import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export class CustomError extends Error implements AppError {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.name = this.constructor.name;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends CustomError {
  constructor(message: string = 'Validation failed') {
    super(message, 400);
  }
}

export class NotFoundError extends CustomError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404);
  }
}

export class AuthenticationError extends CustomError {
  constructor(message: string = 'Authentication required') {
    super(message, 401);
  }
}

export class AuthorizationError extends CustomError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403);
  }
}

export class ConflictError extends CustomError {
  constructor(message: string = 'Resource conflict') {
    super(message, 409);
  }
}

export class DatabaseError extends CustomError {
  constructor(message: string = 'Database operation failed') {
    super(message, 500);
  }
}

// Error handler middleware
export const globalErrorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Default error values
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal Server Error';
  
  // Log error details (in production, use proper logging service)
  console.error(`[${new Date().toISOString()}] Error ${statusCode}:`, {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    statusCode = 400;
    message = 'Validation failed';
    const validationErrors = error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message
    }));
    
    return res.status(statusCode).json({
      success: false,
      message,
      errors: validationErrors
    });
  }

  // Handle specific database errors
  if (error.message?.includes('duplicate key') || error.message?.includes('unique constraint')) {
    statusCode = 409;
    message = 'Resource already exists';
  }

  if (error.message?.includes('foreign key constraint')) {
    statusCode = 400;
    message = 'Invalid reference to related resource';
  }

  // Handle date conversion errors
  if (error.message?.includes('toISOString') || error.message?.includes('Invalid Date')) {
    statusCode = 400;
    message = 'Invalid date format provided';
  }

  // Don't leak internal error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  const errorResponse: any = {
    success: false,
    message: statusCode >= 500 && !isDevelopment ? 'Internal Server Error' : message,
    statusCode
  };

  // Add stack trace in development
  if (isDevelopment && error.stack) {
    errorResponse.stack = error.stack;
  }

  res.status(statusCode).json(errorResponse);
};

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Not found handler
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new NotFoundError(`Route ${req.originalUrl} not found`);
  next(error);
};

// Validation helper
export const validateRequest = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (error) {
      next(error);
    }
  };
};

// Date validation helper
export const validateAndFormatDate = (dateValue: any): string | null => {
  if (!dateValue) return null;
  
  try {
    // If it's already a Date object
    if (dateValue instanceof Date) {
      if (isNaN(dateValue.getTime())) {
        throw new ValidationError('Invalid date provided');
      }
      return dateValue.toISOString().split('T')[0]; // Return YYYY-MM-DD format
    }
    
    // If it's a string
    if (typeof dateValue === 'string') {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) {
        throw new ValidationError('Invalid date format provided');
      }
      return date.toISOString().split('T')[0]; // Return YYYY-MM-DD format
    }
    
    throw new ValidationError('Date must be a valid date string or Date object');
  } catch (error) {
    throw new ValidationError('Invalid date format provided');
  }
};

// Parameter validation helper
export const validateId = (id: string): number => {
  const numericId = parseInt(id, 10);
  if (isNaN(numericId) || numericId <= 0) {
    throw new ValidationError('Invalid ID provided');
  }
  return numericId;
};