module.exports = bookshelf => bookshelf.model('user', {
  tableName: 'SIP_user',

  parse(attributes) {
    // profile will be a text field if using mysql
    if (typeof attributes.profile === 'string') {
      attributes.profile = JSON.parse(attributes.profile);
    }
    if (typeof attributes.app_metadata === 'string') {
      attributes.app_metadata = JSON.parse(attributes.app_metadata);
    }
    if (attributes.app_metadata === null) {
      attributes.app_metadata = {};
    }
    return attributes;
  },

  format(attributes) {
    // profile will be a text field if using mysql
    if (typeof attributes.profile !== 'string') {
      attributes.profile = JSON.stringify(attributes.profile);
    }
    if (typeof attributes.app_metadata !== 'string') {
      attributes.app_metadata = JSON.stringify(attributes.app_metadata);
    }
    return attributes;
  },

  serialize(options) {
    options = options || {};
    if (options.strictOidc) {
      return {
        accountId: this.get('id'),
        claims: () => {
          return Object.assign(
            this.get('profile'),
            {
              email: this.get('email'),
            },
            {
              app_metadata: this.get('app_metadata'),
              sub: this.get('id')
            }
          );
        }
      };
    } else {
      var json = bookshelf.Model.prototype.serialize.call(this, options);
      delete(json.password);
      return json;
    }
  },
});

// ALL THE OIDC CLAIMS
// {
  // accountId : id,
  // claims : function() {
    // return {
      // address: {
        // country: '000',
        // formatted: '000',
        // locality: '000',
        // postal_code: '000',
        // region: '000',
        // street_address: '000',
      // },
      // birthdate: '1987-10-16',
      // email: 'johndoe@example.com',
      // email_verified: false,
      // family_name: 'Doe',
      // gender: 'male',
      // given_name: 'John',
      // locale: 'en-US',
      // middle_name: 'Middle',
      // name: 'John Doe',
      // nickname: 'Johny',
      // phone_number: '+49 000 000000',
      // phone_number_verified: false,
      // picture: 'http://lorempixel.com/400/200/',
      // preferred_username: 'Jdawg',
      // profile: 'https://johnswebsite.com',
      // sub: this.accountId,
      // updated_at: 1454704946,
      // website: 'http://example.com',
      // zoneinfo: 'Europe/Berlin',
    // };
  // }
// }

module.exports['@singleton'] = true;
module.exports['@require'] = ['bookshelf'];
