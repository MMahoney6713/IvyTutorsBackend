"use strict";

const db = require("../db");
const bcrypt = require("bcrypt");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");

const { BCRYPT_WORK_FACTOR } = require("../config.js");

/** Related functions for users. */

class User {
  /** authenticate user with email, password.
   *
   * Returns { email, full_name, is_tutor, is_admin }
   *
   * Throws UnauthorizedError is user not found or wrong password.
   **/

  static async authenticate(email, password) {
    // try to find the user first
    const result = await db.query(
          `SELECT email,
                  password, 
                  is_tutor AS "isTutor",
                  is_admin AS "isAdmin"
           FROM users
           WHERE email = $1`,
        [email],
    );

    const user = result.rows[0];

    if (user) {
      const isValid = await bcrypt.compare(password, user.password);
      if (isValid === true) {
        delete user.password;
        return user;
      }
    }

    throw new UnauthorizedError("Invalid username/password");
  }

  /** Register user with data.
   * 
   * Returns { email, full_name, is_admin }
   *
   * Throws BadRequestError on duplicates.
   **/

  static async register(
      { password, fullName, email, isAdmin }) {
    const duplicateCheck = await db.query(
          `SELECT email
           FROM users
           WHERE email = $1`,
        [email],
    );

    if (duplicateCheck.rows[0]) {
      throw new BadRequestError(`Duplicate email: ${email}`);
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    const result = await db.query(
          `INSERT INTO users
           (email,
            password,
            full_name,
            is_admin)
           VALUES ($1, $2, $3, $4)
           RETURNING full_name AS "fullName", email, is_admin AS "isAdmin"`,
        [
          email,
          hashedPassword,
          fullName,
          isAdmin,
        ],
    );

    const user = result.rows[0];

    return user;
  }


  /** Given an email, return data about user.
   *
   * Returns full user object.
   *
   * Throws NotFoundError if user not found.
   **/

  static async get(email) {
    const userRes = await db.query(
          `SELECT email,
                  full_name AS "fullName",
                  is_admin AS "isAdmin", 
                  is_tutor AS "isTutor",
                  bio,
                  university,
                  image_url AS "imageURL",
                  zoom_link AS "zoomLink",
                  stripe_id AS "stripeID",
                  is_onboarded AS "isOnboarded"
           FROM users
           WHERE email = $1`,
        [email],
    );

    const user = userRes.rows[0];

    if (!user) throw new NotFoundError(`No user: ${email}`);

    return user;
  }

}


module.exports = User;
