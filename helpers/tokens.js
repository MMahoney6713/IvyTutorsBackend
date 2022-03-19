const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

/** return signed JWT from user data. */

function createToken(user) {
  console.assert(user.isAdmin !== undefined,
      "createToken passed user without isAdmin property");

  console.log(user);

  let payload = {
    email: user.email,
    isAdmin: user.isAdmin || false,
    isTutor: user.isTutor
  };

  return jwt.sign(payload, SECRET_KEY);
}

module.exports = { createToken };
