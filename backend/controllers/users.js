const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { ValidationError } = require('mongoose').Error;
const User = require('../models/user');
const { JWT_SECRET } = require('../config/settings');
const BadRequestError = require('../utils/errors/400-BadRequest');
const NotFoundError = require('../utils/errors/404-NotFound');

const ConflictRequestError = require('../utils/errors/409-ConflictRequest');

const createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;

  bcrypt
    .hash(password, 10)
    .then((hashedPassword) => {
      User.create({
        name,
        about,
        avatar,
        email,
        password: hashedPassword,
      })
        .then((user) => {
          res.status(201).send({
            name: user.name,
            about: user.about,
            avatar: user.avatar,
            email: user.email,
          });
        })
        .catch((err) => {
          if (err instanceof ValidationError) {
            next(new BadRequestError('Некорректные данные'));
          } else if (err.code === 11000) {
            next(new ConflictRequestError('Такой пользователь уже существует'));
          } else {
            next(err);
          }
        });
    })
    .catch(next);
};

const getAllUsers = (req, res, next) => {
  User.find({})
    .then((userList) => res.send({ data: userList }))
    .catch(next);
};

const getUser = (req, res, next) => {
  User.findById(req.params.userId)
    .orFail(new NotFoundError('Пользователь с таким ID не найден'))
    .then((foundUser) => res.send({ data: foundUser }))
    .catch(next);
};

const getCurrentUser = (req, res, next) => {
  User.findById(req.user._id)
    .orFail(new NotFoundError('Пользователь с таким ID не найден'))
    .then((foundUser) => res.send({ data: foundUser }))
    .catch(next);
};
// eslint-disable-next-line consistent-return
const updateUser = (req, res, next) => {
  const { name, about } = req.body;

  User.findByIdAndUpdate(req.user._id, { name, about }, { new: true, runValidators: true })
    .then((updatedUser) => res.send({ data: updatedUser }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Переданы некорректные данные'));
      }
      next(err);
    });
};

// eslint-disable-next-line consistent-return
const updateUserAvatar = (req, res, next) => {
  const { avatar } = req.body;

  User.findByIdAndUpdate(req.user._id, { avatar }, { new: true, runValidators: true })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err instanceof ValidationError) {
        next(new BadRequestError('Некорректные данные'));
      } else {
        next(err);
      }
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: '7d' });
      res.send({ email, token });
    })
    .catch(next);
};

module.exports = {
  createUser,
  getAllUsers,
  getUser,
  getCurrentUser,
  updateUser,
  updateUserAvatar,
  login,
};
