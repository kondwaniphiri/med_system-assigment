// Authentication middleware to protect routes
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }

  // If it's an AJAX request, return JSON
  if (req.xhr || (req.headers.accept || "").includes("json") || req.originalUrl.startsWith("/api/") || req.originalUrl.startsWith("/database/")) {
    return res.status(401).json({
      success: false,
      message: "Authentication required. Please log in.",
    });
  }

  // Otherwise redirect to login page
  res.redirect("/");
};

// Middleware to check if user is already logged in
const isGuest = (req, res, next) => {
  if (req.session && req.session.userId) {
    return res.redirect("/home");
  }
  next();
};

// Middleware to attach user info to all views
const attachUserToViews = (req, res, next) => {
  res.locals.user = req.session.userId ? { id: req.session.userId, username: req.session.username, position: req.session.position } : null;
  res.locals.isAuthenticated = !!req.session.userId;
  next();
};

module.exports = {
  isAuthenticated,
  isGuest,
  attachUserToViews,
  isDoctor: (req, res, next) => {
    if (['Doctor', 'admin'].includes(req.session.position)) return next();
    if (req.method === 'GET') return res.status(403).render('error', { title: 'Access denied', statusCode: 403, message: 'Pharmacy inventory is available to doctors and administrators.', error: {} });
    res.status(403).json({ success: false, message: 'Doctor or administrator access required.' });
  },
};
