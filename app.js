"use strict";

/** Express app for ivytutors. */

const express = require("express");
const cors = require("cors");

const { NotFoundError } = require("./expressError");

const { authenticateJWT } = require("./middleware/auth");
const authRoutes = require("./routes/auth");
const availabilityRoutes = require("./routes/availability");
const lessonsRoutes = require("./routes/lessons");
const usersRoutes = require("./routes/users");
// const jobsRoutes = require("./routes/jobs");

const morgan = require("morgan");

const app = express();


// Taken from https://www.codingdeft.com/posts/nodejs-react-cors-error/
// const domainsFromEnv = process.env.CORS_DOMAINS || "http://localhost:3000";
// const whitelist = domainsFromEnv.split(",").map(item => item.trim());
// const corsOptions = {
//   origin: function (origin, callback) {
//     if (!origin || whitelist.indexOf(origin) !== -1) {
//       callback(null, true)
//     } else {
//       callback(new Error("Not allowed by CORS"))
//     }
//   },
//   credentials: true,
// }
// app.use(cors(corsOptions))
app.use(cors());

app.use(express.json());
app.use(morgan("tiny"));
app.use(authenticateJWT);

app.use("/auth", authRoutes);
app.use("/availability", availabilityRoutes);
app.use("/lessons", lessonsRoutes);
app.use("/users", usersRoutes);
// app.use("/jobs", jobsRoutes);


/** Handle 404 errors -- this matches everything */
app.use(function (req, res, next) {
  return next(new NotFoundError());
});

/** Generic error handler; anything unhandled goes here. */
app.use(function (err, req, res, next) {
  if (process.env.NODE_ENV !== "test") console.error(err.stack);
  const status = err.status || 500;
  const message = err.message;

  return res.status(status).json({
    error: { message, status },
  });
});

module.exports = app;
