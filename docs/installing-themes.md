# Installing Themes and Templates

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
| change-password         | The change password form |
| change-password-success-email | The email that alerts users that their password has changed |
| email-settings | The email settings screen |
| email-verify-success | The success screen users see after clicking the verify link from their email |
| email-verify-email | The email address verification email |
| change-email-verify-email | The email sent to the new address with a verify link after the user changes their email |
| change-email-alert-email | The eamil sent to the old address with an alert that the user's email has changed |

##### Options

For each template record in the `SIP_template` table there is an `options` json field. The only thing this is currently used for is that if you set this to `{"subject":"hello"}` on an email template then the subject from your options object will be used when sending the email.

### Layout

Layouts are the wrapping html that themplates are rendered into. Create a new layout by inserting a record into the `SIP_layout` table with a `name` and `code`. The code field should be a string that will be compiled using the handlebars templating engine. Update template records by setting their `layout_id` field in order to use your new layout.