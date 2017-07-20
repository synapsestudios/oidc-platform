# Implementation Guide

Once you've gone through the [Installation](installation.md) you're ready for Implementation! Following the steps and instructions in this implementation guide will walk you through what it takes to make use of the platform in your apps and assumes that you have a fully functional installation of the OIDC Platform.

## Clients

Clients are the applications that make use of the OIDC Platform for identity services. Before your application can use the platform you will need to create and configure a client for your application.

### Creating a client

Currently there is no user interface for managing clients. Clients can be registered dynamically with the registration api endpoint. Any of the [OpenID Client Metadata](http://openid.net/specs/openid-connect-registration-1_0.html#ClientMetadata) can be supplied. The Bearer token for this request is validated against the OIDC_INITIAL_ACCESS_TOKEN environment variable. YOU MUST PROVIDE A STRONG TOKEN in production to prevent unauthorized clients from being added.

Create a client by submitting a POST request to {yourServiceDomain}/op/reg with the following:

#### Request
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
    "client_credentials"
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

##### grant_types:
##### post_logout_redirect_uris:

## Creating Users

### Inviting Users

### User Registration

## Logging your users in and getting an authorization token

### Authorization workflow

### Implicit workflow

## Using the authentication token

## Logging your users out

### Log them out of just your app

### Log them out of the OIDC provider explicitly

### Log them out of the OIDC provider implicitly
