// MedSystem — Author: Kondwani Phiri | SIN: 21163650
require("dotenv").config();
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var session = require("express-session");

var indexRouter = require("./routes/index");
var database = require("./routes/database");
var databaseNew = require("./routes/database-new");
var { attachUserToViews } = require("./middleware/auth");
var { notFoundHandler, errorHandler } = require("./middleware/errorHandler");

var app = express();
app.disable("x-powered-by");
if (process.env.TRUST_PROXY === "1") app.set("trust proxy", 1);
if (process.env.NODE_ENV === "production" && (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32)) throw new Error("Set SESSION_SECRET to at least 32 characters");

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Session configuration
app.use(
  session({
    secret:
      process.env.SESSION_SECRET || require("crypto").randomBytes(32).toString("hex"),
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      httpOnly: true,
      sameSite: "lax",
      maxAge: parseInt(process.env.SESSION_MAX_AGE) || 3600000, // 1 hour default
    },
  })
);

app.use(logger("dev"));
app.use(express.json({ limit: "32kb" }));
app.use(express.urlencoded({ extended: false, limit: "32kb" }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(require("./middleware/security"));

// Attach user info to all views
app.use(attachUserToViews);

app.use("/", indexRouter);
app.use("/database", database);
app.use("/api", databaseNew); // New improved API routes
// app.use('/newRoot', newRoot);

// catch 404 and forward to error handler
app.use(notFoundHandler);

// error handler
app.use(errorHandler);

module.exports = app;
