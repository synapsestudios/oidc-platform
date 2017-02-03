const _ = require('lodash');

// This plugin copies methods in model.prototype.relationships to model.prototype on
// extend, which allows us to easily enumerate all the relations for a given model
function relationships(bookshelf) {
  var originalExtend = bookshelf.Model.extend;

  bookshelf.Model.extend = function(protoProps, constructorProps) {
    if (protoProps.relationships) {
      var keys = Object.keys(protoProps.relationships);
      for (var i = 0, len = keys.length; i < len; i++) {
        protoProps[keys[i]] = protoProps.relationships[keys[i]];
      }
    }

    var model = originalExtend.call(this, protoProps, constructorProps);

    model.prototype.relationships = model.prototype.relationships || {};
    _.defaults(model.prototype.relationships, this.prototype.relationships || {});

    return model;
  };
}

module.exports = (knex) => {
  var bookshelf = require('bookshelf')(knex);
  bookshelf.plugin('registry');
  bookshelf.plugin(relationships);
  return bookshelf;
};

module.exports['@singleton'] = true;
module.exports['@require'] = ['knex'];
