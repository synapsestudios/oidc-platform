const _ = require('lodash');
const models = require('../application/models');
const knex = require('./knex');
var bookshelf = require('bookshelf')(knex);
bookshelf.plugin('registry');

for (let i = 0; i < models.length; i++) {
  const { name, model } = models[i](bookshelf);
  bookshelf.model(name, model);
}

module.exports = () => bookshelf;
module.exports = bookshelf;
// module.exports['@singleton'] = true;
// module.exports['@require'] = []; // don't add any ioc dependencies here!
