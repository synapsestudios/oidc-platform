# UPGRADE GUIDE
## v2.x -> v3.0.0
- The `linkUrl` template variable has been renamed to `loginUrl`
- OIDC implements the OAuth 2.0 Form Post Response Mode spec now. That means that if you're not using the strict Authorization or Implicit workflows then the oidc server will redirect back to your app with a POST request rather than a GET request. If you're using response_type values other than `code` or `id_token token` you will need to update to handle the POST with your server, or to use `code` or `id_token token` instead.
- client_id and client_secret must be uri encoded individually when used as part of the Authorization header (like when using the client_credentials grant).
```
...
  Authorization: 'Basic ' + btoa(`${encodeURIComponent(clientId)}:${encodeURIComponent(clientSecret)}`),
...
```

## v2.2.0 -> v2.3.0
- `AWS_REGION` variable must now be provided in the environment for the SES driver

## v2.1.0 -> v2.2.0
- `NODE_ENV` variable must now be provided in the environment

## v2.0.0 -> v2.1.0
- You _must_ run migrations before deploying the new oidc code. If you haven't yet deployed v2.0.0 then you should update to v2.0.0 first before updating to v2.1.0. The migrations in 2.1 will break your app if it's < 2.0.
- app_name is no longer allowed in the body of the invite and reinvite endpoints. The client's `client_name` value will be used instead.
- If your app uses the `/user/logout` url to initiate logouts from your client then you must set the `CLIENT_INITIATED_LOGOUT` environment variable to 'true'. If you don't your logout link will return a 404. More information in the [Installation Guide](docs/installation.md#app-config)
- You must set the `ENABLE_USER_REGISTRATION` environment variable to 'true' if you want your users to be able to user the /user/registration url
- You must set the `OIDC_PAIRWISE_SALT` environment variable to a random cryptographically secure salt. More information in the [Installation Guide](docs/installation.md#app-config)
- Change password:
  - Introduces `change-password` screen and `change-password-success-email` email templates
  - Link to change password form: `${oidcServer}/user/password?client_id=${clientId}&redirect_uri=${redirectUri}`
- Email settings:
  - Introduces `email-settings` and `email-verify-success` screens and `email-verify-email`, `change-email-verify-email`, and `change-email-alert-email` emails.
  - Link to email settings screen: `${oidcServer}/user/email-settings?client_id=${clientId}&redirect_uri=${redirectUri}`


## v1.4.0 -> v2.0.0

- The `/api/invite` and `/api/resent-invite/{userId}`endpoints now requires a `response_type` in the POST body. Please provide one of the response type values you have configured for your client.
- Update your keystore file to contain only the certificates keystore. JSON goes from `{certificates: /*certificates keystore json object*/, integrity: /*integrity keystore json object*/}` to just this `/*certificates keystore json object*/`.
- You _must_ run migrations before deploying the new oidc code.
- You must not provide the access token when linking a user to the edit profile page. The url will now look like this: `{oidc-domain}/user/profile?client_id={clientId}&redirect_uri={redirectUri}`

## v2.0.0 -> v2.6.0
- You must set the `ENABLE_USER_SESSION_TRACKING` environment variable to 'true' if you want your users to be able to use the /user/invalidate-user-sessions url
