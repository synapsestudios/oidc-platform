const Moment = require('moment');

module.exports = logger => async (ctx,next) => {
  try {
    await next();
  } catch(e) {
    logger.error(e);
  }

  const start = new Date();
  const ms = new Date() - start;

  let logLevel;
  if(ctx.status >=500) { logLevel = 'error'; }
  else if(ctx.status >=400) { logLevel = 'warn'; }
  else if(ctx.status >=100) { logLevel = 'info'; }
  let msg = `${Moment().format('YYMMDD/HHmmss.SSS')}, [open-id-connect] ${ctx.method} ${ctx.originalUrl} ${ctx.status} ${ms}ms`;
  logger.log(logLevel, msg);
}
