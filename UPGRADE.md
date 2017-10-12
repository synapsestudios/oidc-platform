# UPGRADE GUIDE

## v1.4.0 -> v2.0.0

- The `/api/invite` and `/api/resent-invite/{userId}`endpoints now requires a `response_type` in the POST body. Please provide one of the response type values you have configured for your client.
- Update your keystore file to contain only the certificates keystore. JSON goes from `{certificates: /*certificates keystore json object*/, integrity: /*integrity keystore json object*/}` to just this `/*certificates keystore json object*/`.
- You _must_ run migrations before deploying the new oidc code.
