const fs = require('fs');
const { createKeyStore } = require('oidc-provider');
const keystore = createKeyStore();

console.log('Generating keys. This will take a few seconds...');
Promise.all([
  keystore.generate('RSA', 2048, {
    kid: 'sig-rs-0',
    use: 'sig',
  }),
  keystore.generate('RSA', 2048, {
    kid: 'enc-rs-0',
    use: 'enc',
  }),
  keystore.generate('EC', 'P-256', {
    kid: 'sig-ec2-0',
    use: 'sig',
  }),
  keystore.generate('EC', 'P-256', {
    kid: 'enc-ec2-0',
    use: 'enc',
  }),
  keystore.generate('EC', 'P-384', {
    kid: 'sig-ec3-0',
    use: 'sig',
  }),
  keystore.generate('EC', 'P-384', {
    kid: 'enc-ec3-0',
    use: 'enc',
  }),
  keystore.generate('EC', 'P-521', {
    kid: 'sig-ec5-0',
    use: 'sig',
  }),
  keystore.generate('EC', 'P-521', {
    kid: 'enc-ec5-0',
    use: 'enc',
  })
]).then(function () {
  fs.open('./keystore.json', 'w', (err, fd) => {
    fs.write(fd, JSON.stringify(keystore.toJSON(true)));
    console.log('Done! Created keystore.json\n');
  });
});
