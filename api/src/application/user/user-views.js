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
  userRegistration : (user, client, request, error) => {
    const payload = request.payload || {};
    return {
      client: client.serialize({strictOidc:true}),
      title: 'Sign Up',
      formAction: `/user/register?${querystring.stringify(request.query)}`,
      returnTo: request.query.login ? `/op/auth?${querystring.stringify(request.query)}` : request.query.redirect_uri,
      error: !!error,
      validationErrorMessages: error && error.isBoom ? getValidationMessages(error) : error,
      email: payload.email || ''
    }
  },

  userProfile: (user, client, request, error) => {
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
      user: user.serialize(),
      client: client.serialize({strictOidc:true}),
      changePassUrl: `/user/password?${querystring.stringify({
        client_id: request.query.client_id,
        redirect_uri: request.query.redirect_uri,
        profile: true,
      })}`,
      emailSettingsUrl: `/user/email-settings?${querystring.stringify({
        client_id: request.query.client_id,
        redirect_uri: request.query.redirect_uri,
        profile: true,
      })}`,
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
  },

  forgotPassword : (user, client, request, error) => ({
    client: client.serialize({strictOidc:true}),
    title: 'Forgot Password',
    formAction: `/user/forgot-password?${querystring.stringify(request.query)}`,
    returnTo: `${request.query.redirect_uri}`,
    error: !!error,
    validationErrorMessages: getValidationMessages(error),
  }),

  emailSettings : (user, client, request, error) => {
    request.payload = request.payload || {};
    let successMessage;
    switch(request.payload.action) {
      case 'reverify':
        successMessage = 'Verification email sent';
        break;
      case 'change':
      case 'new_reverify':
        successMessage = 'A verification email has been sent to the address provided and is required before you can use it to log in.';
        break;
      default:
        successMessage = '';
        break;
    }

    return {
      user: user.serialize(),
      client: client.serialize({strictOidc:true}),
      title: 'Email Settings',
      returnTo: request.query.profile ? `/user/profile?${querystring.stringify({
        client_id: request.query.client_id,
        redirect_uri: request.query.redirect_uri,
      })}` : `${request.query.redirect_uri}`,
      success: request.method === 'post' && !error ? true : false,
      successMessage,
      error: !!error,
      validationErrorMessages: error && error.isBoom ? getValidationMessages(error) : error,
      email: user.get('email'),
      emailVerified: user.get('profile').email_verified,
      pendingEmail: user.get('pending_email') || false,
    }
  },

  changePassword : (user, client, request, error) => {
    return {
      user: user.serialize(),
      client: client.serialize({strictOidc:true}),
      title: 'Change Password',
      returnTo: request.query.profile ? `/user/profile?${querystring.stringify({
        client_id: request.query.client_id,
        redirect_uri: request.query.redirect_uri,
      })}` : `${request.query.redirect_uri}`,
      success: request.method === 'post' && !error ? true : false,
      error: !!error,
      validationErrorMessages: error && error.isBoom ? getValidationMessages(error) : error,
    }
  },

  completeChangePassword : (user, client, request, error) => {
    return {
      user: user.serialize(),
      client: client.serialize({strictOidc:true}),
      title : error ? 'Email not verified' : 'Email verified',
      returnTo : request.query.redirect_uri,
      error: !!error,
      validationErrorMessages: error && error.isBoom ? getValidationMessages(error) : error,
    }
  },

  emailVerifySuccess : (user, client, request, error) => {
    return {
      user: user.serialize(),
      client: client.serialize({strictOidc:true}),
      title: error ? 'Email not verified' :'Email Verified',
      returnTo: request.query.redirect_uri,
      error: !!error,
      validationErrorMessages: error && error.isBoom ? getValidationMessages(error) : error,
    }
  },

  resetPassword : title => (user, client, request, error) => {
    const redirectSet = request.query.token != undefined;
    return {
      user: user.serialize(),
      client: client.serialize({strictOidc:true}),
      title: title,
      returnTo: (redirectSet) ? false : `${request.query.redirect_uri}`,
      error: !!error,
      validationErrorMessages: error && error.isBoom ? getValidationMessages(error) : error,
    };
  },

  resetPasswordSuccess : request => {
    const { token, ...query } = request.query;
    return {
      title: 'Password Set',
      linkUrl: `/op/auth?${querystring.stringify(query)}`
    };
  },

  inviteEmail : (user, client, baseUrl, query) => ({
    user: user.serialize(),
    client: client.serialize({strictOidc:true}),
    url: `${baseUrl}/user/accept-invite?${querystring.stringify(query)}`.replace(' ', '%20'),
    appName: client.get('client_name'),
    subject: `${client.get('client_name')} Invitation`,
  }),
};
