const uuid = require('uuid');
const bookshelf = require('../../lib/bookshelf');

module.exports = () => {
  return {
    create: function(userId, hoursTilExpiration, saveOptions) {
      hoursTilExpiration = hoursTilExpiration || 1;
      const expires = new Date();
      expires.setHours(expires.getHours() + hoursTilExpiration);

      return bookshelf.model('email_token').forge({
        token: uuid.v4(),
        user_id: userId,
        expires_at: expires,
      }).save({}, Object.assign({method: 'insert'}, saveOptions));
    },

    find: function(token) {
      return bookshelf.model('email_token')
        .forge({ token })
        .where('expires_at', '>', bookshelf.knex.fn.now())
        .fetch()
    },

    destroyUserTokens: function(user) {
      return bookshelf.model('email_token').where('user_id', user.get('id')).destroy();
    }
  };
};

module.exports['@singleton'] = true;
module.exports['@require'] = [];
