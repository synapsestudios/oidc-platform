const Lab = require('@hapi/lab');
const { expect } = require('@hapi/code');
const { stringify } = require('querystring');
const sinon = require('sinon');
const uuid = require('uuid');

const getServer = require('../../server');
const { truncateAll } = require('../../helpers/db');
const factory = require('../../helpers/factory');

const { describe, it, before, beforeEach, after, afterEach } = (exports.lab =
  Lab.script());

describe('GET /user/forgot-password', () => {
  let server, client;

  before(async () => {
    server = await getServer();
  });

  beforeEach(async () => {
    client = await factory.create('client');
    await client.refresh({ withRelated: 'redirect_uris' });
  });

  after(async () => {
    await truncateAll();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('includes code_challenge in the password recovery form action', async () => {
    const query = {
      client_id: client.get('client_id'),
      redirect_uri: client.related('redirect_uris').at(0).get('uri'),
      code_challenge: uuid.v4(),
    };
    const res = await server.inject({
      method: 'GET',
      url: `/user/forgot-password?${stringify(query)}`,
    });

    expect(res.statusCode).to.equal(200);
    expect(res.result).to.match(
      new RegExp(`action="/user/forgot-password?[^"]+${query.code_challenge}`)
    );
  });
});
