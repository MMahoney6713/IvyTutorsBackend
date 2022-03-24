"use strict";

/** Routes for availability. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureAdmin, ensureLoggedIn} = require("../middleware/auth");
const Availability = require("../models/availability");


const router = new express.Router();


/** POST / { availability } =>  { availability }
 *
 * Adds availability {tutor, time} to database
 * 
 * Authorization required: loggedIn
 */


router.post("/", ensureLoggedIn, async function (req, res, next) {
  try {
    

    const availability = await Availability.add(req.body);
    return res.status(201).json({ availability });
  } catch (err) {
    return next(err);
  }
});


/** GET /all/:time  => [{tutor}, {tutor}, ...]
 *
 * Returns list of all tutors available at given time
 *
 * Authorization required: logged in
 */

 router.get("/all/:time", ensureLoggedIn, async function (req, res, next) {

  const { time } = req.params;

  try {

    const availabilities = await Availability.getAllAvailableTutors(time);
    return res.json({ availabilities });
  } catch (err) {
    return next(err);
  }
});


/** GET /:tutor/:time  => 
 * 
 * Returns all availabilities for tutor in given week.
 *
 * Authorization required: logged in
 */

router.get("/:tutor/:time", ensureLoggedIn, async function (req, res, next) {

  const { tutor, time } = req.params;
  // const { year, month, day, tz } = req.query; 

  try {

    // const [ availability, firstDayOfWeek ] = await Availability.getTutorOneWeek(tutor, year, month, day, tz);
    const [ availability, firstDayOfWeek ] = await Availability.getTutorOneWeek(tutor, time);

    // console.log(availability);

    // return res.json({ availability, firstDayOfWeek });
    return res.json({ availability });
  } catch (err) {
    return next(err);
  }
});





/** DELETE /:tutor/:time  =>  { deleted: {tutor, time} }
 *
 * Deletes the availability for the tutor at given time.
 * 
 * Authorization: logged in
 */

router.delete("/:tutor/:time", ensureLoggedIn, async function (req, res, next) {
  try {
    let {tutor, time} = req.params;
    await Availability.remove(tutor, time);
    return res.json({ deleted: {tutor, time} });
  } catch (err) {
    return next(err);
  }
});


module.exports = router;
