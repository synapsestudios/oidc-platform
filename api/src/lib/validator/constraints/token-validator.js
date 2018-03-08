const Boom = require('boom');
const bookshelf = require('../../bookshelf');

module.exports = (server, ValidationError) => async (value, options) => {
  const tokenQuery = bookshelf.model('email_token').where({token: value});
  const token = await tokenQuery.fetch();
  const userQuery = bookshelf.model('user').where({id: token.get('user_id')})
  const user = await userQuery.fetch();
  if (!user.get('pending_email_lower')) {
    // Email change has been canceled
    const badEmailToken = new ValidationError('That email token is no longer good');
    throw badEmailToken;
  }
  return value
}

module.exports['@singleton'] = true;
module.exports['@require'] = ['server', 'validator/validation-error'];
