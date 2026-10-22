const { randomBytes, timingSafeEqual } = require('crypto');
module.exports = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'same-origin');
  res.setHeader('Cache-Control', 'no-store');
  if (!req.session.csrfToken) req.session.csrfToken = randomBytes(32).toString('hex');
  res.locals.csrfToken = req.session.csrfToken;
  if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    const token = Buffer.from(req.get('X-CSRF-Token') || '');
    const expected = Buffer.from(req.session.csrfToken);
    if (token.length !== expected.length || !timingSafeEqual(token, expected)) {
      return res.status(403).json({ success: false, message: 'Session expired. Reload the page and try again.' });
    }
  }
  next();
};
