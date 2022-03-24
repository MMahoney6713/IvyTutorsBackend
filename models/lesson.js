"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const User = require('./user');

/** Related functions for lessons. */

class Lesson {
  /** Create a lesson for tutor and student, update db, return new lesson data.
   *
   * Returned lesson contains the JOIN of the scheduled_lessons table with the 
   * lesson_types table, including lesson title, description, credits.
   * 
   * Throws BadRequestError if lesson between tutor and student at time is
   * already in database.
   * 
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


  /** Given a user, return all lessons scheduled for that user
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


  /** Given a time, return all lessons scheduled at that time.
   *
   * Throws NotFoundError if not found.
   **/

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

}


module.exports = Lesson;
