const ipCache = new Map();

// Clean up old entries periodically
const cleanupInterval = setInterval(() => {
  const now = Date.now();
  for (const [key, value] of ipCache.entries()) {
    if (now > value.resetTime) {
      ipCache.delete(key);
    }
  }
}, 60000);

if (cleanupInterval.unref) {
  cleanupInterval.unref();
}

export function rateLimiter({ windowMs, maxRequests, message }) {
  return (req, res, next) => {
    if (process.env.NODE_ENV === 'test') {
      return next();
    }
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const now = Date.now();

    if (!ipCache.has(ip)) {
      ipCache.set(ip, {
        count: 1,
        resetTime: now + windowMs,
      });
      return next();
    }

    const rateData = ipCache.get(ip);
    if (now > rateData.resetTime) {
      rateData.count = 1;
      rateData.resetTime = now + windowMs;
      return next();
    }

    rateData.count += 1;
    if (rateData.count > maxRequests) {
      return res.status(429).json({
        message: message || 'Too many requests, please try again later.',
      });
    }

    next();
  };
}
