const Lab = require('@hapi/lab');
const { expect } = require('@hapi/code');
const { stringify } = require('querystring');
const sinon = require('sinon');
const uuid = require('uuid');
const knex = require('../../../src/lib/knex');

const getServer = require('../../server');
const { truncateAll } = require('../../helpers/db');
const factory = require('../../helpers/factory');

const { describe, it, before, beforeEach, after, afterEach } = (exports.lab =
  Lab.script());

describe('GET /user/reset-password', () => {
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

  it('returns 403 forbidden if token is not supplied', async () => {
    const res = await server.inject({
      method: 'GET',
      url: '/user/reset-password',
    });

    expect(res.statusCode).to.equal(403);
  });

  it('includes code_challenge in the password recovery form action', async () => {
    const user = await factory.create('user');
    const token = await factory.create('emailToken', { user_id: user.id });

    const query = {
      token: token.get('token'),
      client_id: client.get('client_id'),
      redirect_uri: client.related('redirect_uris').at(0).get('uri'),
      code_challenge: uuid.v4(),
    };
    const res = await server.inject({
      method: 'GET',
      url: `/user/reset-password?${stringify(query)}`,
    });

    expect(res.statusCode).to.equal(200);
    expect(res.result).to.match(
      new RegExp(`action="/user/reset-password?[^"]+${query.code_challenge}`)
    );
  });
});
