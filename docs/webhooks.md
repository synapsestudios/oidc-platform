# Webhooks

The Synapse OIDC Platform can communicate back to client applications for certain events. Clients will be expected to register a webhook (you can use the POST /webhook endpoint or just add them to the database). A webhook will be configured to be called when events are fired.

## The webhook POST request

When the OIDC server POSTs to your client application it will send a payload like this:

```
{
  event,      // string. The event that was fired
  webhook_id, // string. The id of the webhook
  timestamp,  // unix timestamp for when the webhook was triggered
  resource,   // the resource that triggered the webhook (user object, etc)
}
```

### Authentication

The POST request will have an `Authorization` header with a jwt bearer token. You should validate this jwt using the same methods as you validate users' id tokens. The difference is that the `aud` value of the jwt won't be a user id, but will be the client_id for the client that owns the webhook. Clients should validate that this client_id matches their own client_id.

## Webhook Events

| Event | Description |
| ----- | ----------- |
| user.update | Fired when user data changes |
| user.registered | Fired when a user is registered using the registration form at /user/register |
| user.accept-invite | Fired when an invite email is accepted (and the user has set their password) |