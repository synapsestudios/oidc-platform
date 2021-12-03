const Code = require('@hapi/code');
const Lab = require('@hapi/lab');
const uuid = require('uuid/v4');

const getServer = require('../../server');
const { expect } = Code;
const { it, describe, after, before } = exports.lab = Lab.script();
const { truncateAll } = require('../../helpers/db');
const factory = require('../../helpers/factory');
const knex = require('../../../src/lib/knex');

describe('PUT /api/users/{userId}/profile', () => {
  let server;

  before(async () => {
    server = await getServer();
  });

  after(async () => {
    await truncateAll();
  });

  it (`responds with 401 when missing auth`, async () => {
    const res = await server.inject({
      method: 'PUT',
      url: `/api/users/${uuid()}/profile`,
    });

    expect(res.statusCode).to.equal(401);
  });

  it (`responds with 403 when missing admin scope`, async () => {
    const credentials = {};
    const res = await server.inject({
      method: 'PUT',
      url: `/api/users/${uuid()}/profile`,
      credentials,
    });

    expect(res.statusCode).to.equal(403);
  });

  it (`responds with a 200 and updates the user's profile correctly`, async () => {
    const credentials = {
      scope: 'admin',
    };
    const user = await factory.create('user');
    const profileUpdatePayload = {
      first_name: factory.chance('first')(),
      last_name: factory.chance('last')(),
    };
    const expectedUserProfile = Object.assign({}, user.get('profile'), profileUpdatePayload);

    const res = await server.inject({
      method: 'PUT',
      url: `/api/users/${user.id}/profile`,
      credentials,
      payload: profileUpdatePayload,
    });

    const updatedUser = (await knex('SIP_user').where({ id: user.id }).select()).shift();

    expect(res.statusCode).to.equal(200);
    expect(updatedUser.profile).to.equal(expectedUserProfile);
  });
});
