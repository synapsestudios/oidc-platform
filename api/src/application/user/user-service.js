const bcrypt = require('bcrypt');
const uuid = require('uuid');

module.exports = (bookshelf) => {
  return {
    encryptPassword: function(password) {
      return new Promise((resolve, reject) => {
        bcrypt.genSalt(10, (err, salt) => {
          if (err) reject(err);
          bcrypt.hash(password, salt, (err, hash) => {
            if (err) reject(err);
            resolve(hash);
          });
        });
      });
    },

    comparePasswords: function(password, user) {
      var hash = user.get('password');
      return new Promise(function(resolve, reject) {
        bcrypt.compare(password, hash, function(err, res) {
          if (res) {
            resolve();
          } else {
            reject();
          }
        });
      });
    },

    create: function(email, password) {
      return this.encryptPassword(password)
        .then(hashedPass => bookshelf.model('user').forge({
          id : uuid.v4(),
          email,
          password : hashedPass
        }).save({}, {method: 'insert'}));
    }
  };
};

module.exports['@singleton'] = true;
module.exports['@require'] = ['bookshelf'];
