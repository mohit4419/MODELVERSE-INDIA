import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const statusCode = err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  // Securely log the error server-side
  console.error(`[Error Handler] ${req.method} ${req.url} - Status ${statusCode}:`, {
    message: err.message,
    code: err.code,
    stack: isProduction ? undefined : err.stack,
    details: err.details,
  });

  // Return sanitized, customer-safe JSON error response
  res.status(statusCode).json({
    success: false,
    error: err.message || 'An unexpected error occurred on the server.',
    code: err.code || 'INTERNAL_SERVER_ERROR',
    ...(isProduction ? {} : { stack: err.stack, details: err.details }),
  });
}
