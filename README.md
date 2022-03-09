# OpenID Connect Identity Platform

The synapse OpenID Connect platform uses [node-oidc-provider](https://github.com/panva/node-oidc-provider) to provide user authentication for our clients' applications. node-oidc-provider is an [OpenID Connect](http://openid.net/connect/) provider library. In order to fully understand the ins and outs of this application, understanding OpenID Connect is a must.

## Usage Documentation
- [Installation](docs/installation.md)
- [Implementation](docs/implementation.md)
- [Screens and Theming](docs/screens-and-theming.md)
- [Installing Themes](docs/installing-themes.md)
- [Webhooks](docs/webhooks.md)

## Setting up for development

0. Copy `common.template.env` as `common.env` and provide a mailgun, SES, or sendgrid key
0. Set the OIDC_DB_* vars based on what RDBMS you are using.
0. Run either `./compose-mysql up` or `./compose-postgres up`. You can also just do `docker-compose up` which will use postgres.
0. Create an oauth client by posting to http://localhost:9001/op/reg with the following:
```
Headers:
{
    "Content-Type": "application/json",
    "Authorization": "Bearer token1", // common.env -> OIDC_INITIAL_ACCESS_TOKEN value
}
Body:
{
    "response_types": ["code id_token token"],
    "grant_types": [
        "authorization_code",
        "implicit",
        "client_credentials"
    ],
    "redirect_uris": ["https://sso-client.test:3000/"],
    "post_logout_redirect_uris": ["https://sso-client.test:3000/logout"]
}
```
0. In `test-client/src` create a copy of `config.template.js` and call it `config.js`. Fill in the
client_id and client_secret of the client you created in the previous step.
0. Add `sso-client.test`for `127.0.0.1` to your hosts file
0. `npm i` and `npm start` in `test-client` and `test-client/test-server`

## Session Management

Sessions are persisted by default, a user can manually log out by visiting `${prefix}/session/end`. The following query parameters should also be sent: `id_token_hint` is to allow the client to determine which user is logging out, and `post_logout_redirect_uri` allows the user to be redirected back to the client app.

## Clients

Clients can be registered dynamically with the `registration` endpoint defined in the OICD provider's Hapi plugin. By default this is `${prefix}/reg`. Any of the [OpenID Client Metadata](http://openid.net/specs/openid-connect-registration-1_0.html#ClientMetadata) can be supplied. The Bearer token for this request is validated against the `OIDC_INITIAL_ACCESS_TOKEN` environment variable. YOU MUST PROVIDE A STRONG TOKEN in production to prevent unauthorized clients from being added.

## Releasing
1. Ensure you've checked out `master` and that it's up-to-date (or if hotfixing, check out a new branch from a previous release's tag)
2. Update the version number in `api/package.json` and `api/package-lock.json` and commit the changes
3. `cd api` if you're in the root of the repo
4. `docker build -t synapsestudios/oidc-platform:vX.Y.Z .`
5. `docker push synapsestudios/oidc-platform:vX.Y.Z`
6. `git push`
7. `git tag vX.Y.Z && git push tags`
8. If hotfixing, you can `git push :refs/heads/hotfix-branch-name` to delete the hotfix branch