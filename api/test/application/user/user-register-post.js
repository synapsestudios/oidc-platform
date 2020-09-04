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
const webhookService = require('../../../src/application/webhook/webhook-service');

describe(`POST /api/invite`, () => {
  let server, client;

  before(async () => {
    server = await getServer();
  });

  beforeEach(async () => {
    client = await factory.create('client');
    await client.refresh({ withRelated: 'redirect_uris'});
    mockSendEmail();
  });

  after(async () => {
    await truncateAll();
  });

  afterEach(() => {
    sinon.restore();
  })

  const getQueryParams = () => ({
    client_id: client.get('client_id'),
    response_type: 'code id_token token',
    scope: 'openid profile app_metadata',
    redirect_uri: client.related('redirect_uris').at(0).get('uri'),
    nonce: 'nonce',
  })

  it(`redirects and sets additional values to the user profile`, async () => {
    const queryString = querystring.stringify(getQueryParams());

    const payload = {
      email: `${uuid.v4()}@syn0.com`,
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
  });

  it(`triggers user.registered webhook`, async () => {
    sinon.stub(webhookService, 'trigger');

    const queryString = querystring.stringify(getQueryParams());
    const payload = {
      email: `${uuid.v4()}@syn0.com`,
      password: 'synapse1',
      pass2: 'synapse1',
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
    expect(webhookService.trigger.calledOnce).to.be.true();
    expect(webhookService.trigger.args[0][0]).to.equal('user.registered');
    expect(webhookService.trigger.args[0][1] instanceof bookshelf.Model).to.be.true();
    expect(webhookService.trigger.args[0][1].get('id')).to.equal(user.get('id'));
  });

});
