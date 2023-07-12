const STATUS_CREATED = 201;
const STATUS_BAD_REQ = 400;
const STATUS_NOT_FOUND = 404;
const STATUS_CONFLICT = 409;
const STATUS_SERVER_ERROR = 500;

const MSG_SERVER_ERROR = 'Что-то пошло не так: ';
const MSG_NOT_FOUND = 'Ресурс с таким ID не найден.';
const MSG_BAD_REQ = 'Переданы некорректные данные ';

const ERROR_INVALID_ID = 'InvalidId';

module.exports = {
  STATUS_CREATED,
  STATUS_BAD_REQ,
  STATUS_NOT_FOUND,
  STATUS_CONFLICT,
  STATUS_SERVER_ERROR,
  MSG_SERVER_ERROR,
  MSG_NOT_FOUND,
  MSG_BAD_REQ,
  ERROR_INVALID_ID,
};
