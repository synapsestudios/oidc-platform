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
      return bookshelf.model('user').where({ email: email.toLowerCase() }).fetch()
        .then(user => {
          if (!user) throw new Error('No user found for this email');
          return comparePasswords(password, user)
            .then(isAuthenticated => {
              if (!isAuthenticated) throw new Error('Password does not match record');
              return user.serialize({strictOidc: true});
            });
        });
    },

    findByIdForOidc: function(id) {
      return bookshelf.model('user').where({ id }).fetch()
        .then(user => user.serialize({ strictOidc: true }));
    },
  };
};

module.exports['@singleton'] = true;
module.exports['@require'] = ['bookshelf'];
