const { config } = require('dotenv');
const { rateLimit } = require('express-rate-limit');

const IS_PRODUCTION = Boolean(process.env.NODE_ENV === 'production');

const ORIGINS = [
  'https://marina.project.nomoreparties.sbs',
  'http://marina.project.nomoreparties.sbs',
  'https://marina.project.nomoredomains.work',
  'http://marina.project.nomoredomains.work',
];

if (!IS_PRODUCTION) {
  config();
  ORIGINS.push('http://localhost:3001');
}

const LIMITER = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const {
  PORT = 3000,
  JWT_SECRET = 'some-secret-key',
  MONGO_DB = 'mongodb://127.0.0.1:27017/mestodb',
} = process.env;

module.exports = {
  IS_PRODUCTION,
  PORT,
  JWT_SECRET,
  MONGO_DB,
  LIMITER,
  ORIGINS,
};
