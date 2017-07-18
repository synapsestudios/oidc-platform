const uuid = require('uuid');

module.exports = (bookshelf) => ({
  create(id, payload) {
    const toStore = Object.assign({}, payload);
    const clientRelationships = Object.keys(bookshelf.model('client').prototype.relationships);

    clientRelationships.forEach(relation => {
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
      return bookshelf.model('client').forge({ client_id: id }).fetch({ withRelated: clientRelationships });
    });
  },

  destroy(id) {
    return bookshelf.model('client').forge({ client_id: id }).destroy();
  },

  findById(id) {
    const clientRelationships = Object.keys(bookshelf.model('client').prototype.relationships);
    return bookshelf
      .model('client')
      .where({ client_id: id })
      .fetch({ withRelated: clientRelationships });
  },

  findByRedirectUriAndClientId(clientId, redirect_uri) {
    return bookshelf.model('client_redirect_uri').where({ client_id: clientId, uri: redirect_uri }).fetchAll();
  },

  update(id, payload) {
    const toStore = Object.assign({}, payload);
    return bookshelf.model('client').forge({ client_id: id }).save(toStore);
  },

  createResetPasswordTemplate(template, clientId) {
    return this.findById(clientId)
      .then(clientRecord => {
          return bookshelf.model('client_email_template').forge({ template, id: uuid.v4() }).save()
            .then(newTemplateRecord => {
              return clientRecord.set('reset_password_template_id', newTemplateRecord.get('id')).save();
            });
      });
  },

  getResetPasswordTemplate(clientId) {
    return this.findById(clientId)
      .then(clientRecord => {
        const resetPasswordTemplateId = clientRecord.get('reset_password_template_id');

        if (resetPasswordTemplateId === null) {
          return Promise.resolve(null);
        }

        return bookshelf.model('client_email_template').where('id', resetPasswordTemplateId).fetch();
      });
  }

});

module.exports['@singleton'] = true;
module.exports['@require'] = ['bookshelf'];
