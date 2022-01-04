# Screens and Theming

The Synapse OIDC Provider has a number of user management related features in addition to managing user logins. We handle creating users and managing user data, as well. We provide a number of screens to facility all the different ways a user can be created and edit their data.

The theming system in the Synapse OIDC Provider is a robust way to provide a completely custom look and feel for the identity management screens and emails to match your app. Themes can be configured per client so your screens can look right for every app you use with the Synapse OIDC Provider.

Currently themes are only configurable by inserting records into the database directly.
- [Screens](#screens)
  - [Login](#login)
  - [Forgot Password](#forgot-password)
  - [Forgot Password Success](#forgot-password-success)
  - [Forgot Password Email](#forgot-password-email)
  - [Reset Password](#reset-password)
  - [Reset Password Success](#reset-password-success)
  - [User Registration](#user-registration)
  - [Invite Email](#invite-email)
  - [User Profile](#user-profile)
  - [Change Password](#change-password)
  - [Change Password Success Email](#change-password-success-email)
  - [Email Settings](#email-settings)
  - [Email Verify Email](#email-verify-email)
  - [Email Verify Success](#email-verify-success)
  - [Change Email Verify Email](#change-email-verify-email)
  - [Change Email Alert Email](#change-email-alert-email)
  - [End Session](#end-session)
  - [Interaction](#interaction)
  - [Layout](#layout)

## Screens

### Login

#### Use case
This is the screen our users see most. On this screen we ask for a user name (or email) and a password. We also show an error if they enter the wrong user name or password. We show the same error in both cases for security purposes.

From this screen we can also link to the forgot password form, which will allow a user to recover their account with an email verification step.
Optionally we can show a "register" link, too. Some applications will allow users to register accounts, and some won't. For the ones that do, the register link will be provided on this screen.

#### Variables
```
{
  forgotPasswordPath, // link to the forgot password form
  error, // bool, true if there are errors
  validationErrorMessages, // errors formatted like { field: ['message', 'message2'] }
}
```

### Forgot Password

#### Use case
User forgot their password ;)
This is the start of the standard "forgot password" workflow. A user will input an email address, and we will send them a password recover email.
Users can arrive here either as a link from the login screen _or_ they can be directly linked here from your application.

From this screen we can also link back to the login screen, or back to your app.

#### Variables
```
{
  loginUrl, // url for the login page
  formAction, // action value for the form
  returnTo, // url to return the user to if they cancel
  error, // bool, true if there are errors
  validationErrorMessages, // errors formatted like { field: ['message', 'message2'] }
}
```

### Forgot Password Success
#### Use Case

The user is shown this screen after they've submitted the forgot password form. This screen should instruct the user to check their email to complete the password recovery process. For security purposes, the success screen is shown even when we don't find a matching email address.

From this screen we can include a link to send the user back to the login screen.
#### Variables
```
{
  loginUrl, // url for the login page
}
```

### Forgot Password Email
#### Use Case
This email is sent to the user after successfully submitting the forgot password form. This email is only sent when the email submitted by the user matches an existing OIDC user.

The email should alert the user that they should follow the link to reset their password.
#### Variables
```
{
  loginUrl, // url for the login page
}
```

### Reset Password
#### Use Case
If a user clicks the link in their forgot password email they will end up here. This is a form that asks for them to create a new password! This form is a standard password form and asks for the user to input their new password twice. If either password field is left blank or if the two password fields don't match then there this screen will reload and the `error` variable will be true, and there will be some validation messages in the `validationErrorMessages` variable.

#### Variables
```
{
  returnTo, // url to return the user to if they cancel
  error, // bool, true if there are errors
  validationErrorMessages, // errors formatted like { field: ['message', 'message2'] }
}
```

### Reset Password Success
#### Use Case
This is the screen we show a user after they have successfully reset their password. This screen will contain a link to the login screen so the user can make use of their new password.

#### Variables
```
{
  title, // A suggested title for the page
  loginUrl, // url for the login page
}
```

### User Registration
#### Use Case
If enabled, users will be able to use this screen to sign up for your app.
This screen asks for a user's email address and asks them to create a password. They must enter the password twice.
Errors are shown if any field is left blank, the email is already in use, or if the two password fields don't match.

#### Variables
```
{
  email, // the users email if available
  returnTo, // url to return the user to if they cancel
  error, // bool, true if there are errors
  validationErrorMessages, // errors formatted like { field: ['message', 'message2'] }
}
```

### Invite Email
#### Use Case
If you prefer, you can build your application so that users are invited. This is usually preferred when access to an application should be restricted to people who belong to certain organizations. When a user is invited they will receive this email and it will contain a link to the reset password screen, where the user will be prompted to create a new password.

#### Variables
```
{
  url, // the url used to build the link the user clicks to set their new password
  appName, // the name of the application the user is being invited to
}
```

### User Profile
#### Use Case
This screen allows users to manage their profile data. Profile data typically consists of First and last names, telephone numbers, a profile picture, and other similar things.
We provide you with a big list of possible profile fields that you can use that are listed below. When you implement this screen you can pick and choose which fields you want to use. If you don't care about "phone_number" then just leave out that field from your form. The default template that we provide for this screen implements all possible profile fields.

In addition to editing profile data this screen provides links to two other screens: they Change Password screen and the Email Settings screen.
The only way to get to the User Profile screen is to link a user there directly from your app, or if a user is on the Change Password or Email Settings screens and hits "back".

#### Variables
```
{
  changePassUrl, // url to the change password screen
  emailSettingsUrl, // url to the email settings screen
  title, // a suggested title for this page
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

### Change Password
#### Use Cases
Users visit this screen when they want to set a new password. The form will prompt for their current password and then they must input their new password twice.
Users can be linked to this page from your app or from the user profile

#### Variables
```
{
  formAction, // url the form will post to
  returnTo, // url to return the user to if they cancel
  error, // bool, true if there are errors
  validationErrorMessages, // errors formatted like { field: ['message', 'message2'] }
}
```

### Change Password Success Email
#### Use Cases
This email is sent to the user to let them know that their password has changed. It's a security measure that will alert users in the case that their account's password was changed without them knowing. It should include language like "If you did not change your password please contact administrators and let them know that your account has been compromised".

#### Variables
```
{
  appName, // the name of the client application
}
```

### Email Settings
### Use Cases
The email settings screen allows the user to do one of four things:
1. Change their email address
1. Resend a verification email to their current address (if unverified)
1. Resend a verification email to their new pending address
1. Cancel a pending email change

### Variables
```
{
  formAction, // the url the forms should post to
  email, // user's current email
  emailVerified, // bool indicating whether or not the user has verified their email address
  pendingEmail, // the user's new email. only shown if they haven't yet verified the new email
  success, // bool indicating whether one of the forms was successfully submitted
  successMessage, // A message to show the user when one of the form actions succeeds
  returnTo, // url to return the user to if they cancel
  error, // bool, true if there are errors
  validationErrorMessages, // errors formatted like { field: ['message', 'message2'] }
}
```

### Email Verify Email
#### Use Cases
This email is sent after a user clicks the "verify email" link on their email settings screen. It provides a link that the user must click to verify that they received the email.

#### Variables
```
{
  appName, // client application name
  url, // the verification url
}
```

### Email Verify Success
#### Use Cases
This screen is shown after clicking a email verification link from their email.

#### Variables
```
{
  returnTo, // url to return the user to if they cancel
  validationErrorMessages, // errors formatted like { field: ['message', 'message2'] }
}
```

### Change Email Verify Email
#### Use Cases
This email is sent to the user after changing their email. It should contain a link that will allow the user to verify their email address.

#### Variables
```
{
  appName, // client application name
  url, // the verification url
}
```

### Change Email Alert Email
#### Use Cases
This email is sent to a user's _old_ email after they change their email address. This email is sent for security purposes to alert the user that their email has been changed, and it should contain language like "if you changed your email then you can disregard this message, otherwise you should alert administrators that your account has been compromised".

#### Variables
```
{
  appName, // client application name
}
```

### End Session
#### Use Cases
This screen can be used when the oidc platform is being used as a single sign on service or as an identity provider to a third party. This screen will prompt the user to log out not just from your app, but from the oidc service as a whole. If your users don't know what the oidc server is then they should never be shown this screen.

#### Variables
```
{
  form, // An html form with a hidden input. submit this form to log out your user
}
```

### Interaction
#### Use Cases
This screen will be shown to users when we're using the OIDC server as for single sign on or as an identity provider to a third party service. This screen is shown when the user needs to perform some interaction to complete authentication, usuallly in the form of granting permissions to the third party for access to do things on their behalf.


### Layout
#### Use Cases
The layout screen is the wrapper html around your other screens and can be used for common headers, footers and styles. You can have as many layouts as you want, you could even have one layout per screen if you wanted.

#### Variables

```
{
  /* This is the client object from the oidc provider */
  client,

  /* This is the cookie object set by the oidc provider */
  /* only provided for login and interaction screens */
  cookie,

  /* This is the user object */
  /* not provided when the user isn't logged in yet */
  user,

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
  postLogoutRedirectUris: [ 'https://sso-client.test:3000/logout' ],
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
  redirectUris: [ 'https://sso-client.test:3000/' ],
  introspectionEndpointAuthMethod: 'client_secret_basic',
  revocationEndpointAuthMethod: 'client_secret_basic',
  revocationEndpointAuthSigningAlg: undefined,
  introspectionEndpointAuthSigningAlg: undefined
}
```

##### Example User Object
```
{
  id: 'e0746f3a-9625-4ee3-99e3-7d72ac1bc79a',
  email: 'aaron+user@something.com',
  profile: { email_verified: false, phone_number_verified: false },
  app_metadata: [],
  email_lower: 'aaron+user@something.com',
  pending_email: null,
  pending_email_lower: null
}
```

##### Example Cookie Object

```
Session {
  returnTo: 'http://sso-client.test:9000/op/auth/4e51909b-1b61-4795-92a4-ce4fe9ea5aeb',
  interaction: { error: 'login_required',
     error_description: 'End-User authentication is required',
     reason: 'no_session',
     reason_description: 'Please Sign-in to continue.'
  },
  uuid: '4e51909b-1b61-4795-92a4-ce4fe9ea5aeb',
  params: { acr_values: '',
     client_id: '25bb32fc-a9b4-4124-9b60-09961c5dcc28',
     nonce: 'nonce',
     redirect_uri: 'https://sso-client.test:3000/',
     response_mode: 'fragment',
     response_type: 'code id_token token',
     scope: 'openid profile app_metadata'
  },
  id: '4e51909b-1b61-4795-92a4-ce4fe9ea5aeb'
}
```



