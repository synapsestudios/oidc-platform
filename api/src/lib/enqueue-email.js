module.exports = (server, renderTemplate) =>
  (title, emailObject) =>
    renderTemplate(emailObject.template, emailObject.templateVars).then(html => {
      emailObject.html = html;
      return server.plugins['hapi-email-kue'].enqueue(title, emailObject);
    });

module.exports['@singleton'] = true;
module.exports['@require'] = ['server', 'render-template'];
