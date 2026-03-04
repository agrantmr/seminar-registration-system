/**
 * Validate email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sanitize name input
 */
function sanitizeName(name) {
  // Remove any HTML tags and trim whitespace
  return name.replace(/<[^>]*>/g, '').trim();
}

/**
 * Simple in-memory rate limiter (for serverless, stores per instance)
 * For production, consider Vercel KV or similar
 */
const rateLimitStore = new Map();

function checkRateLimit(ipAddress, maxAttempts = 20, windowMs = 3600000) {
  const now = Date.now();
  const key = `ratelimit:${ipAddress}`;

  if (!rateLimitStore.has(key)) {
    rateLimitStore.set(key, { attempts: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxAttempts - 1 };
  }

  const record = rateLimitStore.get(key);

  // Reset if window has passed
  if (now > record.resetAt) {
    rateLimitStore.set(key, { attempts: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxAttempts - 1 };
  }

  // Check if limit exceeded
  if (record.attempts >= maxAttempts) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt };
  }

  // Increment attempts
  record.attempts++;
  rateLimitStore.set(key, record);

  return { allowed: true, remaining: maxAttempts - record.attempts };
}

/**
 * Get client IP address from request
 */
function getClientIP(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0] ||
    req.headers['x-real-ip'] ||
    req.connection?.remoteAddress ||
    'unknown'
  );
}

/**
 * Format date for display
 */
function formatEventDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

module.exports = {
  isValidEmail,
  sanitizeName,
  checkRateLimit,
  getClientIP,
  formatEventDate
};
