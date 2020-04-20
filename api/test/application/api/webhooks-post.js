const Code = require('@hapi/code');
const Lab = require('@hapi/lab');
const { expect } = Code;
const getServer = require('../../server');
const { describe, it, before, beforeEach, after } = exports.lab = Lab.script();
const { truncateAll } = require('../../helpers/db');
const factory = require('../../helpers/factory');
const knex = require('../../../src/lib/knex');

describe('POST /api/webhooks', () => {
  let server, client;

  before(async () => {
    server = await getServer();
  });

  beforeEach(async () => {
    client = await factory.create('client');
  });

  after(async () => {
    await truncateAll();
  })

  it(`creates webhook and webhook events`, async () => {
    const webhookUrl = `${client.get('client_uri')}/webhooks`;
    const res = await server.inject({
      method: 'POST',
      url: '/api/webhooks',
      credentials: {
        scope: 'admin',
        clientId: client.get('client_id'),
      },
      payload: {
        events: [
          'user.accept-invite',
          'user.update',
        ],
        url: webhookUrl,
      }
    });

    const webhooks = await knex('SIP_webhook').where({ client_id: client.get('client_id') });

    expect(res.statusCode).to.equal(200);
    expect(webhooks.length).to.equal(1);
    expect(webhooks[0].url).to.equal(webhookUrl);

    const events = await knex('SIP_webhook_event').where({ webhook_id: webhooks[0].id });

    expect(events.length).to.equal(2);
    expect(events.find(event => event.event === 'user.accept-invite')).to.exist();
    expect(events.find(event => event.event === 'user.update')).to.exist();
  });

  it(`returns 400 for invalid events`, async () => {
    const res = await server.inject({
      method: 'POST',
      url: '/api/webhooks',
      credentials: {
        scope: 'admin',
        clientId: client.get('client_id'),
      },
      payload: {
        events: [
          'this-is-not-a-valid-event',
        ],
        url: `${client.get('client_uri')}/webhooks`,
      }
    });

    expect(res.statusCode).to.equal(400);
  })
});
