const Joi = require('joi');

// Mix JOI validation with our own custom validators
const mixedValidation = (joiSchema, customSchema) => {
  return (values, options, next) => {

    const schema = Joi.object().keys(joiSchema);
    options.context.values = values;

    return Joi.validate(values, schema, options, (errors, value) => {
      if (errors && options.abortEarly) {
        next(errors, value);
      } else if (! errors) {
        errors = new Error();
        errors.details = [];
      }

      return Promise.all(
        Object.keys(customSchema).map((path) => {
          if (! value[path]) {
            return;
          }

          return customSchema[path](value[path], options, next).catch(
            (err)   => {
              if (err.name !== 'ValidationError') { // A real error happened
                return next(err, value);
              }

              errors.details.push({
                path  : path,
                message : err.message,
                type  : err.type
              });

              if (options.abortEarly) {
                next(err, value);
              }
            }
          );
        })
      )
      .then(
        () => {
          if (errors.details.length) {
            next(errors, value);
          } else {
            next(null, value);
          }
        }
      )
      .catch((err) => {
        next(err, value);
      });
    });
  };
};

module.exports = () => mixedValidation;
module.exports['@singleton'] = true;
