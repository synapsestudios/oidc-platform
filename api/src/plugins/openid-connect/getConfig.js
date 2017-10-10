module.exports = options => {
  const prefix = options.prefix ? `/${options.prefix}` : '/op';
  return {
    findById: options.findUserById,
    routes: {
      authorization: `${prefix}/auth`,
      certificates: `${prefix}/certs`,
      check_session: `${prefix}/session/check`,
      end_session: `${prefix}/session/end`,
      introspection: `${prefix}/token/introspection`,
      registration: `${prefix}/reg`,
      revocation: `${prefix}/token/revocation`,
      token: `${prefix}/token`,
      userinfo: `${prefix}/me`,
    },
    acrValues: ['session', 'urn:mace:incommon:iap:bronze'],
    cookies: {
      long: { signed: true },
      short: { signed: true },
    },
    discovery: {
      service_documentation: '',
      version: '',
    },
    claims: {
      amr: null,
      address: ['address'],
      email: ['email', 'email_verified'],
      phone: ['phone_number', 'phone_number_verified'],
      app_metadata: ['app_metadata'],
      profile: ['birthdate', 'family_name', 'gender', 'name', 'given_name', 'locale', 'middle_name', 'name',
        'nickname', 'picture', 'preferred_username', 'profile', 'updated_at', 'website', 'zoneinfo'],
    },
    features: {
      devInteractions: false,
      discovery: true,
      claimsParameter: true,
      clientCredentials: true,
      encryption: true,
      introspection: true,
      oauthNativeApps: true,
      registration: {
        initialAccessToken: options.initialAccessToken,
      },
      registrationManagement: false,
      request: true,
      requestUri: true,
      revocation: true,
      sessionManagement: true,
      backchannelLogout: false,
    },
    logoutSource: function renderLogoutSource(form) {
      const layout = fs.readFileSync(path.join(__dirname, './templates/layout/layout.hbs'), 'utf8');
      const logout = fs.readFileSync(path.join(__dirname, './templates/end_session.hbs'), 'utf8');

      this.body = handlebars.compile(layout)({
        content: handlebars.compile(logout)({ form })
      });
    },
    subjectTypes: ['public', 'pairwise'],
    pairwiseSalt: 'da1c442b365b563dfc121f285a11eedee5bbff7110d55c88',
    interactionUrl: async (ctx, interaction) => `/interaction/${ctx.oidc.uuid}`,
    scopes: ['admin'],
  }
}
