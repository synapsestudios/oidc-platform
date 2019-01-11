module.exports = (options) => ({
  params: ['username', 'password'],
  grantTypeFactory: function passwordGrantTypeFactory(providerInstance) {
    return async function passwordGrantType(ctx, next) {
      const { username, password } = ctx.oidc.params;
      const account = await options.authenticateUser(username, password);

      if (account) {
        const { AccessToken, IdToken } = providerInstance;
        const at = new AccessToken({
          accountId: account.accountId,
          clientId: ctx.oidc.client.clientId,
          grantId: ctx.oidc.uuid,
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

        ctx.body = {
          access_token: accessToken,
          expires_in: expiresIn,
          token_type: 'Bearer',
          id_token: idToken,
        };
      } else {
        ctx.body = {
          error: 'invalid_grant',
          error_description: 'invalid credentials provided',
        };
      }

      await next();
    };
  }
});
