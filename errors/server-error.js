// eslint-disable-next-line no-unused-vars
function serverError(err, req, res, next) {
  const { statusCode = 500, message } = err;

  res
    .status(statusCode)
    .send({
      message: statusCode === 500
        ? 'На сервере произошла ошибка'
        : message,
    });
}

module.exports = serverError;
