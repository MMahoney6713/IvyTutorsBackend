"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const User = require('./user');

/** Related functions for lessons. */

class Lesson {
  /** Create a lesson (from data), update db, return new lesson data.
   *
   * data should be { handle, name, description, numEmployees, logoUrl }
   *
   * Returns { handle, name, description, numEmployees, logoUrl }
   *
   * Throws BadRequestError if lesson already in database.
   * */

  static async create({ tutor, student, time, lessonCode='eng'}) {
    const duplicateCheck = await db.query(
          `SELECT time
           FROM lessons
           WHERE tutor = $1 AND student = $2 AND time = $3`,
        [tutor, student, time]);

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate lesson: ${tutor} with ${student}`);

    const result = await db.query(
          `INSERT INTO lessons
           (tutor, student, time, lesson_code)
           VALUES ($1, $2, $3, $4)
           RETURNING tutor, student, time, lesson_code AS "lessonCode"`,
        [
          tutor,
          student,
          time,
          lessonCode,
        ],
    );
    const lesson = result.rows[0];


    const lessonTypesRes = await db.query(
          `SELECT title, description, credits
          FROM lesson_types
          WHERE code = $1`, 
          [lesson.lessonCode]
    )
    const lessonTypes = lessonTypesRes.rows[0];

    const studentRes = await User.get(lesson.student);
    const tutorRes = await User.get(lesson.tutor);

    lesson.student = studentRes;
    lesson.tutor = tutorRes;
    lesson.title = lessonTypes.title;
    lesson.description = lessonTypes.description;
    lesson.credits = lessonTypes.credits;

    return lesson;
  }


  /** Given a lesson handle, return data about lesson.
   *
   * Returns { handle, name, description, numEmployees, logoUrl, jobs }
   *   where jobs is [{ id, title, salary, equity }, ...]
   *
   * Throws NotFoundError if not found.
   **/

  static async getAllForUser(user) {

    const userQueryString = user.isTutor ? 'tutor' : 'student';

    const lessonRes = await db.query(
          `SELECT id,
                  tutor,
                  student,
                  time,
                  title,
                  credits,
                  review,
                  completed
           FROM lessons 
           JOIN lesson_types ON lessons.lesson_code = lesson_types.code
           WHERE ${userQueryString} = $1
           ORDER BY time ASC`,
        [user.email]);

    const lessons = lessonRes.rows;

    // console.log(lessons);

    if (lessons) {
      for (let lesson of lessons) {
        const studentRes = await User.get(lesson.student);
        const tutorRes = await User.get(lesson.tutor);

        lesson.student = studentRes;
        lesson.tutor = tutorRes;
      }
      
    }

    return lessons;
  }






  static async getAllAtTime(time) {

    const lessonRes = await db.query(
          `SELECT tutor,
                  student
           FROM lessons
           WHERE time = $1`,
        [time]);

    const lessons = lessonRes.rows;

    return lessons;
  }

  /** Update lesson data with `data`.
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

//   static async update(handle, data) {
//     const { setCols, values } = sqlForPartialUpdate(
//         data,
//         {
//           numEmployees: "num_employees",
//           logoUrl: "logo_url",
//         });
//     const handleVarIdx = "$" + (values.length + 1);

//     const querySql = `UPDATE lessons 
//                       SET ${setCols} 
//                       WHERE handle = ${handleVarIdx} 
//                       RETURNING handle, 
//                                 name, 
//                                 description, 
//                                 num_employees AS "numEmployees", 
//                                 logo_url AS "logoUrl"`;
//     const result = await db.query(querySql, [...values, handle]);
//     const lesson = result.rows[0];

//     if (!lesson) throw new NotFoundError(`No lesson: ${handle}`);

//     return lesson;
//   }

  /** Delete given lesson from database; returns undefined.
   *
   * Throws NotFoundError if lesson not found.
   **/

//   static async remove(handle) {
//     const result = await db.query(
//           `DELETE
//            FROM lessons
//            WHERE handle = $1
//            RETURNING handle`,
//         [handle]);
//     const lesson = result.rows[0];

//     if (!lesson) throw new NotFoundError(`No lesson: ${handle}`);
//   }
}


module.exports = Lesson;
