module.exports = (bookshelf, ValidationError) => {
  return (modelName, column, message) => {
    return (value) => {
      return new Promise((resolve, reject) => {
        var Model = bookshelf.model(modelName);
        var where = {};

        where[column] = value;

        var query = Model.where(where);

        query.fetch()
          .then(model => {
            if (! model) {
              reject(new ValidationError(message || 'Row does not exist', 'rowExist'));
            } else {
              resolve(value);
            }
          }
        ).catch((err) => {
          reject(err);
        });
      });
    };
  };
};

module.exports['@singleton'] = true;
module.exports['@require'] = ['bookshelf', 'validator/validation-error'];
