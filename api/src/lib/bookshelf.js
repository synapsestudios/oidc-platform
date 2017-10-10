const _ = require('lodash');
const models = require('../application/models');

module.exports = (knex) => {
  var bookshelf = require('bookshelf')(knex);
  bookshelf.plugin('registry');

  for (let i = 0; i < models.length; i++) {
    const { name, model } = models[i](bookshelf);
    bookshelf.model(name, model);
  }

  return bookshelf;
};

module.exports['@singleton'] = true;
module.exports['@require'] = ['knex'];
