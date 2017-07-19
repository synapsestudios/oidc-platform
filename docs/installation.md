# Installation

Each release of the Synapse OIDC Platform is built as a docker public docker image on [Docker Hub](https://hub.docker.com/r/synapsestudios/oidc-platform/). The docker image is the recommended way to deploy the OIDC Platform for both development and production purposes. If it is necessary to run the identity platform without docker then you will have to checkout the code from this repo and run the node server on your own boxes.

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

The OIDC platform provides some features that will send emails. In order to send emails the OIDC Provider needs to be configured to use an email service. Currently the platform only supports [mailgun](https://www.mailgun.com/) and [AWS SES](https://aws.amazon.com/ses/). Configuring your email provider occurs in environment variables.

| Environment Variables | Provider | Description |
| --------------------- | -------- | ----------- |
| OIDC_EMAIL_DRIVER | both | Tell the platform which email provider to user. Value can be either 'ses' or 'mailgun' |
| OIDC_EMAIL_DOMAIN | both | The domain to send emails from |
| OIDC_EMAIL_WHITELIST | both | A whitelist of domains (comma separated) that emails can be sent to. If OIDC_EMAIL_WHITELIST is not set then the whitelist feature will not be used |
| OIDC_EMAIL_TRAP | both | If whitelist check fails then the email will be sent to the email specified by OIDC_EMAIL_TRAP |
| MAILGUN_API_KEY | mailgun | If you're using mailgun you must provide an api key |
| AWS_ACCESS_KEY | ses | Documented [here](http://docs.aws.amazon.com/cli/latest/userguide/cli-environment.html) |
| AWS_SECRET_ACCESS_KEY | ses | Documented [here](http://docs.aws.amazon.com/cli/latest/userguide/cli-environment.html) |

## Files

## Environment Variable Reference
