module.exports = {
  email: {
    'any.required': 'Email address is required',
    'any.empty': 'Email address is required',
    'string.email': 'Must be a valid email address',
  },
  password: {
    'any.empty': 'Password is required',
    'string.min': 'Password must be at least 8 characters',
  },
  pass2: {
    'any.allowOnly': 'Passwords must match'
  },
  redirect_uri: {
    'any.required': 'Redirect URI is required',
  },
  client_id: {
    'any.required': 'Client ID is required'
  },
  response_type: {
    'any.required': 'Response type is required',
  },
  scope: {
    'any.required': 'Scope is required',
  },
  token: {
    'any.required': 'Token is required',
  },
  profile: {
    'string.uri': 'Must be a valid URL',
  },
  picture: {
    'string.uri': 'Must be a valid URL',
  },
  website: {
    'string.uri': 'Must be a valid URL',
  },
  birthdate: {
    'string.isoDate': 'Must be valid date in YYYY-MM-DD format'
  },
  current: {
    'any.empty': 'Current password is required',
  }
};
