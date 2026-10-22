const { log } = require("../utils/helpers");

/**
 * 404 Not Found handler
 */
const notFoundHandler = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.status = 404;
  next(error);
};

/**
 * Global error handler
 */
const errorHandler = (err, req, res, next) => {
  // Log the error
  log(`Error: ${err.message}`, "error");
  if (process.env.NODE_ENV === "development") {
    log(`Stack: ${err.stack}`, "error");
  }

  // Set locals, only providing error details in development
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV === "development" ? err : {};

  // Determine status code
  const statusCode = err.status || err.statusCode || 500;

  // If it's an AJAX request, return JSON
  if (req.xhr || (req.headers.accept || "").includes("json") || req.originalUrl.startsWith("/api/") || req.originalUrl.startsWith("/database/")) {
    return res.status(statusCode).json({
      success: false,
      message: statusCode >= 500 ? "Internal server error" : err.message,
      error:
        process.env.NODE_ENV === "development"
          ? {
              stack: err.stack,
              details: err,
            }
          : undefined,
    });
  }

  // Render error page
  res.status(statusCode);
  res.render("error", {
    title: "Error",
    statusCode,
    message: statusCode >= 500 ? "Internal server error" : err.message,
  });
};

/**
 * Async route handler wrapper to catch errors
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Rate limiting helper (simple in-memory implementation)
 */
const rateLimitStore = new Map();

const rateLimit = (options = {}) => {
  const windowMs = options.windowMs || 15 * 60 * 1000; // 15 minutes
  const max = options.max || 100; // limit each IP to 100 requests per windowMs

  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const key = `${options.key || "general"}:${ip}`;

    if (!rateLimitStore.has(key)) {
      rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    const record = rateLimitStore.get(key);

    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + windowMs;
      return next();
    }

    if (record.count >= max) {
      return res.status(429).json({
        success: false,
        message: "Too many requests, please try again later.",
      });
    }

    record.count++;
    next();
  };
};

// Clean up rate limit store periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000).unref(); // Clean up every minute

module.exports = {
  notFoundHandler,
  errorHandler,
  asyncHandler,
  rateLimit,
};
