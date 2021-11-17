const Code = require('@hapi/code');
const Lab = require('@hapi/lab');
const uuid = require('uuid/v4');

const getServer = require('../../server');
const { expect } = Code;
const { it, describe, after, before } = exports.lab = Lab.script();
const { truncateAll } = require('../../helpers/db');
const factory = require('../../helpers/factory');
const knex = require('../../../src/lib/knex');

describe('DELETE /api/users/{userId}', () => {
  let server;

  before(async () => {
    server = await getServer();
  });

  after(async () => {
    await truncateAll();
  });

  it (`responds with 401 when missing auth`, async () => {
    const res = await server.inject({
      method: 'DELETE',
      url: `/api/users/${uuid()}`,
    });

    expect(res.statusCode).to.equal(401);
  });

  it (`responds with 403 when missing admin scope`, async () => {
    const credentials = {};
    const res = await server.inject({
      method: 'DELETE',
      url: `/api/users/${uuid()}`,
      credentials,
    });

    expect(res.statusCode).to.equal(403);
  });

  it (`responds with a 204 and deletes the user`, async () => {
    const credentials = {
      scope: 'admin',
    };
    const user = await factory.create('user');

    const res = await server.inject({
      method: 'DELETE',
      url: `/api/users/${user.id}`,
      credentials,
    });

    const deletedUser = (await knex('SIP_user').where({ id: user.id }).select()).shift();

    expect(res.statusCode).to.equal(204);
    expect(deletedUser).to.be.undefined();
  });
});
