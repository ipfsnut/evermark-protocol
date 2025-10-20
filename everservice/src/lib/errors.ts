/**
 * Error handling utilities for Evermark API
 */

export class EvermarkError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: any;

  constructor(message: string, code: string, statusCode: number = 500, details?: any) {
    super(message);
    this.name = 'EvermarkError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export class ValidationError extends EvermarkError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', 400, details);
  }
}

export class NotFoundError extends EvermarkError {
  constructor(message: string = 'Resource not found') {
    super(message, 'NOT_FOUND', 404);
  }
}

export class DuplicateError extends EvermarkError {
  constructor(message: string, details?: any) {
    super(message, 'DUPLICATE_CONTENT', 409, details);
  }
}

export class ProcessingError extends EvermarkError {
  constructor(message: string, details?: any) {
    super(message, 'PROCESSING_ERROR', 422, details);
  }
}

export class ExternalServiceError extends EvermarkError {
  constructor(service: string, message: string, details?: any) {
    super(`${service} service error: ${message}`, 'EXTERNAL_SERVICE_ERROR', 503, details);
  }
}

/**
 * Standardized error response format
 */
export interface ErrorResponse {
  error: string;
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

/**
 * Create standardized error response
 */
export function createErrorResponse(error: Error | EvermarkError): ErrorResponse {
  if (error instanceof EvermarkError) {
    return {
      error: error.name,
      code: error.code,
      message: error.message,
      details: error.details,
      timestamp: new Date().toISOString()
    };
  }

  return {
    error: 'InternalServerError',
    code: 'INTERNAL_ERROR',
    message: error.message || 'An unexpected error occurred',
    timestamp: new Date().toISOString()
  };
}

/**
 * Async error wrapper for API routes
 */
export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  };
}

/**
 * URL validation with detailed error messages
 */
export function validateUrl(url: string): { isValid: boolean; error?: string } {
  if (!url || typeof url !== 'string') {
    return { isValid: false, error: 'URL is required' };
  }

  const trimmedUrl = url.trim();
  
  if (trimmedUrl.length === 0) {
    return { isValid: false, error: 'URL cannot be empty' };
  }

  if (trimmedUrl.length > 2048) {
    return { isValid: false, error: 'URL is too long (maximum 2048 characters)' };
  }

  try {
    const urlObj = new URL(trimmedUrl);
    
    // Check for supported protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return { isValid: false, error: 'Only HTTP and HTTPS URLs are supported' };
    }

    // Check for localhost in production (if needed)
    if (process.env.NODE_ENV === 'production' && urlObj.hostname === 'localhost') {
      return { isValid: false, error: 'Localhost URLs are not allowed in production' };
    }

    return { isValid: true };
  } catch (e) {
    return { isValid: false, error: 'Invalid URL format' };
  }
}

/**
 * Rate limiting check (placeholder for future implementation)
 */
export function checkRateLimit(userFid?: number): { allowed: boolean; error?: string } {
  // TODO: Implement actual rate limiting logic
  // For now, always allow
  return { allowed: true };
}

/**
 * Content type validation
 */
export function validateContentType(contentType: string): boolean {
  const allowedTypes = ['Cast', 'Tweet', 'URL', 'DOI', 'ISBN', 'Custom'];
  return allowedTypes.includes(contentType);
}

/**
 * Safe JSON parsing with error handling
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json);
  } catch (error) {
    console.warn('JSON parse error:', error);
    return fallback;
  }
}