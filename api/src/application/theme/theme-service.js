const Hoek = require('hoek');
const bookshelf = require('../../lib/bookshelf');

module.exports = () => ({
  async fetchTemplate(clientId, page) {
    Hoek.assert(clientId, new Error('clientId is required in ThemeService::fetchTemplate'));

    const client = await bookshelf.model('client')
      .where({client_id: clientId})
      .fetch();

    // scenario 1, client has null theme
    if (!client.get('theme_id')) return false;

    // scenario 2, client has theme but null template
    const template = await bookshelf.model('template').where({
      theme_id: client.get('theme_id'),
      name: page,
    }).fetch({withRelated: ['layout']});

    return template || false;
  },

  async getThemedTemplate(clientId, page, context) {
    Hoek.assert(clientId, new Error('clientId is required in ThemeService::getThemedTemplate'));
    const template = await this.fetchTemplate(clientId, page);
    if (!template) return false;

    const renderedTemplate = await template.render(page, context);

    return {
      template,
      renderedTemplate,
    };
  },

  async renderThemedTemplate(clientId, page, context) {
    Hoek.assert(clientId, new Error('clientId is required in ThemeService::renderThemedTemplate'));

    const template = await this.fetchTemplate(clientId, page);
    if (!template) return false;

    const renderedTemplate = await template.render(page, context);
    return renderedTemplate;
  }
});

module.exports['@singleton'] = true;
module.exports['@require'] = [];
