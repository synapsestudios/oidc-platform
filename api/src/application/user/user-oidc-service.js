const bcrypt = require('bcrypt');

module.exports = (bookshelf) => {
  const comparePasswords = (password, user) => {
    var hash = user.get('password');
    return new Promise(function(resolve, reject) {
      bcrypt.compare(password, hash, function(err, res) {
        if (res) {
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
  };

  return {
    authenticate: function(email, password) {
      return bookshelf.model('user').where({ email_lower: email.toLowerCase() }).fetch()
        .then(user => {
          if (!user) return false;
          return comparePasswords(password, user)
            .then(isAuthenticated => {
              if (!isAuthenticated) return false;
              return user.serialize({strictOidc: true});
            });
        });
    },

    findByIdForOidc: function(ctx, id) {
      return bookshelf.model('user').where({ id }).fetch()
        .then(user => user ? user.serialize({ strictOidc: true }) : false);
    },
  };
};

module.exports['@singleton'] = true;
module.exports['@require'] = ['bookshelf'];
