# OpenID Connect Identity Platform

# Hapi Api Template
Template used by Synapse Studios, LLC to make hapi rest apis.

## Installation
1. `./initialize.sh`
1. `git add -A`
1. `git commit -m "Initial commit"`
1. `git push -u origin master`

## Usage
Hapi is a simple framework that does a lot of stuff right. We try not to get in its way. Most usage details should be found in the hapi docs.

We use [bookshelf] (http://bookshelfjs.org/) and [knex] (http://knexjs.org/) for database stuff.
We use [electrolyte] (https://github.com/jaredhanson/electrolyte) for IOC.

### Validation
We validate our inputs using hapi's built in api validation which can be found documented [here] (http://hapijs.com/tutorials/validation). Hapi uses a validation library called [Joi] (https://github.com/hapijs/joi). The authors of Joi have decided to not provide hooks for custom validators nor to provide the ability for custom messages for validation errors so we have set up a couple standards for how we handle custom validation and client side messaging.

#### Validation Messaging

*The client will be responsible for messaging*. Our validation errors will return with a key and a type for each error. The key is the field in the payload that is erronious (ie, if you provide an `email` field that is not an email then the key will be email). The type is a string that will map to a type of failure. For example, if you provide a non-email string to an email field the type that will be returned in the error is `string.email`. The client can then choose what messaging to show given that type.

#### Custom Validation

In order to do custom validation we provide a `mixedValidation` function in the `/src/lib/validator` directory. Custom validators are defined in `/src/lib/validator/constraints`. To define a new constraint create a new file in the constraints directory. The simplest validator looks like this:

```
module.exports = ValidationError => {                 // Called by electrolyte when setting up IOC container
    return () => {                                    // Called by you in routes definition. Pass things like model name and constraint params
        return value => {                             // Called by hapi during validation. Passes the value to be validated
            return new Promise((resolve, reject) => { // Returns a promise. Reject if invalid, resolve if valid
                if (/* value is valid */) {
                    resolve(value);
                } else {
                    // Provide a message for api debugging and a type for client messaging
                    reject(new ValidationError('some message', 'custom.type'));
                }
            });
        };
    };
};

module.exports['@singleton'] = true;
module.exports['@require'] = ['validator/validation-error'];
```

In routes call `mixedValidation` like so:

```
{
    method : 'POST',
    path : '/example',
    handler : controller.post,
    config: {
        validate: {
            payload: mixedValidation({
                email: Joi.string().email(),
            }, {
                email: customValidator()
            })
        }
    }
}
```

If Joi validation fails then the custom validators won't run.

## Developing the template
To work on the template itself:

1. `git submodule add <cookbooks-repo> api/cookbooks`
1. Be sure not to commit .gitmodules or the cookbooks directory
1. `npm install` from `api`
1. `vagrant up` from project root
1. `vagrant ssh`
1. `npm start` from `/vagrant`
