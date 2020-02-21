const Hoek = require('hoek');

const bookshelf = require('../../lib/bookshelf');
const logger = require('../../lib/logger');
const queue = require('./getQueue')();
const webhookConfig = require('../../../config')('/webhooks');

module.exports = {
  events: [
    'user.update',
    'user.accept-invite',
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
    Hoek.assert(Hoek.contain(this.events, event), new Error(`WebhookService:trigger - ${event} is an invalid event`));

    if (!webhookConfig) return; // webhooks disabled

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
          alg: client.get('id_token_signed_response_alg'),
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
      logger.error(e);
    }
  }
};
