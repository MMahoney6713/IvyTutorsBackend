"use strict";

const db = require("../db");
const {getStartOfWeek, getEndOfWeek, structureAvailability} = require("../helpers/dateTimeHelp")
const { BadRequestError, NotFoundError } = require("../expressError");
// const { sqlForPartialUpdate } = require("../helpers/sql");
const User = require("./user");
const Lesson = require('./lesson');

/** Related functions for availability. */

class Availability {
  /** Create a availability (from data), update db, return new availability data.
   *
   * data should be { handle, name, description, numEmployees, logoUrl }
   *
   * Returns { handle, name, description, numEmployees, logoUrl }
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

  /** Find all availability (optional filter on searchFilters).
   *
   * searchFilters (all optional):
   * - minEmployees
   * - maxEmployees
   * - name (will find case-insensitive, partial matches)
   *
   * Returns [{ handle, name, description, numEmployees, logoUrl }, ...]
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

    // if (!availabilities) throw new NotFoundError(`No availability for ${time}`);

    return tutorsAvailable;
  }

  /** Given a availability handle, return data about availability.
   *
   * Returns { handle, name, description, numEmployees, logoUrl, jobs }
   *   where jobs is [{ id, title, salary, equity }, ...]
   *
   * Throws NotFoundError if not found.
   **/

  static async getTutorOneWeek(tutor, year, month, day, tz) {

    let startOfWeek = getStartOfWeek(new Date(year, month, day));
    let endOfWeek = getEndOfWeek(new Date(year, month, day));

    startOfWeek.setMinutes(startOfWeek.getMinutes() + parseInt(tz));
    endOfWeek.setMinutes(endOfWeek.getMinutes() + parseInt(tz));

    const availabilityRes = await db.query(
          `SELECT time
           FROM availability
           WHERE tutor = $1
           AND time >= $2
           AND time <= $3`,
        [tutor, startOfWeek, endOfWeek]);

    const availability = availabilityRes.rows;

    if (!availability) throw new NotFoundError(`No availability for ${tutor}`);
    
    return [structureAvailability(availability, tz), startOfWeek];
  }

  /** Update availability data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {name, description, numEmployees, logoUrl}
   *
   * Returns {handle, name, description, numEmployees, logoUrl}
   *
   * Throws NotFoundError if not found.
   */

  static async update(handle, data) {
    // const { setCols, values } = sqlForPartialUpdate(
    //     data,
    //     {
    //       numEmployees: "num_employees",
    //       logoUrl: "logo_url",
    //     });
    // const handleVarIdx = "$" + (values.length + 1);

    // const querySql = `UPDATE availability 
    //                   SET ${setCols} 
    //                   WHERE handle = ${handleVarIdx} 
    //                   RETURNING handle, 
    //                             name, 
    //                             description, 
    //                             num_employees AS "numEmployees", 
    //                             logo_url AS "logoUrl"`;
    // const result = await db.query(querySql, [...values, handle]);
    // const availability = result.rows[0];

    // if (!availability) throw new NotFoundError(`No availability: ${handle}`);

    // return availability;
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
