module.exports = bookshelf => bookshelf.model('user', {
  tableName: 'SIP_user',

  claims() {
    return {
      email: this.get('email'),
    };
  }
});

module.exports['@singleton'] = true;
module.exports['@require'] = ['bookshelf'];
