module.exports = (
  userService,
  themeService,
  clientService
) => {
  return (templateName, getView, postHandler) => async (request, reply, source, error) => {
    try {
      const client = await clientService.findById(request.query.client_id);
      let user = null;
      if (request.auth.isAuthenticated) {
        user = request.auth.strategy === 'email_token'
          ? request.auth.credentials.user
          : await userService.findById(request.auth.credentials.accountId());
      }

      const render = async e => {
        const viewContext = getView(user, client, request, e);
        const template = await themeService.renderThemedTemplate(request.query.client_id, templateName, viewContext);
        if (template) {
          reply(template);
        } else {
          reply.view(templateName, viewContext);
        }
      }

      if (!error && request.method === 'post') {
        error = await postHandler(request, reply, user, client, render);
      } else {
        await render(error);
      }
    } catch(e) {
      reply(e);
    }
  };
};

module.exports['@singleton'] = true;
module.exports['@require'] = [
  'user/user-service',
  'theme/theme-service',
  'client/client-service',
];
