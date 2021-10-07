const querystring = require("querystring");
const Lab = require("@hapi/lab");
const Code = require("@hapi/code");
const getServer = require("../../server");
const { truncateAll } = require("../../helpers/db");
const { describe, it, before, beforeEach, after, afterEach } = (exports.lab =
  Lab.script());
const { mockSendEmail } = require("../../helpers/mocks");
const sinon = require("sinon");
const factory = require("../../helpers/factory");
const knex = require("../../../src/lib/knex");
const { expect } = Code;

describe("GET /user/email-verify", () => {
  let server, client;

  before(async () => {
    server = await getServer();
  });

  beforeEach(async () => {
    client = await factory.create("client");
  });

  after(async () => {
    await truncateAll();
  });

  afterEach(() => {
    sinon.restore();
  });

  it(`responds with a 200 with valid accept invite url`, async () => {
    await mockSendEmail();
    await client.load("redirect_uris");

    const client_id = client.get("client_id");
    const redirect_uri = client.related("redirect_uris").at(0).get("uri");
    const response_type = "something";
    const scope = "scope";

    const payload = {
      client_id: client.get("client_id"),
      email: "test@syn0.com",
      redirect_uri: client.related("redirect_uris").at(0).get("uri"),
      response_type: "something",
      scope: "scope",
    };

    const res = await server.inject({
      method: "POST",
      url: "/api/invite",
      credentials: {
        scope: "admin",
      },
      payload,
    });

    const user = res.result;
    const [{ token }] = await knex("SIP_email_token").where({
      user_id: user.id,
    });

    const query = {
      client_id,
      redirect_uri,
      response_type,
      scope,
      token,
    };

    const verificationResponse = await server.inject({
      method: "GET",
      url: `/user/accept-invite?${querystring.stringify(query)}`.replace(
        " ",
        "%20"
      ),
    });

    expect(verificationResponse.statusCode).to.equal(200);
  });

  it(`responds with a 404 with invalid accept invite url`, async () => {
    await mockSendEmail();
    await client.load("redirect_uris");
    const client_id = client.get("client_id");
    const redirect_uri = client.related("redirect_uris").at(0).get("uri");
    const response_type = "something";
    const scope = "scope";

    const payload = {
      client_id,
      email: "test@syn0.com",
      redirect_uri,
      response_type,
      scope,
    };

    const res = await server.inject({
      method: "POST",
      url: "/api/invite",
      credentials: {
        scope: "admin",
      },
      payload,
    });

    const user = res.result;
    const [{ token }] = await knex("SIP_email_token").where({
      user_id: user.id,
    });

    const query = {
      client_id: client_id + "junk",
      redirect_uri,
      response_type,
      scope,
      token,
    };

    const verificationResponse = await server.inject({
      method: "GET",
      url: `/user/accept-invite?${querystring.stringify(query)}`.replace(
        " ",
        "%20"
      ),
    });
    expect(verificationResponse.statusCode).to.equal(404);
  });
});
