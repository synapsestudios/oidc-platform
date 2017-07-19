const uuid = require('uuid');

module.exports = bookshelf => ({
  createTemplate(template) {
    return bookshelf.model('template').forge({ template, id: uuid.v4() }).save();
  },
  findById(id) {
  	return bookshelf.model('template').where({id}).fetch();
  }
});

module.exports['@singleton'] = true;
module.exports['@require'] = ['bookshelf'];
