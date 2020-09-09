var config = require('./config');

module.exports = {
  development : {
    client   : config('/dbAdapter'),
    seeds    : {
      directory : './seeds/dev'
    },
    connection : config('/dbConnection'),
    pool : {
      min : 2,
      max : 10
    },
    migrations : {
      tableName : 'oidc_migrations'
    }
  },

  test : {
    client   : config('/dbAdapter'),
    seeds    : {
      directory : './seeds/dev'
    },
    connection : config('/dbConnection'),
    pool : {
      min : 2,
      max : 10
    },
    migrations : {
      tableName : 'oidc_migrations'
    }
  },

  qa : {
    client   : config('/dbAdapter'),
    seeds    : {
      directory : './seeds/dev'
    },
    connection : config('/dbConnection'),
    pool : {
      min : 2,
      max : 10
    },
    migrations : {
      tableName : 'oidc_migrations'
    }
  },

  staging : {
    client   : config('/dbAdapter'),
    seeds    : {
      directory : './seeds/prod'
    },
    connection : config('/dbConnection'),
    pool : {
      min : 2,
      max : 10
    },
    migrations : {
      tableName : 'oidc_migrations'
    }
  },

  production : {
    client   : config('/dbAdapter'),
    seeds    : {
      directory : './seeds/prod'
    },
    connection : config('/dbConnection'),
    pool : {
      min : 2,
      max : 10
    },
    migrations : {
      tableName : 'oidc_migrations'
    }
  }

};
