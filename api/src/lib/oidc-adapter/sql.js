'use strict';

module.exports = (clientService) => {
  class SqlAdapter {
    constructor(name) {
      // only support Client models for now
      this.service = clientService;
    }

    key(id) {
      return id;
    }

    destroy(id) {
      return this.service.destroy(id);
    }

    consume(id) {
      return this.service.findById(id);
    }

    find(id) {
      return this.service.findById(id)
        .then(result => result.serialize({ strictOidc: true }));
    }

    upsert(id, payload, expiresIn) {
      return this.service.findById(id)
        .then(result => {
          if (result) {
            return this.service.update(id, payload);
          } else {
            return this.service.create(id, payload);
          }
        });
    }
  }

  return SqlAdapter;
};

module.exports['@singleton'] = true;
module.exports['@require'] = ['client/client-service'];
