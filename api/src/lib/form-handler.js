module.exports = (
  userService,
  themeService,
  clientService
) => {
  return (templateName, getView, postHandler) => async (request, reply, source, error) => {
    if (error && error.output.statusCode === 404) {
      return reply(error);
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
