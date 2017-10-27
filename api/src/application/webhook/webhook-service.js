const bookshelf = require('../../lib/bookshelf');
const uuid = require('uuid');

module.exports = {
  events: [
    'user.update',
  ],

  async create(clientId, url, events) {
    return bookshelf.transaction(async trx => {
      const webhook = await bookshelf.model('webhook').forge({
        id: uuid.v4(),
        client_id: clientId,
        url
      }).save(null, {transacting: trx, method: 'insert'});

      const eventCollection = await Promise.all(events.map(event => {
        return bookshelf.model('webhook_event').forge({
          webhook_id: webhook.get('id'),
          event,
        }).save(null, {transacting: trx, method: 'insert'});
      }));

      webhook.related('events').add(eventCollection);
      return webhook;
    });
  }
};
