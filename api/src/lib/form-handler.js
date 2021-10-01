module.exports = (
  userService,
  themeService,
  clientService
) => {
  return (templateName, getView, postHandler, ...rest) => async (request, reply, source, err) => {
    const error = err || request.pre.error;
    if (error && error.output.statusCode === 404) {
      return reply(error);
    }

    try {
      const client = await clientService.findById(request.query.client_id);

      if (!client) {
        return reply('404: Client not found').code(404);
      }

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
        return reply(template).code(e && e.output && e.output.statusCode || 200);
      };

      if (!error && request.method === 'post') {
        await postHandler(request, reply, user, client, render, ...rest);
      } else {
        await render(error);
      }
    } catch(e) {
      return reply(e);
    }
  };
};

module.exports['@singleton'] = true;
module.exports['@require'] = [
  'user/user-service',
  'theme/theme-service',
  'client/client-service',
];
