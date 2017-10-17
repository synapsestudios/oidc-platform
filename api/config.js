const Confidence = require('confidence');

var config = {
  '$filter': 'env',
  '$base': {
    dbAdapter: process.env.OIDC_DB_ADAPTER,
    dbConnection: {
      host: process.env.OIDC_DB_HOST,
      user: process.env.OIDC_DB_USER,
      password: process.env.OIDC_DB_PASSWORD,
      database: process.env.OIDC_DB_NAME,
      port: process.env.OIDC_DB_PORT,
    },
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379
    },
    email: process.env.OIDC_EMAIL_DRIVER,
    oidc: {
      cookieKeys: [process.env.COOKIE_KEY, process.env.OLD_COOKIE_KEY],
      initialAccessToken: process.env.OIDC_INITIAL_ACCESS_TOKEN,
      oauthNative: process.env.OIDC_OAUTH_NATIVE === 'false' ? false : true,
    },
    baseUrl: process.env.OIDC_BASE_URL,
    aws: {
      s3Bucket: process.env.OIDC_S3_BUCKET,
    },
  },
  'development': {},
  'qa': {},
  'staging': {},
  'production': {},
};

module.exports = function(path, criteria) {
  var store = new Confidence.Store();
  path = path ? path : '/';
  criteria = criteria ? criteria : {};
  criteria.env = process.env.NODE_ENV || 'development';

  store.load(config);
  return store.get(path, criteria);
};
