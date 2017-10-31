const uuid = require('uuid');
const Wreck = require('wreck');
const btoa = require('btoa');

const {
  JWS: { createSign, createVerify },
} = require('node-jose')




const maxRetries = 2;    // make configurable
const retryDelay = 1000; // make configurable

const q = require('queue')({
  concurrency: 2, // make configurable
  timeout: 2000,   // make configurable
  autostart: true,
});

let keystore;

/**
 * Retry if the job hasn't reached max retrys
 */
const attemptRetry = job => {
  if (job.retries < maxRetries) {
    ++job.retries;
    setTimeout(() => q.push(job), retryDelay);
  } else {
    console.log(`job:${job.id} rety max. Won't try again.`);
  }
}

getJob = data => {
  let job = cb => {
    const timestamp = new Date().getTime()/1000|0;
    const tokenPayload = {
      iat: timestamp,
      exp: timestamp + 60 * 10,
      aud: data.client_id,
      iss: process.env.OIDC_BASE_URL || 'http://localhost:9000',
    };

    createSign({
      fields: { typ: 'JWT' },
      format: 'compact',
    }, keystore.get({ alg: 'RS256' }))
      .update(JSON.stringify(tokenPayload), 'utf8')
      .final()
      .then(jwt => {
        console.log(`processing job! ${data.url}:${data.payload.webhook_id}`);
        const options = {
          payload: data.payload,
          headers: {
            Authorization: 'Bearer ' + jwt,
          }
        };

        Wreck.post(data.url, options, (err, response, payload) => {
          job.attempts.push({
            timestamp,
            response,
            error: err,
          });

          cb(err);
        });
      })
      .catch(err => {
        cb(err);
      });
  }

  job.id = uuid.v4();
  job.retries = 0;
  job.attempts = [];
  job.data = data;
  return job;
}

q.on('error', (err, job) => {
  console.log(`we have an error! ${err.message}`);
  attemptRetry(job);
});

q.on('timeout', (next, job) => {
  console.log(`Timeout! Job id: ${job.id}, try: ${job.retries + 1}`);
  next();
  attemptRetry(job);
});

module.exports = function getAdapter(){
  return {
    setKeystore(k) {
      keystore = k;
    },

    enqueue(data) {
      q.push(getJob(data));
    }
  }
}
