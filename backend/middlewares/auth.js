const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/settings');
const UnauthorizedError = require('../utils/errors/401-Unauthorized');

// eslint-disable-next-line consistent-return
const authMiddleware = (req, res, next) => {
  const { authorization } = req.headers;
  const token = authorization ? authorization.replace('Bearer ', '') : null;

  if (!token) {
    return next(new UnauthorizedError('Необходима авторизация'));
  }

  let payload;

  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return next(UnauthorizedError('Необходима авторизация'));
  }

  req.user = payload; // записываем пейлоуд в объект запроса

  next(); // пропускаем запрос дальше
};

module.exports = authMiddleware;
