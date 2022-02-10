const Lab = require('@hapi/lab');
const Code = require('@hapi/code');
const getServer = require('../../server');
const { truncateAll } = require('../../helpers/db');
const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script();
const { mockSendEmail } = require('../../helpers/mocks');
const sinon = require('sinon');
const factory = require('../../helpers/factory');
const knex = require('../../../src/lib/knex');
const { expect } = Code;

describe(`POST /api/invite`, () => {
  let server, client;

  beforeEach(async () => {
    server = await getServer();
    client = await factory.create('client');
  });

  afterEach(async () => {
    sinon.restore();
    await truncateAll();
  });

  it(`invites user`, async () => {
    const sendEmailMock = await mockSendEmail();

    await client.load('redirect_uris');

    const payload = {
      client_id: client.get('client_id'),
      email: 'test@example.com',
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
  });

  it(`successfully invites but does NOT create a user when provided an email address that already exists, case insensitive`, async () => {
    const sendEmailMock = await mockSendEmail();
    await client.load('redirect_uris');

    const testEmail = 'TestEmail@example.com';
    const testEmailDifferentCase = testEmail.toUpperCase();

    await factory.create('user', {
      email: testEmail,
      email_lower: testEmail.toLowerCase()
    });

    let users = await knex('SIP_user').where({ email_lower: testEmail.toLowerCase() });
    expect(users.length).to.equal(1);

    const payload = {
      client_id: client.get('client_id'),
      email: testEmailDifferentCase,
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
    expect(sendEmailMock.calledOnce).to.equal(true);

    users = await knex('SIP_user').where({ email_lower: testEmail.toLowerCase() });
    expect(users.length).to.equal(1);
  });

});
