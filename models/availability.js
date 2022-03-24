"use strict";

const db = require("../db");
const {getStartOfWeek, getEndOfWeek, structureAvailability} = require("../helpers/dateTimeHelp")
const { BadRequestError, NotFoundError } = require("../expressError");
const User = require("./user");
const Lesson = require('./lesson');

/** Related functions for availability. */

class Availability {
  /** Create a availability for tutor at time, update db, returns new availability data.
   *
   * Throws BadRequestError if availability already in database.
   * */

  static async add({ tutor, time }) {

    time = new Date(time);
    time.setMinutes(time.getMinutes() + time.getTimezoneOffset());

    console.log(time);

    const duplicateCheck = await db.query(
          `SELECT tutor, time
           FROM availability
           WHERE tutor = $1 AND time = $2`,
        [tutor, time.toUTCString()]);

    if (duplicateCheck.rows[0]) 
      throw new BadRequestError(`Duplicate availability: ${tutor} at ${time}`);

    const result = await db.query(
          `INSERT INTO availability
           (tutor, time)
           VALUES ($1, $2)
           RETURNING tutor, time`,
        [
          tutor,
          time,
        ],
    );
    const availability = result.rows[0];

    return availability;
  }

  /** Find all availabilities across all tutors at given time.
   *
   * Returns array of tutor objects
   * */

  static async getAllAvailableTutors(time) {
    time = new Date(time);
    let timeUTC = time.toUTCString();

    const availabilityRes = await db.query(
      `SELECT tutor
       FROM availability
       WHERE time = $1`,
    [timeUTC]);

    const availabilities = availabilityRes.rows;
    const lessons = await Lesson.getAllAtTime(timeUTC);

    let tutorsAlreadyScheduled = new Set();
    for (let lesson of lessons) {
      tutorsAlreadyScheduled.add(lesson.tutor);
    }

    let tutorsAvailable = [];
    for (let tutor of availabilities) {
      if (!tutorsAlreadyScheduled.has(tutor.tutor)) {
        tutorsAvailable.push(await User.get(tutor.tutor));
      }
    }

    return tutorsAvailable;
  }

  /** Given a tutor and time, return all availability for tutor in that week time span.
   *
   * Returns an array of availability objects, structured such that each object represents
   * the week's availabilities at given time of day:
   * {time: '0100', m: 'available', t: 'available', w: '', th: '', f: '', s: '', su: ''},
   *
   **/

  static async getTutorOneWeek(tutor, time) {

    console.log(time)
    time = new Date(time);
    let timeUTC = new Date(time.toUTCString());
    let tz = time.getTimezoneOffset();

    let startOfWeek = getStartOfWeek(timeUTC);
    let endOfWeek = getEndOfWeek(timeUTC);
    
    // let startOfWeek = getStartOfWeek(new Date(year, month, day));
    // let endOfWeek = getEndOfWeek(new Date(year, month, day));

    // startOfWeek.setMinutes(startOfWeek.getMinutes() + parseInt(tz));
    // endOfWeek.setMinutes(endOfWeek.getMinutes() + parseInt(tz));


    const availabilityRes = await db.query(
          `SELECT time
           FROM availability
           WHERE tutor = $1
           AND time >= $2
           AND time <= $3`,
        [tutor, startOfWeek, endOfWeek]);


    const availability = availabilityRes.rows;
    
    return [structureAvailability(availability, tz), startOfWeek];
  }
  

  /** Delete given availability from database; returns undefined.
   *
   * Throws NotFoundError if availability not found.
   **/

  static async remove(tutor, time) {

    time = new Date(time);
    time.setMinutes(time.getMinutes() + time.getTimezoneOffset());

    const result = await db.query(
          `DELETE
           FROM availability
           WHERE tutor = $1 AND time = $2
           RETURNING tutor`,
        [tutor, time]);
    const availability = result.rows[0];

    if (!availability) throw new NotFoundError(`No availability: ${tutor} at ${time}`);
  }
}


module.exports = Availability;
