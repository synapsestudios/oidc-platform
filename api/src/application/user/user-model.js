module.exports = bookshelf => bookshelf.model('user', {
  tableName: 'SIP_user',

  serialize(options) {
    options = options || {};

    if (options.strictOidc) {
      return {
        accountId : this.get('id'),
        claims : () => {
          return {
            email : this.get('email')
          };
        }
      };
    } else {
      return bookshelf.Model.prototype.serialize.call(this, options);
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