const querystring = require('querystring');
const formatError = require('../../lib/format-error');
const errorMessages = require('./user-error-messages');
const get = require('lodash/get');
const userFormData = require('./user-form-data');

const getValidationMessages = function(error) {
  var validationErrorMessages = {};

  if (error) {
    error = formatError(error);
    error.output.payload.validationErrors.forEach(errorObj => {
      validationErrorMessages[errorObj.key] = validationErrorMessages[errorObj.key] || [];

      if (errorMessages[errorObj.key] && errorMessages[errorObj.key][errorObj.type]) {
        validationErrorMessages[errorObj.key].push(errorMessages[errorObj.key][errorObj.type]);
      } else if (errorObj.message) {
        validationErrorMessages[errorObj.key].push(errorObj.message);
      }
    });
  }

  return validationErrorMessages;
};

module.exports = {
  userRegistration : (request, error) => ({
    title: 'Sign Up',
    formAction: `/user/register?${querystring.stringify(request.query)}`,
    returnTo: `${request.query.redirect_uri}?status=cancelled`,
    error: !!error,
    validationErrorMessages: error.isBoom ? getValidationMessages(error) : error,
    email: request.payload.email || ''
  }),
  userProfile: (user, request, error) => {
    let validationErrorMessages = {};
    if (error) {
      validationErrorMessages = getValidationMessages(error);
      if (validationErrorMessages.picture || validationErrorMessages['hapi.headers.content-type']) {
        validationErrorMessages.picture = ['Must be JPEG or PNG image less than 1MB'];
      }
    }

    const profile = user.get('profile');
    const getValue = (field) => {
      return (request.payload && request.payload[field]) || get(profile, field, '');
    };

    return {
      returnTo: request.query.redirect_uri,
      title: 'User Profile',
      fields: [
        {
          name: 'name',
          label: 'Name',
          type: 'text',
          value: getValue('name'),
          error: validationErrorMessages.name,
        },
        {
          name: 'given_name',
          label: 'Given Name',
          type: 'text',
          value: getValue('given_name'),
          error: validationErrorMessages.given_name,
        },
        {
          name: 'family_name',
          label: 'Family Name',
          type: 'text',
          value: getValue('family_name'),
          error: validationErrorMessages.family_name,
        },
        {
          name: 'middle_name',
          label: 'Middle Name',
          type: 'text',
          value: getValue('middle_name'),
          error: validationErrorMessages.middle_name,
        },
        {
          name: 'nickname',
          label: 'Nickname',
          type: 'text',
          value: getValue('nickname'),
          error: validationErrorMessages.nickname,
        },
        {
          name: 'preferred_username',
          label: 'Preferred Username',
          type: 'text',
          value: getValue('preferred_username'),
          error: validationErrorMessages.preferred_username,
        },
        {
          name: 'profile',
          label: 'Profile',
          type: 'text',
          value: getValue('profile'),
          error: validationErrorMessages.profile,
        },
        {
          name: 'picture',
          label: 'Picture',
          isFile: true,
          accept: 'image/jpeg, image/png',
          value: getValue('picture'),
          error: validationErrorMessages.picture,
        },
        {
          name: 'website',
          label: 'Website',
          type: 'text',
          value: getValue('website'),
          error: validationErrorMessages.website,
        },
        {
          name: 'gender',
          label: 'Gender',
          type: 'text',
          value: getValue('gender'),
          error: validationErrorMessages.gender,
        },
        {
          name: 'birthdate',
          label: 'Birthdate',
          type: 'text',
          value: getValue('birthdate'),
          error: validationErrorMessages.birthdate,
        },
        {
          name: 'zoneinfo',
          label: 'Timezone',
          isDropdown: true,
          options: userFormData.timezones.map(name => ({
            label: name,
            value: name,
            selected: getValue('zoneinfo') === name
          })),
          value: getValue('zoneinfo'),
          error: validationErrorMessages.zoneinfo,
        },
        {
          name: 'locale',
          label: 'Locale',
          isDropdown: true,
          options: Object.keys(userFormData.locales).map((value) => ({
            label: userFormData.locales[value],
            value,
            selected: getValue('locale') === value,
          })),
          value: getValue('locale'),
          error: validationErrorMessages.locale,
        },
        {
          name: 'phone_number',
          label: 'Phone Number',
          type: 'text',
          value: getValue('phone_number'),
          error: validationErrorMessages.phone_number,
        },
        {
          name: 'address.street_address',
          label: 'Street Address',
          type: 'text',
          value: getValue('address.street_address'),
          error: validationErrorMessages['address.street_address'],
        },
        {
          name: 'address.locality',
          label: 'Locality',
          type: 'text',
          value: getValue('address.locality'),
          error: validationErrorMessages['address.locality'],
        },
        {
          name: 'address.region',
          label: 'Region',
          type: 'text',
          value: getValue('address.region'),
          error: validationErrorMessages['address.region'],
        },
        {
          name: 'address.postal_code',
          label: 'Postal Code',
          type: 'text',
          value: getValue('address.postal_code'),
          error: validationErrorMessages['address.postal_code'],
        },
        {
          name: 'address.country',
          label: 'Country',
          type: 'text',
          value: getValue('address.country'),
          error: validationErrorMessages['address.country'],
        },
      ]

    };
  }
};
