module.exports = () => {
  var ValidationError = function(message, type) {
    this.name  = 'ValidationError';
    this.message = message;
    this.stack   = (new Error()).stack;
    this.type  = type;
  };

  ValidationError.prototype   = Object.create(Error.prototype);
  ValidationError.constructor = ValidationError;

  return ValidationError;
};

module.exports['@singleton'] = false;
