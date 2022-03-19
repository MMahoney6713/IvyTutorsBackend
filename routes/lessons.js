"use strict";

/** Routes for lessons. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureAdmin } = require("../middleware/auth");
const Lesson = require("../models/lesson");
// const User = require("../models/user");

// const lessonNewSchema = require("../schemas/lessonNew.json");
// const lessonUpdateSchema = require("../schemas/lessonUpdate.json");
// const lessonSearchSchema = require("../schemas/lessonSearch.json");

const router = new express.Router();


/** POST / { lesson } =>  { lesson }
 *
 * lesson should be { handle, name, description, numEmployees, logoUrl }
 *
 * Returns { handle, name, description, numEmployees, logoUrl }
 *
 * Authorization required: admin
 */

router.post("/", async function (req, res, next) {
  try {
    // const validator = jsonschema.validate(req.body, lessonNewSchema);
    // if (!validator.valid) {
    //   const errs = validator.errors.map(e => e.stack);
    //   throw new BadRequestError(errs);
    // }

    const lesson = await Lesson.create(req.body);
    return res.status(201).json({ lesson });
  } catch (err) {
    return next(err);
  }
});

/** GET /  =>
 *   { lessons: [ { handle, name, description, numEmployees, logoUrl }, ...] }
 *
 * Can filter on provided search filters:
 * - minEmployees
 * - maxEmployees
 * - nameLike (will find case-insensitive, partial matches)
 *
 * Authorization required: none
 */

// router.get("/", async function (req, res, next) {
//   const q = req.query;
//   // arrive as strings from querystring, but we want as ints
//   if (q.minEmployees !== undefined) q.minEmployees = +q.minEmployees;
//   if (q.maxEmployees !== undefined) q.maxEmployees = +q.maxEmployees;

//   try {
//     const validator = jsonschema.validate(q, lessonSearchSchema);
//     if (!validator.valid) {
//       const errs = validator.errors.map(e => e.stack);
//       throw new BadRequestError(errs);
//     }

//     const lessons = await Lesson.findAll(q);
//     return res.json({ lessons });
//   } catch (err) {
//     return next(err);
//   }
// });

/** GET /[handle]  =>  { lesson }
 *
 *  Lesson is { handle, name, description, numEmployees, logoUrl, jobs }
 *   where jobs is [{ id, title, salary, equity }, ...]
 *
 * Authorization required: none
 */

router.get("/", async function (req, res, next) {
  try {
    const user = res.locals.user;
    if (!user) return;
    const lessons = await Lesson.getAllForUser(user);
    return res.json({ lessons });
  } catch (err) {
    return next(err);
  }
});

/** PATCH /[handle] { fld1, fld2, ... } => { lesson }
 *
 * Patches lesson data.
 *
 * fields can be: { name, description, numEmployees, logo_url }
 *
 * Returns { handle, name, description, numEmployees, logo_url }
 *
 * Authorization required: admin
 */

// router.patch("/:handle", ensureAdmin, async function (req, res, next) {
//   try {
//     const validator = jsonschema.validate(req.body, lessonUpdateSchema);
//     if (!validator.valid) {
//       const errs = validator.errors.map(e => e.stack);
//       throw new BadRequestError(errs);
//     }

//     const lesson = await Lesson.update(req.params.handle, req.body);
//     return res.json({ lesson });
//   } catch (err) {
//     return next(err);
//   }
// });

/** DELETE /[handle]  =>  { deleted: handle }
 *
 * Authorization: admin
 */

// router.delete("/:handle", ensureAdmin, async function (req, res, next) {
//   try {
//     await Lesson.remove(req.params.handle);
//     return res.json({ deleted: req.params.handle });
//   } catch (err) {
//     return next(err);
//   }
// });


module.exports = router;
