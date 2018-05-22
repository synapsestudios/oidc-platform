# Implementation Guide

Once you've gone through the [Installation](installation.md) you're ready for Implementation! Following the steps and instructions in this implementation guide will walk you through what it takes to make use of the platform in your apps and assumes that you have a fully functional installation of the OIDC Platform.

- [Clients](#clients)
  - [Creating a client](#creating-a-client)
    - [Request](#request)
    - [Response](#response)
    - [Important client values](#important-client-values)
- [Creating Users](#creating-users)
  - [Inviting Users](#inviting-users)
  - [User Registration](#user-registration)
- [Logging your users in and getting tokens](#logging-your-users-in-and-getting-tokens)
  - [Authorization workflow](#authorization-workflow)
  - [Implicit workflow](#implicit-workflow)
  - [Client Credentials](#client-credentials)
- [Logging your users out](#logging-your-users-out)
  - [Log them out of just your app](#log-them-out-of-just-your-app)
  - [Log them out of the OIDC provider explicitly](#log-them-out-of-the-oidc-provider-explicitly)
  - [Log them out of the OIDC provider implicitly](#log-them-out-of-the-oidc-provider-implicitly)

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
    "redirect_uris": ["https://sso-client.test:3000/"],
    "post_logout_redirect_uris": ["https://sso-client.test:3000/logout"]
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
    "https://sso-client.test:3000/logout"
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
    "https://sso-client.test:3000/"
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

When a client application redirects their user to the login screen the client application will include a "response_type" string in the query parameters. The client for that application must be configured explicitly to allow that response_type. Response types can be `code`, `id_token`, `token` OR a [Multiple-Valued Response Type](http://openid.net/specs/oauth-v2-multiple-response-types-1_0.html#Combination).

##### grant_types

A good guide for OAuth 2.0 grant types can be found [here](https://alexbilbie.com/guide-to-oauth-2-grants/). That guide defines grants like this

> The OAuth 2.0 specification is a flexible authorization framework that describes a number of grants (“methods”) for a client application to acquire an access token (which represents a user’s permission for the client to access their data) which can be used to authenticate a request to an API endpoint.

Your client application will tell the OIDC Provider the provider which workflow you're going to use by specifying the grant type and the response_types. The authorization_code grant type is the typical OAuth workflow which requires you to have a server that keeps your client secret, the implicit grant type is for things like mobile apps and single page web apps that can't keep a secret. Those will be the most used, but there are others described in the above guide.

##### post_logout_redirect_uris

The `post_logout_redirect_uris` key is defined by the [OpenID Connect Session Management](http://openid.net/specs/openid-connect-session-1_0-28.html). When configuring your client you should provide a post_logout_redirect_uri if you plan to use any of the logout features that will log your user out of both your app AND the OIDC Platform. Performing a logout is covered in the Logging your users out section of this document.

## Creating Users

Methods for creating users is not defined by the OpenID Connect specification. All user creation is done by the OIDC Platform.

### Inviting Users

The OIDC Platform provides an endpoint that will invite your user to create an account. The invite workflow looks like this:

1. Your application POSTs to the invite endpoint with your new users email address (plus some more information needed to get this user back to your application)
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

When your user has successfully created their account and logged in they will be redirected back to your application. You can then use the OIDC Provider api coupled with the usrs access token to get that users profile information.

## Logging your users in and getting tokens

This is where the rubber hits the road. Once you have a Client configured and your users have been invited or registered then your application will be able to use the OIDC Platform to verify their identity. The OIDC Platform will authenticate the user (your app doesn't have to handle passwords) and give your app an [id token](http://openid.net/specs/openid-connect-core-1_0.html#IDToken) in the form of a [jwt](https://jwt.io/). Your app then can use that JWT to validate the users making requests to your application are indeed authenticated valid users.

OpenID Connect uses the old familiar OAuth 2.0 login workflows. You should pick one or more workflow for your application based on whether or not your app lives on a server that is capable of keeping secrets or if your app is distributed to untrusted client machines that should not be given your client secret.

### Authorization workflow

The authorization workflow is what people think of when they think OAuth. You should use the authorization code if your application can keep secrets since you will need to use your client secret to get an id token. Please see the [OpenID specification](http://openid.net/specs/openid-connect-core-1_0.html#CodeFlowAuth) for more detail.
1. Your app links the user away to the login form
2. the OIDC Platform sends them back to your application with an authorization code
3. You send the authorization code along with your client secret to the token endpoint in the OIDC Platform
4. The OIDC Platform sends back an id token (in the form of a JWT) and an access token. The access token is the traditional OAuth token and in many cases can be discarded. The id token is what your application will use to verify identity.
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

#### Example response for Authorization workflow

After your user has been authenticated by the OIDC Platform then they will be redirected back to the url that you specify in with redirect_uri.

```
${redirect_uri}
  ?code=NTJhY2U5NGQtOTQyMS00N2MwLWFjMTYtN2JhMjhmODlhY2Ux5UxOH5eb3zz2seRdBYoaAQJMxLsrGPy_LQsoL8-KiqkB4FZqYTXo1K2QzHodi4yGyMeMesTBJoLHf3e7EHqKZA
  &session_state=546bd29c230d6af5a9704cc46409effa133367f94dc480a96967367ce10b879c.cb44518fa5a9e0c4
```

#### Example token request

Once you've received an authorization code you can use that code to obtain an access token and an id token. The token endpoint uses Basic auth. Use your client id as the username and the client secret as the password.

```
POST /op/token
Host: ${providerDomain}
Content-Type: application/x-www-form-urlencoded
Authorization: Basic ${base64Encode(clientId:clientSecret)}
grant_type=authorization_code&code=MWYyOWEzMjctNTQxZi00ODYyLWFlZGUtMzlhZTZmOGZlZjEx1LhZa4qZwM89-M3egd0q-gZI9s_iCvsXJNPPQdsGQDWEWkOg3jgLMkwCqylly1pOE1ND_0MJ1zIjp12GGVKYSQ&redirect_uri=https%3A%2F%2Fsso-client.test%3A3000%2F
```

#### Example token response

```
{
  "access_token": "OWFjN2NmZGEtOTA1Mi00YzVlLWJjYWEtMmRhMzVjY2ZkMmU0qLpoxZYWAvYyheTh4rxnM_lhqK-5VqLLSFaSyjwxUQZDBh6CepgpYNGEF8NH8iMJfi7dedMkgeAr0QSNjfIBWg",
  "expires_in": 7200,
  "id_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InNpZy1ycy0wIn0.eyJzdWIiOiJiNmQ4ZmM5MC01ZGE2LTQwNzYtOTUyNC1iMDYxMjFmZDljZmQiLCJhcHBfbWV0YWRhdGEiOltdLCJub25jZSI6Im5vbmNlIiwiYXRfaGFzaCI6Imw2VDA4WTM1MTJYS2VKRVJpRUwxWFEiLCJpYXQiOjE1MDA1ODI1MTksImV4cCI6MTUwMDU4OTcxOSwiYXVkIjoiNWNkZDI5Y2YtNWJiYy00NGNmLWE1NDEtN2QwMzljOTg1MmUxIiwiaXNzIjoiaHR0cDovL2xvY2FsaG9zdDo5MDAwIn0.T6nnBs8JRkmBorusSfFjShH5A4ZVnPiDsVF1Y3mEhuf9afCw2XXSV3XRTcFaBGrLdyHKsDkQHI-mS0JWTGvEI_tn4AWpUzgNcAN6gO_oq29kUz1u53lSS2-6SM8M8QAEiKO8vZWMYXyaUPmUUt_6Q6pJlEv_FPLFM9_Ye7GVZ2j7-3FNJggfK0W3t85AY_nEb3wf5Vq1LkP6B1qkgUJP1UF4qEnE2hDT2a28aIGplfsIjrTz-3Em5-HqYAzcAJ1-uICla0D5_szuevoQ1kUDnaA1HwdEuFB2sTfxOO_hbjzOb7XOl1q6FyO3OThYF-PE4az7eNULO4UurFr9Q7BXzw",
  "token_type": "Bearer"
}
```

### Implicit workflow

The implicit workflow has fewer steps, but as a tradeoff you lose the ability for the OIDC Platform to authenticate the client. Typically you would use the implicit workflow for things like single page web applications or native applications. Please see the [OpenID specification](http://openid.net/specs/openid-connect-core-1_0.html#ImplicitFlowAuth) for more detail.
1. Your app links the user away to the login form
2. the OIDC Platform sends them back to your application with an id token and an access token.
3. Your application stores the JWT and allows the JWT to be used by the user to authenticate with your service

#### Example login link for Implicit workflow

```
${providerDomain}/op/auth
  ?client_id=${clientId}
  &response_type=id_token%20token
  &scope=${scope}
  &redirect_uri=${config.redirectUri}
  &nonce=nonce
```
- client_id: returned to you when you created your client
- response_type: tells the OIDC Platform to return an authorization code
- scope: [OAuth 2.0 scope](https://tools.ietf.org/html/rfc6749#section-3.3) values. You must at least include the "openid" scope. Other scopes are optional. The scopes defined by OpenID Connect are profile, email, address, phone, and offline_access
- redirect_uri: one of the redirect_uris allowed by the client you created
- nonce: this is meant to be a random string. The OIDC Provider will pass this back and you should make sure that the nonce you generated matches the nonce you receive from the OIDC Provider

#### Example response for Implicit workflow

After your user has been authenticated by the OIDC Platform then they will be redirected back to the url that you specify in with redirect_uri.

```
${redirect_uri}
  #id_token=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InNpZy1ycy0wIn0.eyJzdWIiOiJiNmQ4ZmM5MC01ZGE2LTQwNzYtOTUyNC1iMDYxMjFmZDljZmQiLCJhcHBfbWV0YWRhdGEiOltdLCJub25jZSI6Im5vbmNlIiwiYXRfaGFzaCI6IlNjdU9sSml2NmtEbnVYUmlfUU9lUlEiLCJpYXQiOjE1MDA1ODYxODksImV4cCI6MTUwMDU5MzM4OSwiYXVkIjoiNWNkZDI5Y2YtNWJiYy00NGNmLWE1NDEtN2QwMzljOTg1MmUxIiwiaXNzIjoiaHR0cDovL2xvY2FsaG9zdDo5MDAwIn0.iFD9mcANO5GGzjHz0zYQ_Jj-UePq3R6qATDEyHrvBFZn0iR5E4NoQw3M25QqNItoTK4FsJEX2eUDKQYIsj-6Esh1-hdSlMUNrtLg6in9eD_Ovk5FgR8uVo9XaEHgP4LQFLietYEU6aYIWE9c_sHNmBjds1ODnJdBi1BMTuDoulAiENArvT2pDjHXMmnzqSpJZmkoaJ8kT_9NErOGqJ5Fm3B5BAvX4iUDbVyNaLRHV9u0Lmc4grvE-pCQTXP7b4mWX_usLIUCOw7lcIJgI_ELhWdjMuAWY89WybPxIaqTzAeAftC0rlLJEOU5by7ydNCwDxkA1v24I0mnUYOd3HuidA
  &access_token=Nzc3NzA4YzktZDEyZC00OGFlLTkxYTAtNDNjYWUzNmMxY2Iw1NfIByCa1kfgWNApvdQ-dw1xWbuOB7mO3SAu7ybQPHxb0wQsW8aAT800MJMjR4_CxpZvvqVH7Hr61yG3cy9izQ
  &expires_in=7200
  &token_type=Bearer
  &session_state=fe4d8e6badb752671b9357ec17c160fb5045ac84e87d459507df748c9bc3434e.172e7a238010152b
```

### Client Credentials

The client credentials workflow is used whe your application is interacting with the authorization server's api, but is not acting on behalf of your users. It's a way for your client application to get an access token and make api calls without having to authenticate a user. [This guide](https://alexbilbie.com/guide-to-oauth-2-grants/) explains the client credentials grant well. If you're brave you can venture into the [OAuth 2.0](https://tools.ietf.org/html/rfc6749#section-4.4) spec for more detail.

It is a best practice to not allow the client credentials grant for clients that end users will be using. Instead set up a separate client in the OIDC Platform for your system to use.

#### Example token request

Calling the token endpoint this way will return an access token, but will not return an id token. The access token is what you will use for machine-to-machine calls with theh OIDC Provider.

```
POST /op/token
Host: ${providerDomain}
Content-Type: application/x-www-form-urlencoded
Authorization: Basic ${base64Encode(clientId:clientSecret)}
grant_type=client_credentials&scope=admin
```

### Password Grant

The password grant is used when an application is logging in on behalf of the user _without_ using any of the redirect workflows. This method requires your client app to collect the user's username and password and pass that along to the token endpoint which of course has security implications. You should only use the password grant if the client app is controlled by you or is otherwise trusted. Make sure to use HTTPS to issue this request.

#### Example token request

```
POST /op/token
Host: ${providerDomain}
Content-Type: application/x-www-form-urlencoded
Authorization: Basic ${base64Encode(clientId:clientSecret)}
grant_type=password&username=${username}&password={password}
```

### Refresh Token

TODO

### Resource Owner

TODO

## Using the id token for authentication

Once you have your id token your application must verify that the token is valid. The id token is a JWT so that you don't have to store it on your backend. You can keep it in your users' local storage, or cookies, or anything else client-side. When the user makes api calls to your application they should pass the JWT along and you can verify that the JWT is legitimate.

During [Installation](installation.md) you will have created a keystores.json file. This file contains all of the keys that are used to encrypt and decrypt the id tokens. You should make these keys available to your application so that it can verify the JWT. You _should never_ expose these keys to your users. They should live on your application servers but never in native/browser code.

Here is an example function using node that verifies the JWT using the keystores.json file:

```
const jose = require('node-jose');
const atob = require('atob');
const keystores = require('../path/to/keystore');
const keystore = jose.JWK.asKeyStore(keystores.certificates);

function verifyJWT(request) {
  const token = request.headers.authorization;
  const header = JSON.parse(atob(token.split('.')[0]));
  const key = keystore.get(header.kid);

  jose.JWS.createVerify(key).verify(token).then(verify => {
    // succesfully verified!
  })
    .catch(e => {
      // cannot verify
    });
}
```

The above snippet uses the `node-jose` package to interact with the keystore and to verify the validity of the JWT. [JOSE](http://jose.readthedocs.io/en/latest/) is the standard for Javascript Object Signing and Encryption. There are libraries in most languages for interacting with keys and tokens in this format. [jwt.io](https://jwt.io/) has a list of libraries for token signing/verification on the home page.

## Logging your users out

Sometimes they just want to leave. You should let them go.

### Log them out of just your app

When using the OIDC Platform it's important to realize that your users log into the platform and the platform maintains a session for them. If you application maintains a session, or uses stateless sessions with just the id token, you can effectively log your users out of your application by destroying your id token and ending your user's session in your application. Your app can then treat the user like they are not logged in.

If that user then attempts to log back in and your application redirects them to the OIDC Platform for authentication, the OIDC Platform MAY still have their session active from their previous authentication and redirect them right back to your application with access and/or id tokens without the user having to fill out the login form.

If this behavior is undesirable for your application see the next two sections.

### Log them out of the OIDC provider explicitly

If when your user logs out of your app you want to allow them to optionally log out of the OIDC service you can make use of the [OIDC Logout](http://openid.net/specs/openid-connect-session-1_0.html#RPLogout) which is defined in the OpenID Connect Session Management specification. This logout workflow works like this:

1. Your application redirects the user the the OIDC Platform's logout url (with some optional parameters)
1. The user is asked whether or not they want to log out of the OIDC Platform
1. After choosing, the user is (optionally) redirected back to your application

#### Example logout url

```
${providerDomain}op/session/end
  ?id_token_hint=${idToken}
  &post_logout_redirect_uri=${redirectUri}
```
- id_token_hint: your user's id token. The OIDC Provider can use this as a hint about the identity of the user that is logging out.
- post_logout_redirect_uri: where to send your user once they've logged out

### Log them out of the OIDC provider implicitly

There are cases where your application's end users will have no idea what the OIDC Platform even is. If, for example, you're installing the OIDC Platform to use with only a single application (instead of as an SSO service) then your user will rightly be confused when they logout of your application and then are presented with a screen asking them of they want to logout of some OpenID Connect service.

The implicit logout link will log the user out of the OIDC Platform without asking them and will redirect them back to your applicaiton.

#### Example logout url

```
${providerDomain}user/logout
  ?post_logout_redirect_uri=${postLogoutRedirectUri}

```

- post_logout_redirect_uri: where to send your user once they've been logged out
