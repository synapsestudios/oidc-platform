const oidcRelations = [
  'default_acr_values',
  'post_logout_redirect_uris',
  'request_uris',
  'response_types',
  'redirect_uris',
  'grant_types',
  'contacts',
];

module.exports = (bookshelf) => ({
  create(id, payload) {
    const toStore = Object.assign({}, payload);

    oidcRelations.forEach(relation => {
      delete toStore[relation];
    });

    return bookshelf.transaction(txn => bookshelf.model('client')
      .forge({ client_id: id })
      .save(toStore, { method: 'insert', transacting: txn })
      .then(client => {
        const newRelations = [];
        if (payload.default_acr_values) {
          newRelations.concat(payload.default_acr_values.map(value => {
            return bookshelf.model('client_default_acr_value').forge({
              client_id: id,
              value
            }).save(null, { method: 'insert', transacting: txn });
          }));
        }
        if (payload.post_logout_redirect_uris) {
          newRelations.concat(payload.post_logout_redirect_uris.map(uri => {
            return bookshelf.model('client_post_logout_redirect_uri').forge({
              client_id: id,
              uri
            }).save(null, { method: 'insert', transacting: txn });
          }));
        }
        if (payload.request_uris) {
          newRelations.concat(payload.request_uris.map(uri => {
            return bookshelf.model('client_request_uri').forge({
              client_id: id,
              uri
            }).save(null, { method: 'insert', transacting: txn });
          }));
        }
        if (payload.response_types) {
          newRelations.concat(payload.response_types.map(value => {
            return bookshelf.model('client_response_type').forge({
              client_id: id,
              value
            }).save(null, { method: 'insert', transacting: txn });
          }));
        }
        if (payload.redirect_uris) {
          newRelations.concat(payload.redirect_uris.map(uri => {
            return bookshelf.model('client_redirect_uri').forge({
              client_id: id,
              uri
            }).save(null, { method: 'insert', transacting: txn });
          }));
        }
        if (payload.grant_types) {
          newRelations.concat(payload.grant_types.map(grant_type => {
            return bookshelf.model('client_grant').forge({
              client_id: id,
              grant_type
            }).save(null, { method: 'insert', transacting: txn });
          }));
        }
        if (payload.contacts) {
          newRelations.concat(payload.contacts.map(email => {
            return bookshelf.model('client_contact').forge({
              client_id: id,
              email
            }).save(null, { method: 'insert', transacting: txn });
          }));
        }
        return Promise.all(newRelations);
      })
    )
    .then(() => {
      return bookshelf.model('client').forge({ client_id: id }).fetch({ withRelated: oidcRelations });
    });
  },

  destroy(id) {
    return bookshelf.model('client').forge({ client_id: id }).destroy();
  },

  findById(id) {
    return bookshelf
      .model('client')
      .where({ client_id: id })
      .fetch({ withRelated: oidcRelations });
  },

  findByRedirectUriAndClientId(clientId, redirect_uri) {
    return bookshelf.model('client_redirect_uri').where({ client_id: clientId, uri: redirect_uri }).fetchAll();
  },

  update(id, payload) {
    const toStore = Object.assign({}, payload);
    return bookshelf.model('client').forge({ client_id: id }).save(toStore);
  },

  setResetPasswordTemplate(templateRecord, clientId) {
    return this.findById(clientId)
      .then(clientRecord => clientRecord.set('reset_password_template_id', templateRecord.get('id')).save());
  },

});

module.exports['@singleton'] = true;
module.exports['@require'] = [
  'bookshelf',
];
