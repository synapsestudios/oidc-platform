const uuid = require('uuid');

const maxRetries = 2;    // make configurable
const retryDelay = 1000; // make configurable

const q = require('queue')({
  concurrency: 2, // make configurable
  timeout: 2000,   // make configurable
  autostart: true,
});

module.exports = function getAdapter(post, report) {

  /**
   * Retry if the job hasn't reached max retrys
   */
  const attemptRetry = job => {
    if (job.retries < maxRetries) {
      ++job.retries;
      setTimeout(() => q.push(job), retryDelay);
    } else {
      report('abandon', job.id, job.data);
    }
  }

  q.on('error', (err, job) => {
    report('error', job.id, job.data, err);
    attemptRetry(job);
  });

  q.on('timeout', (next, job) => {
    report('timeout', job.id, job.data);
    next();
    attemptRetry(job);
  });

  getJob = (data, post) => {
    let job = cb => {
      post(data, (err, response) => {
        job.attempts.push({response, err});
        if (!err) {
          report('success', job.id, data, response);
        }

        cb(err);
      });
    }

    job.id = uuid.v4();
    job.retries = 0;
    job.data = data;
    job.attempts = [];

    return job;
  }

  return {
    enqueue(data) {
      const job = getJob(data, post);
      report('start', job.id, data);
      q.push(job);
    }
  }
}
