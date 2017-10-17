module.exports = (
  userService,
  themeService,
  clientService
) => {
  return (templateName, getView, postHandler) => async (request, reply, source, error) => {
    try {
      const accountId = request.auth.credentials.accountId();
      // const user = await userService.findById(accountId);
      // const client = await clientService.findById(request.query.client_id);

      const [ user, client ] = await Promise.all([
        userService.findById(accountId),
        clientService.findById(request.query.client_id),
      ]);

      if (!user) {
        return reply.redirect(`${request.query.redirect_uri}?error=user_not_found&error_description=user not found`);
      }

      if (!error && request.method === 'post') {
        error = await postHandler(request, reply, user, client);
      }

      const viewContext = getView(user, client, request, error);
      const template = await themeService.renderThemedTemplate(request.query.client_id, templateName, viewContext);
      if (template) {
        reply(template);
      } else {
        reply.view(templateName, viewContext);
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
