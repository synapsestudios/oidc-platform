const logger = require('../../../lib/logger');

module.exports = (options) => ({
  params: ['username', 'password'],
  grantTypeFactory: function passwordGrantTypeFactory(providerInstance) {
    return async function passwordGrantType(ctx, next) {
      const { username, password } = ctx.oidc.params;
      const account = await options.authenticateUser(username, password);

      try {
        if (account) {
          const { AccessToken, IdToken, RefreshToken } = providerInstance;
          const at = new AccessToken({
            accountId: account.accountId,
            clientId: ctx.oidc.client.clientId,
            grantId: ctx.oidc.uuid,
            scope: ctx.oidc.params.scope || '',
          });

          const accessToken = await at.save();
          const expiresIn = AccessToken.expiresIn;
          const token = new IdToken(
            Object.assign({}, await Promise.resolve(account.claims())),
            ctx.oidc.client
          );

          const refreshToken = new RefreshToken({
            clientId: ctx.oidc.client.clientId,
            scope: ctx.oidc.params.scope || '',
            accountId: account.accountId,
            grantId: ctx.oidc.uuid,
            claims: {
              id_token: { sub: { value: account.accountId } },
            },
          });

          const refreshTokenValue = await refreshToken.save();

          token.set('at_hash', accessToken);
          token.set('rt_hash', refreshTokenValue);
          token.set('sub', account.accountId);

          const idToken = await token.sign();

          ctx.body = {
            access_token: accessToken,
            expires_in: expiresIn,
            token_type: 'Bearer',
            id_token: idToken,
            refresh_token: refreshTokenValue,
          };
        } else {
          ctx.body = {
            error: 'invalid_grant',
            error_description: 'invalid credentials provided',
          };
          ctx.status = 400;
        }

        await next();
      } catch (e) {
        logger.error(e);
        ctx.body = {
          error: 'Internal Server Error',
          error_description: e,
        };
        ctx.status = 500;
        await next();
      }
    };
  },
});
