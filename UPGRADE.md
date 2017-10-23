# UPGRADE GUIDE

## v2.0.0 -> v2.1.0
- You _must_ run migrations before deploying the new oidc code. If you haven't yet deployed v2.0.0 then you should update to v2.0.0 first before updating to v2.1.0. The migrations in 2.1 will break your app if it's < 2.0.
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
