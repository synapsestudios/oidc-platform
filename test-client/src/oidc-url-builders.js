import localstorage from 'store2';
import uuid from 'uuid';
import config from './config';

export function getLoginUrl() {
  const nonce = uuid();
  const codeChallenge = `${uuid.v4()}-${uuid.v4()}`;
  localstorage.set('nonce', nonce);
  localstorage.set('code_verifier', codeChallenge);
  return (
    `${config.identityServer}op/auth?client_id=${config.clientId}` +
    `&response_type=${config.responseType}&scope=${config.scope}` +
    `&redirect_uri=${config.redirectUri}&nonce=${nonce}&code_challenge=${codeChallenge}&prompt=consent`
  );
}
