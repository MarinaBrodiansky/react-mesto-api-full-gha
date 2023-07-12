const { ValidationError } = require('mongoose').Error;
const Card = require('../models/card');
const {
  STATUS_CREATED,
} = require('../utils/globalVars');
const BadRequestError = require('../utils/errors/400-BadRequest');
const ForbiddenError = require('../utils/errors/403-Forbidden');
const NotFoundError = require('../utils/errors/404-NotFound');

const createCard = (req, res, next) => {
  const { name, link } = req.body;

  Card.create({ name, link, owner: req.user._id })
    .then((newCard) => res.status(STATUS_CREATED).send({ data: newCard }))
    .catch((err) => {
      if (err instanceof ValidationError) {
        next(new BadRequestError('Переданы некорректные данные'));
      } else {
        next(err);
      }
    });
};

const getCards = (req, res, next) => {
  Card.find({})
    .then((cardList) => res.send({ data: cardList }))
    .catch((err) => next(err));
};

const deleteCard = (req, res, next) => {
  const { cardId } = req.params;
  const { _id: userId } = req.user;

  Card.findById(cardId)
    .orFail(new NotFoundError('Карточка с таким id не найдена'))
    .then((card) => {
      if (!card.owner.equals(userId)) {
        return next(new ForbiddenError('Вы не можете удалить эту карточку'));
      }

      return Card.deleteOne(card)
        .then(() => {
          res.send({ data: {} });
        })
        .catch(next);
    })
    .catch(next);
};

const putLike = (req, res, next) => {
  Card.findByIdAndUpdate(req.params.cardId, { $addToSet: { likes: req.user._id } }, { new: true })
    .orFail(new NotFoundError('Карточка с таким id не найдена'))
    .then((card) => res.send({ data: card }))
    .catch(next);
};

const deleteLike = (req, res, next) => {
  Card.findByIdAndUpdate(req.params.cardId, { $pull: { likes: req.user._id } }, { new: true })
    .orFail(new NotFoundError('Карточка с таким id не найдена'))
    .then((card) => res.send({ data: card }))
    .catch(next);
};

module.exports = {
  createCard,
  getCards,
  deleteCard,
  putLike,
  deleteLike,
};
