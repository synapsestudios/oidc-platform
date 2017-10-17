const bcrypt = require('bcrypt');

module.exports = (password, user) => {
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
