"use strict";

/** Routes for availability. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureAdmin, ensureLoggedIn} = require("../middleware/auth");
const Availability = require("../models/availability");

// const availabilityNewSchema = require("../schemas/availabilityNew.json");
// const availabilityUpdateSchema = require("../schemas/availabilityUpdate.json");
// const availabilitySearchSchema = require("../schemas/availabilitySearch.json");

const router = new express.Router();


/** POST / { availability } =>  { availability }
 *
 * availability should be { handle, name, description, numEmployees, logoUrl }
 *
 * Returns { handle, name, description, numEmployees, logoUrl }
 *
 * Authorization required: admin
 */

// router.post("/", ensureAdmin, async function (req, res, next) {
router.post("/", async function (req, res, next) {
  try {
    // const validator = jsonschema.validate(req.body, availabilityNewSchema);
    // if (!validator.valid) {
    //   const errs = validator.errors.map(e => e.stack);
    //   throw new BadRequestError(errs);
    // }
    // console.log(res.locals);

    const availability = await Availability.add(req.body);
    return res.status(201).json({ availability });
  } catch (err) {
    return next(err);
  }
});

/** GET /  =>
 *   { availability: [ { handle, name, description, numEmployees, logoUrl }, ...] }
 *
 * Can filter on provided search filters:
 * - minEmployees
 * - maxEmployees
 * - nameLike (will find case-insensitive, partial matches)
 *
 * Authorization required: none
 */

router.get("/:tutor", async function (req, res, next) {

  const { tutor } = req.params;
  const { year, month, day, tz } = req.query;

  // console.log(res.locals);

  try {
    // const validator = jsonschema.validate(q, availabilitySearchSchema);
    // if (!validator.valid) {
    //   const errs = validator.errors.map(e => e.stack);
    //   throw new BadRequestError(errs);
    // }

    const [ availability, firstDayOfWeek ] = await Availability.getTutorOneWeek(tutor, year, month, day, tz);
    return res.json({ availability, firstDayOfWeek });
  } catch (err) {
    return next(err);
  }
});


/** GET /  =>
 *   { availability: [ { handle, name, description, numEmployees, logoUrl }, ...] }
 *
 * Can filter on provided search filters:
 * - minEmployees
 * - maxEmployees
 * - nameLike (will find case-insensitive, partial matches)
 *
 * Authorization required: none
 */

 router.get("/all/:time", async function (req, res, next) {

  const { time } = req.params;

  try {
    // const validator = jsonschema.validate(q, availabilitySearchSchema);
    // if (!validator.valid) {
    //   const errs = validator.errors.map(e => e.stack);
    //   throw new BadRequestError(errs);
    // }

    const availabilities = await Availability.getAllAvailableTutors(time);
    return res.json({ availabilities });
  } catch (err) {
    return next(err);
  }
});


/** PATCH /[handle] { fld1, fld2, ... } => { availability }
 *
 * Patches availability data.
 *
 * fields can be: { name, description, numEmployees, logo_url }
 *
 * Returns { handle, name, description, numEmployees, logo_url }
 *
 * Authorization required: admin
 */

router.patch("/:handle", ensureAdmin, async function (req, res, next) {
//   try {
//     const validator = jsonschema.validate(req.body, availabilityUpdateSchema);
//     if (!validator.valid) {
//       const errs = validator.errors.map(e => e.stack);
//       throw new BadRequestError(errs);
//     }

//     const availability = await Availability.update(req.params.handle, req.body);
//     return res.json({ availability });
//   } catch (err) {
//     return next(err);
//   }
});

/** DELETE /[handle]  =>  { deleted: handle }
 *
 * Authorization: admin
 */

router.delete("/:tutor/:time", async function (req, res, next) {
  try {
    let {tutor, time} = req.params;
    await Availability.remove(tutor, time);
    return res.json({ deleted: {tutor, time} });
  } catch (err) {
    return next(err);
  }
});


module.exports = router;
