const bookshelf = require('../../bookshelf');

module.exports = (ValidationError) => async (value, options) => {
  const tokenQuery = bookshelf.model('email_token').where({token: value});
  const token = await tokenQuery.fetch();
  const userQuery = bookshelf.model('user').where({id: token.get('user_id')});
  const user = await userQuery.fetch();
  const badEmailToken = new ValidationError('That email token is no longer good');
  if (!user.get('pending_email_lower') || !user.get('pending_email')) {
    // Email change has been canceled
    throw badEmailToken;
  }
  return value;
};

module.exports['@singleton'] = true;
module.exports['@require'] = ['validator/validation-error'];
