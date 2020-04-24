const Lab = require('@hapi/lab');
const Code = require('@hapi/code');
const getServer = require('../../server');
const { truncateAll } = require('../../helpers/db');
const { describe, it, before, beforeEach, after, afterEach } = exports.lab = Lab.script();
const { mockSendEmail } = require('../../helpers/mocks');
const sinon = require('sinon');
const factory = require('../../helpers/factory');
const knex = require('../../../src/lib/knex');
const { expect } = Code;

describe(`POST /api/invite`, () => {
  let server, client;

  before(async () => {
    server = await getServer();
  });

  beforeEach(async () => {
    client = await factory.create('client');
  });

  after(async () => {
    await truncateAll();
  });

  afterEach(() => {
    sinon.restore();
  })

  it(`invites user`, async () => {
    const sendEmailMock = await mockSendEmail();

    await client.load('redirect_uris');

    const payload = {
      client_id: client.get('client_id'),
      email: 'test@syn0.com',
      redirect_uri: client.related('redirect_uris').at(0).get('uri'),
      response_type: 'something',
      scope: 'scope',
    };

    const res = await server.inject({
      method: 'POST',
      url: '/api/invite',
      credentials: {
        scope: 'admin',
      },
      payload
    });

    expect(res.statusCode).to.equal(200);

    const users = await knex('SIP_user').where({ email: payload.email });
    expect(users.length).to.equal(1);

    const emailTokens = await knex('SIP_email_token').where({ user_id: users[0].id });
    expect(emailTokens.length).to.equal(1);

    expect(sendEmailMock.calledOnce).to.equal(true);
  })

});
