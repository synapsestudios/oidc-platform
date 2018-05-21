var Boom = require('boom');
const logger = require('./logger');

module.exports = function(error) {
  if (!error.data || !error.data.details) {
    logger.error(error);
    return error.isBoom ? error : Boom.badImplementation(error);
  }

  error.output.payload.validationErrors = error.data.details.map(failure => ({
    message : failure.message,
    type : failure.type,
    key : failure.path
  }));

  return error;
};
