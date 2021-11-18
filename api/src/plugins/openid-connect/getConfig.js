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
      keys: options.keys
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
    extraClientMetadata: {
      properties: ['superadmin'],
    },
    logoutSource: async function renderLogoutSource(ctx, form) {
      const clientId = ctx.oidc.session.logout.clientId;
      const template = await options.getTemplate(clientId, 'end-session', { form });
      ctx.body = template;
    },
    subjectTypes: ['public', 'pairwise'],
    pairwiseSalt: options.pairwiseSalt,
    interactionUrl: async (ctx, interaction) => `/interaction/${ctx.oidc.uuid}`,
    scopes: ['admin', 'superadmin', 'offline_access'],
    ttl: {
      AccessToken: options.ttl.AccessToken || 3600,
      AuthorizationCode: options.ttl.AuthorizationCode || 600,
      ClientCredentials: options.ttl.ClientCredentials || 600,
      DeviceCode: options.ttl.DeviceCode || 600,
      IdToken: options.ttl.IdToken || 3600,
      RefreshToken: options.ttl.RefreshToken || 1209600 // default two weeks
    },
    renderError: options.renderError,
  };
};
