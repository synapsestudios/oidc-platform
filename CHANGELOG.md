## [v2.11.1](https://github.com/synapsestudios/oidc-platform/compare/v2.11.0...v2.11.1)
### Fixed
- [#544](https://github.com/synapsestudios/oidc-platform/issues/544) user.accept-invite webhook not being called

## [v2.11.0](https://github.com/synapsestudios/oidc-platform/compare/v2.10.0...v2.11.0)
### Added
- [#445](https://github.com/synapsestudios/oidc-platform/issues/439) Edit User Profile route for Admins. Added Lab tests.

## [v2.10.0](https://github.com/synapsestudios/oidc-platform/compare/v2.9.1...v2.10.0)
### Added
- [#449](https://github.com/synapsestudios/oidc-platform/issues/449) Add user.accept-invite webhook

## [v2.9.1](https://github.com/synapsestudios/oidc-platform/compare/v2.9.0...v2.9.1)
### Added
- [#439](https://github.com/synapsestudios/oidc-platform/issues/439) Add `ifEq` and `ifStartsWith` to Handlebars renderer
- [#437](https://github.com/synapsestudios/oidc-platform/issues/437) Add full `debug` to error template context

### Bugs Fixed
- [#432](https://github.com/synapsestudios/oidc-platform/issues/432) Error template assumes `production` is false

## [v2.9.0](https://github.com/synapsestudios/oidc-platform/compare/v2.8.0...v2.9.0)
### Added
- [#421](https://github.com/synapsestudios/oidc-platform/issues/421) Don't create new urls for updated profile pictures, use `path/to/image/${userId}`.

## [v2.8.0](https://github.com/synapsestudios/oidc-platform/compare/v2.7.1...v2.8.0)
### Added
- [#196](https://github.com/synapsestudios/oidc-platform/issues/196) Added system templates and a new error page template
- [#405](https://github.com/synapsestudios/oidc-platform/issues/405) Password grant now returns refresh tokens
- [#417](https://github.com/synapsestudios/oidc-platform/issues/417) Create a user without sending an invite email
- [#376](https://github.com/synapsestudios/oidc-platform/issues/376) Update a user's profile with an api call
- [#365](https://github.com/synapsestudios/oidc-platform/issues/365) Allow the use of the access token to validate users for profile and settings screens

### Bugs Fixed
- [#384](https://github.com/synapsestudios/oidc-platform/issues/384) Don't wipe out profile images when submitting profile form

## [v2.7.1](https://github.com/synapsestudios/oidc-platform/compare/v2.7.0...v2.7.1) - 2010-01-08
### Added
- [#368](https://github.com/synapsestudios/oidc-platform/issues/368) Updated the dev ssl cert to use new CA

## [v2.7.0](https://github.com/synapsestudios/oidc-platform/compare/v2.6.0...v2.7.0) - 2018-09-07
### Added

- [#353](https://github.com/synapsestudios/oidc-platform/issues/355) Add api endpoint for triggering forgot password
- [#354](https://github.com/synapsestudios/oidc-platform/issues/354) Allow `getUsers` endpoint to accept wildcard values
- [#355](https://github.com/synapsestudios/oidc-platform/issues/355) Add rules for `superadmin` client/scope
- [#356](https://github.com/synapsestudios/oidc-platform/issues/356) Add superadmin-only endpoint for setting a users email address

## [v2.6.0](https://github.com/synapsestudios/oidc-platform/compare/v2.5.0...v2.6.0) - 2018-08-15
### Added
- [#305](https://github.com/synapsestudios/oidc-platform/issues/305) From address overriding for themes

## [v2.5.0](https://github.com/synapsestudios/oidc-platform/compare/v2.4.0...v2.5.0) - 2018-07-13
### Added
- [#329](https://github.com/synapsestudios/oidc-platform/issues/329) Session Recovery

## [v2.4.0](https://github.com/synapsestudios/oidc-platform/compare/v2.3.2...v2.4.0) - 2018-06-29
### Added
- [#104](https://github.com/synapsestudios/oidc-platform/issues/104) Add "Return to Login" option on Forgot Password Success view

## [v2.3.2](https://github.com/synapsestudios/oidc-platform/compare/v2.3.1...v2.3.2) - 2018-06-27
### Added
- [#313](https://github.com/synapsestudios/oidc-platform/issues/313) Un-restrict profile field information on POST route
- [#315](https://github.com/synapsestudios/oidc-platform/issues/315) Send User Verification Email Endpoint
- [#317](https://github.com/synapsestudios/oidc-platform/issues/317) Allow overriding the subject on the invitation email

## [v2.3.1](https://github.com/synapsestudios/oidc-platform/compare/v2.3.0...v2.3.1) - 2018-06-01
### Fixed
- [#308](https://github.com/synapsestudios/oidc-platform/issues/308) Sentry logger not reporting environment

## [v2.3.0](https://github.com/synapsestudios/oidc-platform/compare/v2.2.0...v2.3.0) - 2018-05-21
### Added
- [#278](https://github.com/synapsestudios/oidc-platform/issues/278) Rollbar and Sentry support
- [#296](https://github.com/synapsestudios/oidc-platform/issues/296) Rejected promise if email whitelist misconfigured
- [#292](https://github.com/synapsestudios/oidc-platform/issues/292) Ability to use different AWS regions for SES
- [#273](https://github.com/synapsestudios/oidc-platform/issues/273) Cookie validation
- [#290](https://github.com/synapsestudios/oidc-platform/issues/290) Certificate for localhost.test
- [#280](https://github.com/synapsestudios/oidc-platform/issues/280) Sentry and rollbar documentation
- [#268](https://github.com/synapsestudios/oidc-platform/issues/268) Warning when using default keystore
### Changed
- [#266](https://github.com/synapsestudios/oidc-platform/issues/266) Replace moment with date-fns
- [#269](https://github.com/synapsestudios/oidc-platform/issues/269) All logging to use Winston
### Fixed
- [#286](https://github.com/synapsestudios/oidc-platform/issues/286) Error resetting password
- [#287](https://github.com/synapsestudios/oidc-platform/issues/287) Error address field clearing on failed logins
- [#295](https://github.com/synapsestudios/oidc-platform/issues/295) Case sensitive email whitelist
- [#64](https://github.com/synapsestudios/oidc-platform/issues/64) Discovery endpoints
- [#228](https://github.com/synapsestudios/oidc-platform/issues/228) 500 error when using canceled email verification link
- [#274](https://github.com/synapsestudios/oidc-platform/issues/274) 500 error when using invalid client_id

## [v2.2.0](https://github.com/synapsestudios/oidc-platform/compare/v2.1.2...v2.2.0) - 2018-03-2
### Added
- [#254](https://github.com/synapsestudios/oidc-platform/pull/254) Add Redis port to common.env and documentation
- [#251](https://github.com/synapsestudios/oidc-platform/issues/251) Add ability to delete profile picture
- [#240](https://github.com/synapsestudios/oidc-platform/issues/240) Add self signed SSL certificates to dev environment
- [#227](https://github.com/synapsestudios/oidc-platform/pull/227) Add helpful logs and exits
### Changed
- [#178](https://github.com/synapsestudios/oidc-platform/issues/178) Remove user_password_reset_token table and associated models/methods
- [#249](https://github.com/synapsestudios/oidc-platform/issues/249) Update trap email handling
- [#248](https://github.com/synapsestudios/oidc-platform/pull/248) Change certs
- [#247](https://github.com/synapsestudios/oidc-platform/pull/247) Make hoursTilExpire configurable for email tokens
### Fixed
- [#260](https://github.com/synapsestudios/oidc-platform/issues/260) Fix Validation failing when registration form linked from login form submitted #260
- [#231](https://github.com/synapsestudios/oidc-platform/issues/231) Fix build scripts so docker-compose up always works #231
- [#255](https://github.com/synapsestudios/oidc-platform/issues/255) Fix broken migrations
- [#253](https://github.com/synapsestudios/oidc-platform/pull/253) Resend Verification button causing 500 errors

## [v2.1.2](https://github.com/synapsestudios/oidc-platform/compare/v2.1.1...v2.1.2) - 2017-12-1
### Changed
- [#235](https://github.com/synapsestudios/oidc-platform/issues/235) Fix profile photo upload
## [v2.1.1](https://github.com/synapsestudios/oidc-platform/compare/v2.1.0...v2.1.1) - 2017-11-22
### Changed
- [#230](https://github.com/synapsestudios/oidc-platform/issues/230) add login link to forgot password screen
## [v2.1.0](https://github.com/synapsestudios/oidc-platform/compare/v2.0.0...v2.1.0) - 2017-10-23
### Changed
- [#203](https://github.com/synapsestudios/oidc-platform/issues/203) Implement a system for webhooks
- [#200](https://github.com/synapsestudios/oidc-platform/issues/200) Allow templates to have "options" and use those options to set custom subjects for emails
- [#67](https://github.com/synapsestudios/oidc-platform/issues/67) Make user registration configurable
- [#137](https://github.com/synapsestudios/oidc-platform/issues/137) Stop hard coding the pairwise salt
- [#112](https://github.com/synapsestudios/oidc-platform/issues/112) Env var to control client initiated logout
- [#141](https://github.com/synapsestudios/oidc-platform/issues/141) Add user/client to templates
- [#142](https://github.com/synapsestudios/oidc-platform/issues/142) Remove deprecated template schema
- [#59](https://github.com/synapsestudios/oidc-platform/issues/59) Change password
- [#114](https://github.com/synapsestudios/oidc-platform/issues/114) Email Settings
## [v2.0.0](https://github.com/synapsestudios/oidc-platform/compare/v1.4.0...v2.0.0) - 2017-10-10
### Changed
- [#162](https://github.com/synapsestudios/oidc-platform/issues/162) Stop allowing the access token for auth on the profile screen
- [#138](https://github.com/synapsestudios/oidc-platform/issues/138) Stop hardcoding nonce when resetting passwords
- [#119](https://github.com/synapsestudios/oidc-platform/issues/119) Updated to to [node-oidc](https://github.com/panva/node-oidc-provider) v2.3.2
### Added
- [#115](https://github.com/synapsestudios/oidc-platform/issues/115) Theming. See [theming guide](docs/theming.md) for details
- [#131](https://github.com/synapsestudios/oidc-platform/issues/131) Password Grant now returns an id token as well as an access token

## [v1.4.0](https://github.com/synapsestudios/oidc-platform/compare/v1.3.1...v1.4.0) - 2017-10-3
### Added
- [#127](https://github.com/synapsestudios/oidc-platform/pull/127) Update mysql config to be closer to AWS RDS mysql

## [v1.3.1](https://github.com/synapsestudios/oidc-platform/compare/v1.3.0...v1.3.1) - 2017-10-2
### Added
- [#123](https://github.com/synapsestudios/oidc-platform/pull/123) Allow password grant type in database.
