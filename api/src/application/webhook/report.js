const Hoek = require('hoek');
const Moment = require('moment');

const logger = require('../../lib/logger');

const allowedTypes = ['start', 'error', 'timeout', 'success', 'abandon'];

module.exports = function report(type, id, webhookData, result) {
  Hoek.assert(
    Hoek.contain(allowedTypes, type),
    new Error(`report type must be one of ['${allowedTypes.join("\', '")}']`)
  );

  let level = 'info';
  let msg = `${Moment().format('YYMMDD/HHmmss.SSS')}, [webhook] ${type} job:${id}`;
  let meta = null;

  switch (type) {
    case 'success':
      // result is expected to be an HTTP Incoming Message object
      msg += result ? ` ${result.statusCode}` : '';
      break;
    case 'error':
      // result is expected to be an error object
      if (result.data && result.data.isResponseError) {
        msg += ` ${result.data.response.statusCode}`;
        meta = JSON.stringify(result.output);
      } else {
        level = 'error';
        msg = result;
      }
      break;
    case 'abandon':
      msg += ' maximum retries met';
      break;
  }

  logger.log(level, msg, meta);
}
