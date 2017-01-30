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
              resolve(value);
            } else {
              reject(new ValidationError(message || 'Row exists', 'rowNotExists'));
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
