const { celebrate, Joi, errors } = require('celebrate');
const cookieParser = require('cookie-parser');
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const {
  PORT,
  ORIGINS,
  MONGO_DB,
  LIMITER,
} = require('./config/settings');
const auth = require('./middlewares/auth');
const errorHandler = require('./middlewares/errorHandler');
const { createUser, login } = require('./controllers/users');
const NotFoundError = require('./utils/errors/404-NotFound');
const { requestLogger, errorLogger } = require('./middlewares/logger');

mongoose.set('strictQuery', false);
mongoose.connect(MONGO_DB);

const app = express();

app.use(cors({ origin: ORIGINS }));
app.use(express.json());
app.use(requestLogger);
app.use(LIMITER); // AntiDOS for all requests
app.use(helmet());
app.use(cookieParser());

app.post(
  '/signup',
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().min(2).max(30),
      about: Joi.string().min(2).max(30),
      avatar: Joi.string().pattern(
        /^(https?:\/\/)?[\w-]+(\.[\w-]+)+([\w.,@?^=%&:;/~+#-]*[\w@?^=%&/~+#-])?$/,
      ),
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    }),
  }),
  createUser,
);

app.post(
  '/signin',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    }),
  }),
  login,
);

app.use('/users', auth, require('./routes/users'));
app.use('/cards', auth, require('./routes/cards'));

app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});

app.use('*', auth, () => {
  throw new NotFoundError('Не найдено');
});

app.use(errorLogger);
app.use(errors());
app.use(errorHandler);

// eslint-disable-next-line no-console
app.listen(PORT, () => console.log('Server started on port:', PORT));
