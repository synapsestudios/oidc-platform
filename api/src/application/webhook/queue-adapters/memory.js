const uuid = require('uuid');

const maxRetries = 2;    // make configurable
const retryDelay = 1000; // make configurable

const q = require('queue')({
  concurrency: 2, // make configurable
  timeout: 2000,   // make configurable
  autostart: true,
});

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

getJob = (data, post) => {
  let job = cb => {
    const timestamp = new Date().getTime()/1000|0;
    console.log(`processing ${job.id}`);
    post(data, (err, response) => {
      job.attempts.push({
        timestamp,
        response,
        error: err,
      });

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

module.exports = function getAdapter(post) {
  return {
    enqueue(data) {
      q.push(getJob(data, post));
    }
  }
}
