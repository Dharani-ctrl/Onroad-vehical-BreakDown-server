const jwt = require('jsonwebtoken');

const generateToken = (res, userId, role) => {
  const token = jwt.sign({ id: userId, role }, process.env.JWT_SECRET || 'supersecretjwtkey_12345', {
    expiresIn: '30d',
  });

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  return token;
};

module.exports = generateToken;
