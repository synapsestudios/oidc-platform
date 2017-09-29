module.exports = (options) => ({
  params: ['username', 'password'],
  grantTypeFactory: function passwordGrantTypeFactory(providerInstance) {
    return function * passwordGrantType(next) {
      const { username, password } = this.oidc.params;
      const account = yield options.authenticateUser(username, password);

      if (account) {
        const AccessToken = providerInstance.AccessToken;
        const at = new AccessToken({
          accountId: 'foo',
          clientId: this.oidc.client.clientId,
          grantId: this.oidc.uuid,
        });

        const accessToken = yield at.save();
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

      yield next;
    };
  }
});
