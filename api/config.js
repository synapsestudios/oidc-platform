var Confidence = require('confidence');

var config = {
  '$filter': 'env',
  '$base': {
    env: process.env.NODE_ENV || 'development',
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
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD,
      userSessionTrackingEnabled: process.env.ENABLE_USER_SESSION_TRACKING || false,
      tls: process.env.REDIS_TLS ? { port: process.env.REDIS_TLS_PORT || 6380 } : undefined,
    },
    email: process.env.OIDC_EMAIL_DRIVER,
    oidc: {
      cookieKeys: [process.env.COOKIE_KEY, process.env.OLD_COOKIE_KEY],
      initialAccessToken: process.env.OIDC_INITIAL_ACCESS_TOKEN,
      pairwiseSalt: process.env.OIDC_PAIRWISE_SALT,
    },
    baseUrl: process.env.OIDC_BASE_URL,
    aws: {
      s3Bucket: process.env.OIDC_S3_BUCKET,
    },
    clientInitiatedLogout: process.env.CLIENT_INITIATED_LOGOUT === 'true' ? true : false,
    userRegistration: process.env.ENABLE_USER_REGISTRATION === 'true' ? true : false,
    webhooks: process.env.ENABLE_WEBHOOKS === 'true' ? {
      adapter: process.env.WEBHOOK_ADAPTER ? process.env.WEBHOOK_ADAPTER : 'memory',
      timeout: process.env.WEBHOOK_TIMEOUT || 2000,
      maxRetries: process.env.WEBHOOK_MAX_RETRIES || 2,
      retryDelay: process.env.WEBHOOK_RETRY_DELAY || 10000,
      concurrency: process.env.WEBHOOK_CONCURRENCY || 1,
    } : false,
  },
  'development': {},
  'qa': {},
  'staging': {},
  'production': {},
  'test': {},
};

module.exports = function(path, criteria) {
  var store = new Confidence.Store();
  path = path ? path : '/';
  criteria = criteria ? criteria : {};
  criteria.env = process.env.NODE_ENV || 'development';

  store.load(config);
  return store.get(path, criteria);
};
