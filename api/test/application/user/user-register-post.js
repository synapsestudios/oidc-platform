const Lab = require("@hapi/lab");
const Code = require("@hapi/code");
const getServer = require("../../server");
const { truncateAll } = require("../../helpers/db");
const { describe, it, before, beforeEach, after, afterEach } = (exports.lab =
  Lab.script());
const { mockSendEmail } = require("../../helpers/mocks");
const sinon = require("sinon");
const factory = require("../../helpers/factory");
const { expect } = Code;
const uuid = require("uuid");
const bookshelf = require("../../../src/lib/bookshelf");
const querystring = require("querystring");
const webhookService = require("../../../src/application/webhook/webhook-service");
const { JSDOM } = require('jsdom');
const { getByText } = require('@testing-library/dom');

describe(`POST /api/invite`, () => {
  let server, client;

  before(async () => {
    server = await getServer();
  });

  beforeEach(async () => {
    client = await factory.create("client");
    await client.refresh({ withRelated: "redirect_uris" });
    mockSendEmail();
  });

  after(async () => {
    await truncateAll();
  });

  afterEach(() => {
    sinon.restore();
  });

  const getQueryParams = () => ({
    client_id: client.get("client_id"),
    response_type: "code id_token token",
    scope: "openid profile app_metadata",
    redirect_uri: client.related("redirect_uris").at(0).get("uri"),
    nonce: "nonce",
  });

  it(`redirect as expected (status code 302)`, async () => {
    const queryString = querystring.stringify(getQueryParams());

    const payload = {
      email: `${uuid.v4()}@example.com`,
      password: "synapse1",
      pass2: "synapse1",
    };

    const res = await server.inject({
      method: "POST",
      url: `/user/register?${queryString}`,
      payload,
    });

    expect(res.statusCode).to.equal(302);
  });

  it(`accepts and sets all additional values to the user profile`, async () => {
    const queryString = querystring.stringify(getQueryParams());

    const payload = {
      email: `${uuid.v4()}@example.com`,
      password: "synapse1",
      pass2: "synapse1",
      name: uuid.v4(),
      given_name: "Test",
      family_name: "Testerson",
      middle_name: "T",
      nickname: "Testy",
      preferred_username: "Testy1990",
      profile: "https://testyfacebook.com",
      website: "https://testy.com",
      gender: "neutral",
      birthdate: "1990-02-17",
      zoneinfo: "America/Phoenix",
      locale: "en_US",
      phone_number: "(260) 867-5309",
    };

    const res = await server.inject({
      method: "POST",
      url: `/user/register?${queryString}`,
      payload,
    });

    const user = await bookshelf
      .model("user")
      .where({
        email_lower: payload.email.toLowerCase(),
      })
      .fetch();

    const user_profile = user.get("profile");

    expect(user.get("email")).to.equal(payload.email);
    expect(user_profile.name).to.equal(payload.name);
    expect(user_profile.given_name).to.equal(payload.given_name);
    expect(user_profile.family_name).to.equal(payload.family_name);
    expect(user_profile.middle_name).to.equal(payload.middle_name);
    expect(user_profile.nickname).to.equal(payload.nickname);
    expect(user_profile.preferred_username).to.equal(
      payload.preferred_username
    );
    expect(user_profile.profile).to.equal(payload.profile);
    expect(user_profile.website).to.equal(payload.website);
    expect(user_profile.gender).to.equal(payload.gender);
    expect(user_profile.birthdate).to.equal(payload.birthdate);
    expect(user_profile.zoneinfo).to.equal(payload.zoneinfo);
    expect(user_profile.locale).to.equal(payload.locale);
    expect(user_profile.phone_number).to.equal(payload.phone_number);
  });

  /*it(`returns 400 with missing payload`, async () => {
    const queryString = querystring.stringify(getQueryParams());
    const res = await server.inject({
      method: "POST",
      url: `/user/register?${queryString}`,
    });
    expect(res.statusCode).to.equal(400);

  });*/

  it(`returns 400 with an invalid email`, async () => {
    const queryString = querystring.stringify(getQueryParams());

    const payload = {
      email: `${uuid.v4()}example.com`,
      password: "synapse1",
      pass2: "synapse1",
    };

    const res = await server.inject({
      method: "POST",
      url: `/user/register?${queryString}`,
      payload,
    });

    expect(res.statusCode).to.equal(400);
    const { window } = new JSDOM(res.result);
    getByText(window.document.body, /must be a valid email address/i);

  });

  it(`returns 400 if passwords do not match`, async () => {
    const queryString = querystring.stringify(getQueryParams());

    const payload = {
      email: `${uuid.v4()}@example.com`,
      password: "synapse2",
      pass2: "synapse1",
    };

    const res = await server.inject({
      method: "POST",
      url: `/user/register?${queryString}`,
      payload,
    });

    expect(res.statusCode).to.equal(400);
    const { window } = new JSDOM(res.result);
    getByText(window.document.body, /passwords must match/i);
  });

  it(`returns 400 if missing email`, async () => {
    const queryString = querystring.stringify(getQueryParams());

    const payload = {
      password: "synapse1",
      pass2: "synapse1",
    };

    const res = await server.inject({
      method: "POST",
      url: `/user/register?${queryString}`,
      payload,
    });

    expect(res.statusCode).to.equal(400);
    const { window } = new JSDOM(res.result);
    getByText(window.document.body, /email address is required/i);
  });
  
  it(`returns 400 if missing password`, async () => {
    const queryString = querystring.stringify(getQueryParams());

    const payload = {
      email: `${uuid.v4()}@example.com`,
    };

    const res = await server.inject({
      method: "POST",
      url: `/user/register?${queryString}`,
      payload,
    });

    expect(res.statusCode).to.equal(400);
  });

  it(`returns 400 if birthdate is not a valid date`, async () => {
    const queryString = querystring.stringify(getQueryParams());

    const payload = {
      email: `${uuid.v4()}@example.com`,
      password: "synapse1",
      pass2: "synapse1",
      birthdate: "199-17",
    };

    const res = await server.inject({
      method: "POST",
      url: `/user/register?${queryString}`,
      payload,
    });

    expect(res.statusCode).to.equal(400);
  });

  it(`returns 400 if zone is not valid`, async () => {
    const queryString = querystring.stringify(getQueryParams());

    const payload = {
      email: `${uuid.v4()}@example.com`,
      password: "synapse1",
      pass2: "synapse1",
      zoneinfo: "zone",
    };

    const res = await server.inject({
      method: "POST",
      url: `/user/register?${queryString}`,
      payload,
    });

    expect(res.statusCode).to.equal(400);

  });

  it(`returns 400 if locale is not valid`, async () => {
    const queryString = querystring.stringify(getQueryParams());

    const payload = {
      email: `${uuid.v4()}@example.com`,
      password: "synapse1",
      pass2: "synapse1",
      zoneinfo: "1234",
    };

    const res = await server.inject({
      method: "POST",
      url: `/user/register?${queryString}`,
      payload,
    });

    expect(res.statusCode).to.equal(400);

  });

  it(`triggers user.registered webhook`, async () => {
    sinon.stub(webhookService, "trigger");

    const queryString = querystring.stringify(getQueryParams());
    const payload = {
      email: `${uuid.v4()}@example.com`,
      password: "synapse1",
      pass2: "synapse1",
    };

    const res = await server.inject({
      method: "POST",
      url: `/user/register?${queryString}`,
      payload,
    });

    const user = await bookshelf
      .model("user")
      .where({
        email_lower: payload.email.toLowerCase(),
      })
      .fetch();

    expect(res.statusCode).to.equal(302);
    expect(webhookService.trigger.calledOnce).to.be.true();
    expect(webhookService.trigger.args[0][0]).to.equal("user.registered");
    expect(
      webhookService.trigger.args[0][1] instanceof bookshelf.Model
    ).to.be.true();
    expect(webhookService.trigger.args[0][1].get("id")).to.equal(
      user.get("id")
    );
  });
});
