const uuid = require('uuid');

module.exports = bookshelf => {
  return {
    create: function(userId, hoursTilExpiration) {
      hoursTilExpiration = hoursTilExpiration || 1;
      const expires = new Date();
      expires.setHours(expires.getHours() + hoursTilExpiration);

      return bookshelf.model('email_token').forge({
        token: uuid.v4(),
        user_id: userId,
        expires_at: expires,
      }).save({}, {method: 'insert'});
    },

    find: function(token) {
      return bookshelf.model('email_token')
        .forge({ token })
        .where('expires_at', '>', bookshelf.knex.fn.now())
        .fetch()
    }
  };
};

module.exports['@singleton'] = true;
module.exports['@require'] = ['bookshelf'];
