const Redis = require('ioredis'); // eslint-disable-line import/no-unresolved
const { isEmpty } = require('lodash');
const redisConfig = require('../../../config')('/redis');

const client = new Redis(redisConfig, {
  keyPrefix: 'oidc:',
});

const grantable = new Set([
  'AccessToken',
  'AuthorizationCode',
  'RefreshToken',
  'DeviceCode',
]);

module.exports = (userService) => {
  function grantKeyFor(id) {
    return `grant:${id}`;
  }

  function userCodeKeyFor(userCode) {
    return `userCode:${userCode}`;
  }

  class RedisAdapter {
    constructor(name) {
      this.name = name;
    }

    async upsert(id, payload, expiresIn) {
      const key = this.key(id);
      const store = grantable.has(this.name) ? {
        dump: JSON.stringify(payload),
        ...(payload.grantId ? { grantId: payload.grantId } : undefined),
      } : JSON.stringify(payload);

      const multi = client.multi();
      multi[grantable.has(this.name) ? 'hmset' : 'set'](key, store);

      if (expiresIn) {
        multi.expire(key, expiresIn);
      }

      if (payload.grantId) {
        const grantKey = grantKeyFor(payload.grantId);
        multi.rpush(grantKey, key);
        // if you're seeing grant key lists growing out of acceptable proportions consider using LTRIM
        // here to trim the list to an appropriate length
        const ttl = await client.ttl(grantKey);
        if (expiresIn > ttl) {
          multi.expire(grantKey, expiresIn);
        }
      }

      if (payload.userCode) {
        const userCodeKey = userCodeKeyFor(payload.userCode);
        multi.set(userCodeKey, id);
        multi.expire(userCodeKey, expiresIn);
      }

      await multi.exec();
    }

    async find(id) {
      // ease transition from 2.8 to 3.0.0
      const type = await client.type(this.key(id));
      const data = (type === 'hash' || grantable.has(this.name))
        ? await client.hgetall(this.key(id))
        : await client.get(this.key(id));

      if (isEmpty(data)) {
        return undefined;
      }

      if (typeof data === 'string') {
        return JSON.parse(data);
      }
      const { dump, ...rest } = data;

      // ease the transition from 2.x to 3.0.0
      if (!dump) return { ...rest };

      if (dump.accountId) {
        const user = await userService.findByIdForOidc(dump.accountId);
        if (!user) {
          // if the user doesn't exist anymore destroy the access token
          await this.destroy(id);
          return undefined;
        }
      }

      return {
        ...rest,
        ...JSON.parse(dump),
      };
    }

    async findByUserCode(userCode) {
      const id = await client.get(userCodeKeyFor(userCode));
      return this.find(id);
    }

    async destroy(id) {
      const key = this.key(id);
      if (grantable.has(this.name)) {
        const multi = client.multi();
        const grantId = await client.hget(key, 'grantId');
        const tokens = await client.lrange(grantKeyFor(grantId), 0, -1);
        tokens.forEach(token => multi.del(token));
        multi.del(grantKeyFor(grantId));
        await multi.exec();
      } else {
        await client.del(key);
      }
    }

    async consume(id) {
      await client.hset(this.key(id), 'consumed', Math.floor(Date.now() / 1000));
    }

    key(id) {
      return `${this.name}:${id}`;
    }
  }

  return RedisAdapter;
};

module.exports['@singleton'] = true;
module.exports['@require'] = ['user/user-oidc-service'];
