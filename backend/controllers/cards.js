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
    .then((newCard) => newCard.populate('owner').then((data) => res.status(STATUS_CREATED).send(data)))
    .catch((err) => {
      if (err instanceof ValidationError) {
        next(new BadRequestError('Переданы некорректные данные'));
      } else {
        next(err);
      }
    });
};

/**
 * ```json
 * [{
      "likes": [
        {
            "name": "Cat",
            "about": "Cat 🙊",
            "avatar": "https://avatars.mds.yandex.net/get-pdb/467185/a88c940f-9ebf-40c6-8ed5-ea10ea32dd04/orig",
            "_id": "a03d6d96435e83ac258658ed",
            "cohort": "cohort-62"
        },
      ],
      "_id": "64aedf7e3f91f30f688e9a4a",
      "name": "https://mashapasha.com/wp-cont",
      "link": "https://mashapasha.com/wp-content/uploads/2015/12/azrieli_07-1600x1022.jpg",
      "owner": {
          "name": "sffsd",
          "about": "fsf",
          "avatar": "https://krasivosti.pro/uploads/posts/2021-04/1617927310_10-p-kotik-za-kompyuterom-11.jpg",
          "_id": "3ad6d5267fb08aca4ce260ff",
          "cohort": "cohort-62"
      },
      "createdAt": "2023-07-12T17:14:38.117Z"
  }]
  ```
 */
const getCards = (req, res, next) => {
  Card.find({}).populate(['likes', 'owner'])
    .then((cardList) => res.send(cardList))
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
          res.send({ message: 'Карточка успешно удалена' });
        })
        .catch(next);
    })
    .catch(next);
};

const putLike = (req, res, next) => {
  Card.findByIdAndUpdate(req.params.cardId, { $addToSet: { likes: req.user._id } }, { new: true })
    .populate(['likes', 'owner'])
    .orFail(new NotFoundError('Карточка с таким id не найдена'))
    .then((card) => res.send(card))
    .catch(next);
};

const deleteLike = (req, res, next) => {
  Card.findByIdAndUpdate(req.params.cardId, { $pull: { likes: req.user._id } }, { new: true })
    .populate('owner')
    .orFail(new NotFoundError('Карточка с таким id не найдена'))
    .then((card) => res.send(card))
    .catch(next);
};

module.exports = {
  createCard,
  getCards,
  deleteCard,
  putLike,
  deleteLike,
};
