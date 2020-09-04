const Lab = require('@hapi/lab');
const Code = require('@hapi/code');
const getServer = require('../../server');
const { truncateAll } = require('../../helpers/db');
const { describe, it, before, beforeEach, after, afterEach } = exports.lab = Lab.script();
const { mockSendEmail } = require('../../helpers/mocks');
const sinon = require('sinon');
const factory = require('../../helpers/factory');
const { expect } = Code;
const uuid = require('uuid');
const bookshelf = require('../../../src/lib/bookshelf');
const querystring = require('querystring');

describe(`POST /api/invite`, () => {
  let server, client;

  before(async () => {
    server = await getServer();
  });

  beforeEach(async () => {
    client = await factory.create('client');
    mockSendEmail();
  });

  after(async () => {
    await truncateAll();
  });

  afterEach(() => {
    sinon.restore();
  })

  it(`redirects and sets additional values to the user profile`, async () => {
    await client.refresh({ withRelated: 'redirect_uris'});
    const queryParams = {
      client_id: client.get('client_id'),
      response_type: 'code id_token token',
      scope: 'openid profile app_metadata',
      redirect_uri: client.related('redirect_uris').at(0).get('uri'),
      nonce: 'nonce',
    }
    const queryString = querystring.stringify(queryParams);

    const payload = {
      email: 'test@syn0.com',
      password: 'synapse1',
      pass2: 'synapse1',
      name: uuid.v4(),
      occupation: uuid.v4(),
    };

    const res = await server.inject({
      method: 'POST',
      url: `/user/register?${queryString}`,
      payload
    });

    const user = await bookshelf.model('user').where({
      email_lower: payload.email.toLowerCase()
    }).fetch();

    expect(res.statusCode).to.equal(302);
    expect(user.get('profile').name).to.equal(payload.name);
    expect(user.get('profile').occupation).to.equal(payload.occupation);
  })

});
