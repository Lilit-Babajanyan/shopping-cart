const { ValidationError, UniqueConstraintError } = require("sequelize");

const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err instanceof ValidationError || err instanceof UniqueConstraintError) {
    return res.status(400).json({
      message: "validation_error",
      details: err.errors.map((error) => error.message),
    });
  }

  const status = err.status || 500;

  return res.status(status).json({
    message: status === 500 ? "internal_server_error" : err.message,
  });
};

module.exports = errorHandler;
