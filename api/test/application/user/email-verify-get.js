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
const { expect } = Code;

const { URL } = require("url");

describe("GET /user/email-verify", () => {
  let server, client, client_id, redirect_uri;

  const response_type = "application/json";
  const scope = "scope";

  before(async () => {
    server = await getServer();
  });

  beforeEach(async () => {
    client = await factory.create("client");
    await client.load("redirect_uris");
    client_id = client.get("client_id");
    redirect_uri = client.related("redirect_uris").at(0).get("uri");
  });

  after(async () => {
    await truncateAll();
  });

  afterEach(() => {
    sinon.restore();
  });

  it(`responds with a 200 with valid accept invite url`, async () => {
    const sendEmailMock = await mockSendEmail();

    const payload = {
      client_id,
      email: "test@example.com",
      redirect_uri,
      response_type,
      scope,
    };

    await server.inject({
      method: "POST",
      url: "/api/invite",
      credentials: {
        scope: "admin",
      },
      payload,
    });

    expect(sendEmailMock.calledOnce).to.equal(true);

    const emailHtml = sendEmailMock.args[0][0].html;

    const emailRegex = new RegExp("https?://[^\\s]+");

    const [urlFromEmail] = emailHtml.match(emailRegex);

    const verificationResponse = await server.inject({
      method: "GET",
      url: urlFromEmail,
    });

    expect(verificationResponse.statusCode).to.equal(200);
  });

  it(`responds with a 404 with invalid accept invite url`, async () => {
    const sendEmailMock = await mockSendEmail();

    const payload = {
      client_id,
      email: "test@example.com",
      redirect_uri,
      response_type,
      scope,
    };

    await server.inject({
      method: "POST",
      url: "/api/invite",
      credentials: {
        scope: "admin",
      },
      payload,
    });

    expect(sendEmailMock.calledOnce).to.equal(true);

    const emailHtml = sendEmailMock.args[0][0].html;

    const emailRegex = new RegExp("https?://[^\\s]+");

    const [urlFromEmail] = emailHtml.match(emailRegex);

    const urlObject = new URL(urlFromEmail);

    const query = querystring.parse(urlObject.searchParams.toString());

    urlObject.search = querystring.stringify({ ...query, client_id: "junk" });

    const verificationResponse = await server.inject({
      method: "GET",
      url: urlObject.toString(),
    });

    expect(verificationResponse.statusCode).to.equal(404);
  });
});
