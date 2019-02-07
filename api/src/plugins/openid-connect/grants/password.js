module.exports = (options) => ({
  params: ['username', 'password'],
  grantTypeFactory: function passwordGrantTypeFactory(providerInstance) {
    return async function passwordGrantType(ctx, next) {
      const { username, password } = ctx.oidc.params;
      const account = await options.authenticateUser(username, password);

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
          ctx.oidc.client.sectorIdentifier
        );
        token.set('at_hash', accessToken);
        token.set('sub', account.accountId);

        const idToken = await token.sign(ctx.oidc.client);

        const refreshToken = new RefreshToken({
          client: ctx.oidc.client,
          scope: ctx.oidc.params.scope || '',
          accountId: account.accountId,
          grantId: ctx.oidc.uuid,
        });

        const refreshTokenValue = await refreshToken.save();

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
    };
  }
});
