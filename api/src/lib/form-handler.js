const logger = require('./logger');

module.exports = (
  userService,
  themeService,
  clientService
) => {
  return (templateName, getView, postHandler) => async (request, reply, source, error) => {
    if (error && error.output.statusCode === 404) {
      // 404 errors aren't the user's fault, other 400 errors probably are
      // Take control away from the user and show them a generic error message
      const template = await themeService.renderThemedTemplate('error', {
        error: error.output.payload.error,
        error_description: error.output.payload.message,
        systemError: true,
        debug_info: JSON.stringify(error, null, 4),
      });

      logger.error(error);
      return reply(template).code(error.output.statusCode);
    }

    try {
      const client = await clientService.findById(request.query.client_id);
      let user = null;
      if (request.auth.isAuthenticated) {
        switch(request.auth.strategy) {
          case 'email_token':
            user = request.auth.credentials.user;
            break;
          case 'oidc_session':
            user = await userService.findById(request.auth.credentials.accountId());
            break;
          case 'access_token':
            user =  await userService.findById(request.auth.credentials.accountId);
            break;
          default:
        }
      }

      const render = async e => {
        const viewContext = getView(user, client, request, e);
        const template = await themeService.renderThemedTemplate(templateName, viewContext, request.query.client_id);
        return reply(template);
      };

      if (!error && request.method === 'post') {
        error = await postHandler(request, reply, user, client, render);
      } else {
        await render(error);
      }
    } catch(e) {
      // this is always going to be a 500, and the error
      // structure can't be predicted because of the possibility
      // of irresponsible throwers
      const template = await themeService.renderThemedTemplate('error', {
        error: 'Critical Failure',
        error_description: e.message || 'The system experienced a critical failure and cannot recover',
        debug_info: e.stack || e,
        systemError: true,
      });
      logger.error(e);
      return reply(template).code(500);
    }
  };
};

module.exports['@singleton'] = true;
module.exports['@require'] = [
  'user/user-service',
  'theme/theme-service',
  'client/client-service',
];
