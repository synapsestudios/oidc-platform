const jose = require("node-jose");
const keystore = require('../../keystore');

const btoa = (string) => {
  return Buffer.from(string).toString("base64").replace(/=+$/, "");
};

module.exports = {
  getTokenForUser: async (userId) => {
    const payloadData = {
      sub: userId,
    };

    const payload = btoa(JSON.stringify(payloadData));

    const keystoreObject = await jose.JWK.asKeyStore(keystore);
    const key = keystoreObject.get("sig-rs-0");
    const payloadBuffer = jose.util.base64url.decode(payload);
    const jwt = await jose.JWS.createSign(
      { format: "compact", fields: { typ: "JWT" } },
      key
    )
      .update(payloadBuffer)
      .final();

    return jwt;
  },
};
