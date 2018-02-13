const uuid = require('uuid');
const bookshelf = require('../../lib/bookshelf');

module.exports = () => {
  return {
    create: async function(userId, hoursTilExpiration, saveOptions) {
      await this.destroyUserTokens(userId);

      hoursTilExpiration = hoursTilExpiration || 24;
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

    destroyUserTokens: function(userId) {
      return bookshelf.model('email_token').where('user_id', userId).destroy();
    }
  };
};

module.exports['@singleton'] = true;
module.exports['@require'] = [];
