"use strict";

/** Routes for lessons. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureCorrectUserOrAdmin, ensureLoggedIn } = require("../middleware/auth");
const Lesson = require("../models/lesson");

const router = new express.Router();


/** POST / { lesson } =>  { lesson }
 * 
 *
 * Authorization required: logged in
 */

router.post("/", ensureLoggedIn, async function (req, res, next) {
  try {
    
    const lesson = await Lesson.create(req.body);
    return res.status(201).json({ lesson });
  } catch (err) {
    return next(err);
  }
});

/** GET /
 *
 *  Returns all scheduled lessons for the requesting user.
 *
 * Authorization required: logged in
 */

router.get("/", ensureLoggedIn, async function (req, res, next) {
  try {
    const user = res.locals.user;
    if (!user) return;
    const lessons = await Lesson.getAllForUser(user);
    return res.json({ lessons });
  } catch (err) {
    return next(err);
  }
});



module.exports = router;
