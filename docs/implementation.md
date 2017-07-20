# Implementation Guide

Once you've gone through the [Installation](installation.md) you're ready for Implementation! Following the steps and instructions in this implementation guide will walk you through what it takes to make use of the platform in your apps and assumes that you have a fully functional installation of the OIDC Platform.

## Clients

Clients are the applications that make use of the OIDC Platform for identity services. Before your application can use the platform you will need to create and configure a client for your application.

### Creating a client

Currently there is no user interface for managing clients. Clients can be registered dynamically with the registration api endpoint. Any of the [OpenID Client Metadata](http://openid.net/specs/openid-connect-registration-1_0.html#ClientMetadata) can be supplied. The Bearer token for this request is validated against the OIDC_INITIAL_ACCESS_TOKEN environment variable. YOU MUST PROVIDE A STRONG TOKEN in production to prevent unauthorized clients from being added.

#### Request

Create a client by submitting a POST request to {yourServiceDomain}/op/reg with the following:

```
Headers:
{
    "Content-Type": "application/json",
    "Authorization": "Bearer {OIDC_INITIAL_ACCESS_TOKEN}",
}

Body:
{
    "response_types": [
      "code",
      "code id_token token"
    ],
    "grant_types": [
        "authorization_code",
        "implicit",
        "client_credentials"
    ],
    "redirect_uris": ["https://sso-client.dev:3000/"],
    "post_logout_redirect_uris": ["https://sso-client.dev:3000/logout"]
}
```

#### Response
```
{
  "application_type": "web",
  "grant_types": [
    "authorization_code",
    "implicit",
    "client_credentials",
    "refresh_token",
    "password",
  ],
  "id_token_signed_response_alg": "RS256",
  "post_logout_redirect_uris": [
    "https://sso-client.dev:3000/logout"
  ],
  "require_auth_time": false,
  "response_types": [
    "code id_token token"
  ],
  "subject_type": "public",
  "token_endpoint_auth_method": "client_secret_basic",
  "client_id": "e5b9a7f5-bd1f-4aef-9c84-7f50e65b1f85",
  "client_id_issued_at": 1496875106,
  "client_secret": "GRHH1fv71Fwngqv3gOc0zo479rNp37n3Acud2dXLC6oIUGazTcHktYJDVELtrqJ1",
  "client_secret_expires_at": 0,
  "redirect_uris": [
    "https://sso-client.dev:3000/"
  ],
  "registration_client_uri": "http://localhost:9000/op/reg/e5b9a7f5-bd1f-4aef-9c84-7f50e65b1f85",
  "registration_access_token": "ZjJlMjM2YmQtMzEwMy00NjMyLTg0MDctNDRiNzU0ZWU0NjE0s9qhQMTo92KhQ5KGeAMTsj4Y7IzWCvYNMFBjLc9UkAve4VRb7gyNQwmnlk1zSMD4qCc-prl0QrdEWAY4LhFyQg"
}
```

#### Important client values

All the client metadata can be found documented more completely in the OIDC spec [here](http://openid.net/specs/openid-connect-registration-1_0.html#ClientMetadata). Here is a brief explanation of the most important ones that hopefully will keep you from having to dig around too much in the spec.

##### redirect_uris

This is a JSON array of uris that the OIDC Platform will be allowed to return your users to. Your app will tell the OIDC Provider which of these uris to use when redirecting users back to your app after login. If it doesn't match one of these values _exactly_ then your user will not be allowed to login at all.

##### response_types

When a client application redirects their user to the login screen the client applictation will include a "response_type" string in the query parameters. The client for that application must be configured explicitly to allow that response_type. Response types can be `code`, `id_token`, `token` OR a [Multiple-Valued Response Type](http://openid.net/specs/oauth-v2-multiple-response-types-1_0.html#Combination).

##### grant_types

A good guide for OAuth 2.0 grant types can be found [here](https://alexbilbie.com/guide-to-oauth-2-grants/). That guide defines grants like this

> The OAuth 2.0 specification is a flexibile authorization framework that describes a number of grants (“methods”) for a client application to acquire an access token (which represents a user’s permission for the client to access their data) which can be used to authenticate a request to an API endpoint.

Your client application will tell the OIDC Provider the provider which workflow you're going to use by specifying the grant type and the response_types. The authorization_code grant type is the typical OAuth workflow which requires you to have a server that keeps your client secret, the implicit grant type is for things like mobile apps and single page web apps that can't keep a secret. Those will be the most used, but there are others described in the above guide.

##### post_logout_redirect_uris

The `post_logout_redirect_uris` key is defined by the [OpenID Connect Session Management](http://openid.net/specs/openid-connect-session-1_0-28.html). When configuring your client you should provide a post_logout_redirect_uri if you plan to use any of the logout features that will log your user out of both your app AND the OIDC Platform. Performing a logout is covered in the Logging your users out section of this document.

## Creating Users

Methods for creating users is not defined by the OpenID Connect specification. All user creation is done by the OIDC Platform.

### Inviting Users

The OIDC Platform provides an endpoint that will invite your user to create an account. The invite workflow looks like this:

1. Your application POSTs to the invite endpoing with your new users email address (plus some more information needed to get this user back to your application)
1. The OIDC Platform sends an email to your user with a link that allows them to click into the OIDC Platform
1. The user follows the link and is prompted to create a password
1. Once the user's password is created they are redirected the login screen
1. If the user logs in they will be redirected back to your application (to the redirect_url you specified when POSTing the invite)

You will also be able to trigger reinvites for users that have not yet responded to their original invite.

### User Registration

If your users are allowed to create their own accounts then you can send your users to a register url to fill out a form that will create their user. nclude a Register link on your site that looks like this:

```
${providerDomain}/user/register
  ?client_id=${clientId}
  &response_type=${responseType}
  &scope=${scope}
  &redirect_uri=${config.redirectUri}
  &nonce=${nonce}
```

When your user has successfully created their account and logged in they will be redirected back to your application. You can then use the OIDC Provider api coupled with the usrs authorization token to get that users profile information.

## Logging your users in and getting an authorization token

This is where the rubber hits the road. Once you have a Client configured and your users have been invited or registered then your application will be able to use the OIDC Platform to verify their identity. The OIDC Platform will authenticate the user (your app doesn't have to handle passwords) and give your app an access token in the form of a [jwt](https://jwt.io/). Your app then can use that JWT to validate the users making requests to your application are indead authenticated valid users.

OpenID Connect uses the old familiar OAuth 2.0 login workflows. You should pick one or more workflow for your application based on whether or not your app lives on a server that is capable of keeping secrets or if your app is distributed to untrusted client machines that should not be given your client secret.

### Authorization workflow

The authorization workflow is what people think of when they think OAuth. Please see the [OpenID specification](http://openid.net/specs/openid-connect-core-1_0.html#CodeFlowAuth) for more detail.
1. Your app links the user away to the login form
2. the OIDC Platform sends them back to your application with an authorization code
3. You send the authorization code along with your client secret to the token endpoint in the OIDC Platform
4. The OIDC Platform sends back an access token (in the form of a JWT)
5. Your application stores the JWT and allows the JWT to be used by the user to authenticate with your service

#### Example login link for Authorization workflow
```
${providerDomain}/op/auth
  ?client_id=${clientId}
  &response_type=code
  &scope=${scope}
  &redirect_uri=${config.redirectUri}
  &nonce=nonce
```
- client_id: returned to you when you created your client
- response_type: tells the OIDC Platform to return an authorization code
- scope: [OAuth 2.0 scope](https://tools.ietf.org/html/rfc6749#section-3.3) values. You must at least include the "openid" scope. Other scopes are optional. The scopes defined by OpenID Connect are profile, email, address, phone, and offline_access
- redirect_uri: one of the redirect_uris allowed by the client you created
- nonce: this is meant to be a random string. The OIDC Provider will pass this back and you should make sure that the nonce you generated matches the nonce you receive from the OIDC Provider

### Implicit workflow

### Client Credentials

### Refresh Token

TODO

### Resource Owner

TODO

## Using the authentication token

## Logging your users out

### Log them out of just your app

### Log them out of the OIDC provider explicitly

### Log them out of the OIDC provider implicitly
