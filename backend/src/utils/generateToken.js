const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  // Signs a token with the user ID and our secret key, expires in 30 days
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

module.exports = generateToken;
