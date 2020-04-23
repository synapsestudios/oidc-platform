# Installation

Each release of the Synapse OIDC Platform is built as a docker public docker image on [Docker Hub](https://hub.docker.com/r/synapsestudios/oidc-platform/). The docker image is the recommended way to deploy the OIDC Platform for both development and production purposes. If it is necessary to run the identity platform without docker then you will have to checkout the code from this repo and run the node server on your own boxes.

## App Config

| Environment Variable      | Description |
| --------------------      | ----------- |
| NODE_ENV                  | Set to `development` to use a self-signed certificate |
| OIDC_BASE_URL             | The url that the OIDC Provider is hosted at |
| OIDC_INITIAL_ACCESS_TOKEN | A strong token that will be used to create new clients |
| COOKIE_KEY                | Set this to a long string to be used to encrypt session cookies |
| OLD_COOKIE_KEY            | When you update COOKIE_KEY make sure to set OLD_COOKIE_KEY to the value that was in COOKIE_KEY. New cookies will be encrypted with the COOKIE_KEY. Old cookies will be decrypted with OLD_COOKIE_KEY to be validated then reencrypted with COOKIE_KEY |
| CLIENT_INITIATED_LOGOUT   | Set to true if you want to enable client initiated logouts using the `/user/logout` endpoint |
| OIDC_PAIRWISE_SALT        | The salt used to generate [OIDC Pairwise Subject Identifiers](http://openid.net/specs/openid-connect-core-1_0.html#PairwiseAlg) |
| ENABLE_USER_REGISTRATION  | Set to true if you want to enable user registration at the `/user/register` endpoint. If this is disabled client initiated invites is the only way to make new users |
| REDIS_HOST                | Set if different from default 'localhost' |
| REDIS_PORT                | Set if different from default '6379' |
| ENABLE_USER_SESSION_TRACKING | Set to true if you want to enable session tracking by user id in order to bulk delete sessions by user id at the `/user/invalidate-user-sessions` endpoint. |

## Keystores
**DEPRECATION WARNING:** The Synapse OpenID Connect platform provides a default set of keys so that it will work if you do not provide your own, but **DO NOT USE THE DEFAULTS IN PRODUCTION**. Use of these keys in a non-development environment will be removed in the next version and OIDC will not start.

node-oidc-provider uses [node-jose](https://github.com/cisco/node-jose) keys and stores to encrypt, sign and decrypt things (mostly tokens and stuff). For security purposes **YOU SHOULD PROVIDE YOUR OWN KEYS**. The synapse OpenID Connect platform provides a default set of keys so that it will work if you do not provide your own, but **PLEASE DO NOT USE THE DEFAULTS IN PRODUCTION.**

### Generating Keys

We provide a script that will generate a keystore file that can be run like this:

```
$ npm run generate-keys
```

If you're running the OIDC platform inside a container with docker-compose you can run it this way:

```
$ docker-compose exec synapse-oidc npm run generate-keys
$ docker-compose exec synapse-oidc cat keystores.json > keystores.json
```

Now you have a `keystores.json` file. Put that in an AWS S3 bucket and configure the required environment variables.

| Environment Variables | Description |
| --------------------- | ----------- |
| KEYSTORE              | The name of your keystore file |
| KEYSTORE_BUCKET       | The bucket your keystore can be found in |
| AWS_ACCESS_KEY        | Documented [here](http://docs.aws.amazon.com/cli/latest/userguide/cli-environment.html) |
| AWS_SECRET_ACCESS_KEY | Documented [here](http://docs.aws.amazon.com/cli/latest/userguide/cli-environment.html) |

When `KEYSTORE` and `KEYSTORE_BUCKET` are provided the Synapse OpenID Provider will attempt to pull the keystores from S3 when the node service starts. If you provide the `KEYSTORE` and `KEYSTORE_BUCKET` variables but NOT the AWS credential variables then the provider api will fail to start.

Alternatively, the keystore can be placed in an Azure Blob Storage container. In that case, the following environment variables must be set:

| Environment Variables    | Description |
| ------------------------ | ----------- |
| OIDC_STORAGE_DRIVER      | This must be set to azure_blob_storage, otherwise s3 will be used |
| KEYSTORE                 | The name of your keystore file |
| KEYSTORE_CONTAINER       | The name of the container your keystore can be found in |
| AZURE_STORAGE_ACCOUNT    | The name of the storage account |
| AZURE_STORAGE_ACCESS_KEY | Secret access key |

## Database

The OIDC Platform supports Postgres or MySQL. The database server is not packaged with the OIDC platform. You must create a blank database and provide connection details to the OIDC Platform through environment variables.

### Configuring the OIDC Platform to use your database

| Environment Variable | Description                                                                                |
| -------------------- | ------------------------------------------------------------------------------------------ |
| OIDC_DB_ADAPTER      | Tell the platform which database adapter to use. Value can be either 'mysql' or 'postgres' |
| OIDC_DB_HOST         | The host url for the database                                                              |
| OIDC_DB_PORT         | The port to connect on                                                                     |
| OIDC_DB_NAME         | Database Name                                                                              |
| OIDC_DB_USER         | The user you want the platform to use                                                      |
| OIDC_DB_PASSWORD     | The user's password                                                                        |

### Creating tables for the first time

Once the database is configured and the OIDC Platform is running and connected to the database you must run the migrate command which will create all of the necessary tables in your database. Run this command from inside your container:

```
npm run migrate
```

## Email

The OIDC platform provides some features that will send emails. In order to send emails the OIDC Provider needs to be configured to use an email service. Currently the platform supports [mailgun](https://www.mailgun.com/), [AWS SES](https://aws.amazon.com/ses/), and [SendGrid](https://sendgrid.com/). Configuring your email provider occurs in environment variables.

| Environment Variables | Provider | Description |
| --------------------- | -------- | ----------- |
| OIDC_EMAIL_DRIVER     | all      | Tell the platform which email provider to user. Value can be either 'ses', 'sendgrid' or 'mailgun' |
| OIDC_EMAIL_DOMAIN     | all      | The domain to send emails from |
| OIDC_EMAIL_WHITELIST  | all      | A whitelist of domains (comma separated) that emails can be sent to. If OIDC_EMAIL_WHITELIST is not set then the whitelist feature will not be used |
| OIDC_EMAIL_TRAP       | all      | If whitelist check fails then the email will be sent to the email specified by OIDC_EMAIL_TRAP |
| MAILGUN_API_KEY       | mailgun  | If you're using mailgun you must provide an api key |
| SENDGRID_API_KEY      | sendgrid | If you're using SendGrid you must provide an api key |
| AWS_ACCESS_KEY        | ses      | Documented [here](http://docs.aws.amazon.com/cli/latest/userguide/cli-environment.html) |
| AWS_SECRET_ACCESS_KEY | ses      | Documented [here](http://docs.aws.amazon.com/cli/latest/userguide/cli-environment.html) |

## Files

Users can upload profile pictures when editing their profile. The platform makes use of [AWS S3](https://aws.amazon.com/s3/) to store files. In order to store files in s3 you will need to configure some values in environment varialbes.

| Environment Variables | Description |
| --------------------- | ----------- |
| OIDC_S3_BUCKET        | The bucket in s3 that files will be saved to |
| AWS_ACCESS_KEY        | Documented [here](http://docs.aws.amazon.com/cli/latest/userguide/cli-environment.html) |
| AWS_SECRET_ACCESS_KEY | Documented [here](http://docs.aws.amazon.com/cli/latest/userguide/cli-environment.html) |

If you are storing your keystore using Azure Blob Storage, then your uploads will also use Azure. In that case, make sure the following variables are defined:

| Environment Variables        | Description |
| ---------------------------- | ----------- |
| OIDC_STORAGE_DRIVER          | This must be set to azure_blob_storage, otherwise s3 will be used |
| AZURE_STORAGE_ACCOUNT        | The name of the storage account |
| AZURE_STORAGE_ACCESS_KEY     | Secret access key |
| OIDC_AZURE_STORAGE_CONTAINER | The name of the container where uploads will be stored |
## Webhooks

| Environment Variables | Description |
| --------------------- | ----------- |
| ENABLE_WEBHOOKS | if this value is anything other than 'true' then webhooks will be disabled (default 'false') |
| WEBHOOK_ADAPTER | 'memory' is the only adapter currently supported (default 'memory') |
| WEBHOOK_TIMEOUT | time in ms to wait before stopping a webhook POST (default 2000) |
| WEBHOOK_MAX_RETRIES | how many times to retry a failed POST. If max retries is 2, then you will have a total of 3 attempts. 1 attempt followed by 2 retries. (default 2) |
| WEBHOOK_RETRY_DELAY | time in ms to wait before retrying a failed request (default 10000) |
| WEBHOOK_CONCURRENCY | number of webhook POST requests to process at a time (default 1) |


## Error Logging

If you want to log any errors that happen you can set these values and errors will automatically be sent to the service you use.

| Environment Variables     | Description |
| ------------------------- | ----------- |
| SENTRY_DSN                | (Optional) Sentry DSN value if you want to use sentry for logging |
| ROLLBAR_ACCESS_TOKEN      | (Optional) Rollbar Access Token value if you want to use Rollbar for logging |
