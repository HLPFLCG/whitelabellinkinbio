/**
 * Input validation utilities for API routes
 */

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === "http:" || urlObj.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate username format (alphanumeric, hyphens, underscores)
 */
export function isValidUsername(username: string): boolean {
  const usernameRegex = /^[a-z0-9_-]{3,30}$/;
  return usernameRegex.test(username);
}

/**
 * Sanitize string input (remove potentially dangerous characters)
 */
export function sanitizeString(input: string): string {
  return input.trim().replace(/[<>]/g, "");
}

/**
 * Validate link creation/update data
 */
export function validateLinkData(data: {
  title?: string;
  url?: string;
  description?: string;
}): ValidationError[] {
  const errors: ValidationError[] = [];

  if (data.title !== undefined) {
    if (!data.title || data.title.trim().length === 0) {
      errors.push({ field: "title", message: "Title is required" });
    } else if (data.title.length > 100) {
      errors.push({
        field: "title",
        message: "Title must be 100 characters or less",
      });
    }
  }

  if (data.url !== undefined) {
    if (!data.url || data.url.trim().length === 0) {
      errors.push({ field: "url", message: "URL is required" });
    } else if (!isValidUrl(data.url)) {
      errors.push({ field: "url", message: "Invalid URL format" });
    }
  }

  if (data.description !== undefined && data.description) {
    if (data.description.length > 500) {
      errors.push({
        field: "description",
        message: "Description must be 500 characters or less",
      });
    }
  }

  return errors;
}

/**
 * Validate profile data
 */
export function validateProfileData(data: {
  username?: string;
  display_name?: string;
  bio?: string;
  avatar_url?: string;
}): ValidationError[] {
  const errors: ValidationError[] = [];

  if (data.username !== undefined) {
    if (!data.username || data.username.trim().length === 0) {
      errors.push({ field: "username", message: "Username is required" });
    } else if (!isValidUsername(data.username)) {
      errors.push({
        field: "username",
        message:
          "Username must be 3-30 characters and contain only lowercase letters, numbers, hyphens, and underscores",
      });
    }
  }

  if (data.display_name !== undefined && data.display_name) {
    if (data.display_name.length > 50) {
      errors.push({
        field: "display_name",
        message: "Display name must be 50 characters or less",
      });
    }
  }

  if (data.bio !== undefined && data.bio) {
    if (data.bio.length > 500) {
      errors.push({
        field: "bio",
        message: "Bio must be 500 characters or less",
      });
    }
  }

  if (data.avatar_url !== undefined && data.avatar_url) {
    if (!isValidUrl(data.avatar_url)) {
      errors.push({ field: "avatar_url", message: "Invalid avatar URL" });
    }
  }

  return errors;
}

/**
 * Rate limiting helper (simple in-memory implementation)
 * For production, use Redis or similar
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 60000,
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return { allowed: true, remaining: maxRequests - record.count };
}

/**
 * Clean up old rate limit entries periodically
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 60000); // Clean up every minute