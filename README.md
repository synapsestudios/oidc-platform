# OpenID Connect Identity Platform

The synapse OpenID Connect platform uses [node-oidc-provider](https://github.com/panva/node-oidc-provider) to provide user authentication for our clients' applications. node-oidc-provider is an [OpenID Connect](http://openid.net/connect/) provider library. In order to fully understand the ins and outs of this application understanding OpenID Connect is a must.

## Usage
TBD

## Keystores

node-oidc-provider uses [node-jose](https://github.com/cisco/node-jose) keys and stores to encrypt, sign and decrypt things (mostly tokens and stuff). For security purposes YOU SHOULD PROVIDE YOUR OWN KEYS. The synapse OpenID Connect platform provides a default set of keys so that it will work if you do not provide your own, but PLEASE DO NOT USE THE DEFAULTS IN PRODUCTION.

### Generating Keys

We provide a script that, if you're using docker-compose, can be run like this:

```
$ docker-compose exec synapse-oidc npm run generate-keys
$ docker-compose exec cat > keystores.json
```

Now you have a `keystores.json` file. Put that in an AWS S3 bucket and provide these environment variables:

```
KEYSTORE=keystores.json //a file name
KEYSTORE_BUCKET=bucket-name //a S3 bucket

AWS_ACCESS_KEY_ID=string //standard aws access key env var
AWS_SECRET_ACCESS_KEY=string //standard aws secret key env var
```
