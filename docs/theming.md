# Theming

The theming system in the Synapse OIDC Provider is a robust way to provide a completely custom look and feel for the identity management screens and emails to match your app. Themes can be configured per client so your screens can look right for every app you use with the Synapse OIDC Provider.

Currently themes are only configurable by inserting records into the database directly.

## Create a theme

Create a theme by inserting a new record into the `SIP_theme` table. In order to make use of your new theme on a client update the `theme_id` field in the `SIP_client` table with the id of the new theme.

### Templates

Templates are the individual screens that can be created. To create a new template insert a record into the `SIP_template` table with a `theme_id`, `name` and `code`. The code field should be a string that will be compiled using the handlebars templating engine. If you create a theme and don't provide a template for a screen then the theming engine will default to using the default template for that screen.

#### Available screens
| name                    | Description                                                                        |
| ----------------------- | ---------------------------------------------------------------------------------- |
| forgot-password-email   | The email that is sent when a user completes the forgot password form successfully |
| invite-email            | The email that is sent when a new user is invited                                  |
| forgot-password-success | The success screen when a user completes the forgot password form                  |
| forgot-password         | The forgot password form                  |
| reset-password-success  | The success screen when a user completes the reset password form                   |
| reset-password          | The reset password form                                                            |
| user-profile            | The user profile edit form                                                         |
| user-registration       | The user registration form                                                         |
| login                   | The login form                                                                     |
| end_session             | The identity provider logout screen                                                |
| interaction             | Any other OIDC interactions                                                        |

##### Variables

Each template will receive the same variables as the [layout](#layout). In addition each template will be provided with unique values that can be used.

###### forgot-password-email
```
{
  url // the url used to build the link the user clicks to set their new password
}
```

###### forgot-password
```
{
  formAction, // url for the form to post to
  returnTo, // url to return the user to if they cancel
  error, // bool, true if there are errors
  validationErrorMessages, // errors formatted like { field: ['message', 'message2'] }
}
```

###### invite-email
```
{
  url, // the url used to build the link the user clicks to set their new password
  appName, // the name of the application the user is being invited to
}
```

###### forgot-password-success
```
{
  // nothing
}
```

###### reset-password-success
```
{
  // nothing
}
```

###### reset-password
```
{
  returnTo, // url to return the user to if they cancel
  error, // bool, true if there are errors
  validationErrorMessages, // errors formatted like { field: ['message', 'message2'] }
}
```

###### user-profile
```
{
  returnTo, // url to return the user to if they cancel
  fields, // array of field objects
}

/* example field object */
{
  name, // machine name of the field
  label, // human readable name of the field
  type, // input type, used in <input> tag
  value, // the value of the field, used in <input> tag

  isFile, // true if the field is a file upload
  accept, // mime types allowed if it's a file

  isDropdown, // true if the field is a dropdown
  options, // dropdown options formatted like [{ label, value, selected }]

  error, // validation errors formatted like ['message', 'message2']
}

/*
You'll receive a field object for each of these fields:
[
  'name',
  'given_name',
  'family_name',
  'middle_name',
  'nickname',
  'preferred_username',
  'profile',
  'picture',
  'website',
  'gender',
  'birthdate',
  'zoneinfo',
  'locale',
  'phone_number',
  'address.street_address',
  'address.locality',
  'address.region',
  'address.postal_code',
  'address.country',
]
*/
```

###### user-registration
```
{
  email, // the users email if available
  returnTo, // url to return the user to if they cancel
  error, // bool, true if there are errors
  validationErrorMessages, // errors formatted like { field: ['message', 'message2'] }
}
```

###### login
```
{
  forgotPasswordPath, // link to the forgot password form
  error, // string with an error message
}
```

###### end_session
```
{
  // nothing
}
```

###### interaction
```
{
  // nothing
}
```

### Layout

Layouts are the wrapping html that themplates are rendered into. Create a new layout by inserting a record into the `SIP_layout` table with a `name` and `code`. The code field should be a string that will be compiled using the handlebars templating engine. Update template records by setting their `layout_id` field in order to use your new layout.

#### Variables

```
{
  /* This is the client object from the oidc provider */
  /* may not be provided */
  client,

  /* This is the cookie object set by the oidc provider */
  /* may not be provided */
  cookie,

  title
}
```

##### Example Client Object

```
Client {
  applicationType: 'web',
  backchannelLogoutSessionRequired: undefined,
  grantTypes: [
    'authorization_code',
    'client_credentials',
    'implicit',
    'password'
  ],
  idTokenSignedResponseAlg: 'RS256',
  postLogoutRedirectUris: [ 'https://sso-client.dev:3000/logout' ],
  requestUris: [],
  requireAuthTime: false,
  responseTypes: [ 'code id_token token' ],
  subjectType: 'public',
  tokenEndpointAuthMethod: 'client_secret_basic',
  clientId: '25bb32fc-a9b4-4124-9b60-09961c5dcc28',
  clientIdIssuedAt: '1507572681',
  clientSecret: 'MCyKwnw0N8q172A8aALzdgCyuYtVBiDlJVG9/WgiVfZFhY8Eokslc1SBm7nyuaPn',
  clientSecretExpiresAt: '0',
  contacts: [],
  defaultAcrValues: [],
  redirectUris: [ 'https://sso-client.dev:3000/' ],
  introspectionEndpointAuthMethod: 'client_secret_basic',
  revocationEndpointAuthMethod: 'client_secret_basic',
  revocationEndpointAuthSigningAlg: undefined,
  introspectionEndpointAuthSigningAlg: undefined
}
```

##### Example Cookie Object

```
Session {
  returnTo: 'http://sso-client.dev:9000/op/auth/4e51909b-1b61-4795-92a4-ce4fe9ea5aeb',
  interaction: { error: 'login_required',
     error_description: 'End-User authentication is required',
     reason: 'no_session',
     reason_description: 'Please Sign-in to continue.'
  },
  uuid: '4e51909b-1b61-4795-92a4-ce4fe9ea5aeb',
  params: { acr_values: '',
     client_id: '25bb32fc-a9b4-4124-9b60-09961c5dcc28',
     nonce: 'nonce',
     redirect_uri: 'https://sso-client.dev:3000/',
     response_mode: 'fragment',
     response_type: 'code id_token token',
     scope: 'openid profile app_metadata'
  },
  id: '4e51909b-1b61-4795-92a4-ce4fe9ea5aeb'
}
```
