const Lab = require('@hapi/lab');
const Code = require('@hapi/code');

const { it, describe, after, before } = (exports.lab = Lab.script());
const getRedisClient = require('../../helpers/redis');
const { expect } = Code;

describe('check redis service config', () => {
  let redisClient;

  before(async () => {
    redisClient = getRedisClient();
  });

  after(async () => {
    redisClient.quit();
  });

  it(`Can set value`, async () => {
    const response = await redisClient.set('foo', 'bar');
    expect(response).to.equal('OK');
  });
  it(`Can retrieve value by key`, async () => {
    const response = await redisClient.get('foo');
    expect(response).to.equal('bar');
  });
});
