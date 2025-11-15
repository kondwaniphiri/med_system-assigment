// Authentication middleware to protect routes
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }

  // If it's an AJAX request, return JSON
  if (req.xhr || req.headers.accept.indexOf("json") > -1) {
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
  res.locals.user = req.session.user || null;
  res.locals.isAuthenticated = !!req.session.userId;
  next();
};

module.exports = {
  isAuthenticated,
  isGuest,
  attachUserToViews,
};
