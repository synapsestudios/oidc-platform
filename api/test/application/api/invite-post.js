const Lab = require('@hapi/lab');
const Code = require('@hapi/code');
const getServer = require('../../server');
const { truncateAll } = require('../../helpers/db');
const { describe, it, before, beforeEach, after, afterEach } = exports.lab = Lab.script();
const { mockSendEmail } = require('../../helpers/mocks');
const sinon = require('sinon');
const factory = require('../../helpers/factory');
const { expect } = Code;

describe.only(`POST /api/invite`, () => {
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
    await mockSendEmail();

    const res = await server.inject({
      method: 'POST',
      url: '/api/invite',
      credentials: {
        scope: 'admin',
      },
      payload: {
        client_id: client.get('client_id'),
      }
    });

    expect(res.statusCode).to.equal(200);
  })

});
