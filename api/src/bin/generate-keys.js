const fs = require('fs');
const { createKeyStore } = require('oidc-provider');
const certificateKeystore = createKeyStore();
const integrityKeystore = createKeyStore();

console.log('Generating keys. This will take a few seconds...');
Promise.all([
  certificateKeystore.generate('RSA', 2048, {
    kid: 'sig-rs-0',
    use: 'sig',
  }),
  certificateKeystore.generate('RSA', 2048, {
    kid: 'enc-rs-0',
    use: 'enc',
  }),
  certificateKeystore.generate('EC', 'P-256', {
    kid: 'sig-ec2-0',
    use: 'sig',
  }),
  certificateKeystore.generate('EC', 'P-256', {
    kid: 'enc-ec2-0',
    use: 'enc',
  }),
  certificateKeystore.generate('EC', 'P-384', {
    kid: 'sig-ec3-0',
    use: 'sig',
  }),
  certificateKeystore.generate('EC', 'P-384', {
    kid: 'enc-ec3-0',
    use: 'enc',
  }),
  certificateKeystore.generate('EC', 'P-521', {
    kid: 'sig-ec5-0',
    use: 'sig',
  }),
  certificateKeystore.generate('EC', 'P-521', {
    kid: 'enc-ec5-0',
    use: 'enc',
  }),
]).then(function () {
  fs.open('./keystore.json', 'w', (err, fd) => {
    const keystores = certificateKeystore.toJSON(true);
    fs.write(fd, JSON.stringify(keystores));
    console.log('Done! Created keytstore.json\n');
  });
});
