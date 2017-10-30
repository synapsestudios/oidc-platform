const bookshelf = require('../../lib/bookshelf');
const queue = require('./webhook-queue');

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
  },

  async trigger(event, resource) {
    // TODO: validate that event is in this.events
    try {
      // get the webhooks for this event
      const webhookCollection = await bookshelf.model('webhook')
        .query(q => {
          q.join('SIP_webhook_event', 'SIP_webhook.id', '=', 'SIP_webhook_event.webhook_id');
          q.where('SIP_webhook_event.event', event);
        }).fetchAll({withRelated: 'client'});


      // enqueue the webhook payload for each webhook
      webhookCollection.forEach(webhook => {
        const client = webhook.related('client');
        queue.enqueue({
          url: webhook.get('url'),
          client_id: client.get('client_id'),
          client_secret: client.get('client_secret'),
          payload: {
            event,
            webhook_id: webhook.get('id'),
            timestamp: new Date().getTime()/1000|0,
            resource: resource instanceof bookshelf.Model
            ? resource.serialize()
            : resource,
          }
        });
      });
    } catch(e) {
      // log stuff once i figure that out
      console.error(e);
    }
  }
};
