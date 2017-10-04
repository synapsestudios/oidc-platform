module.exports = (options) => ({
  params: ['username', 'password'],
  grantTypeFactory: function passwordGrantTypeFactory(providerInstance) {
    return async function passwordGrantType(ctx, next) {
      const { username, password } = ctx.oidc.params;
      const account = await options.authenticateUser(username, password);

      if (account) {
        const AccessToken = providerInstance.AccessToken;
        const at = new AccessToken({
          accountId: 'foo',
          clientId: this.oidc.client.clientId,
          grantId: this.oidc.uuid,
        });

        const accessToken = await at.save();
        const expiresIn = AccessToken.expiresIn;

        this.body = {
          access_token: accessToken,
          expires_in: expiresIn,
          token_type: 'Bearer',
        };
      } else {
        this.body = {
          error: 'invalid_grant',
          error_description: 'invalid credentials provided',
        };
      }

      await next();
    };
  }
});
