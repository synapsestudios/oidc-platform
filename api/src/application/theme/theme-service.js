const Hoek = require('hoek');
const bookshelf = require('../../lib/bookshelf');
const fs = require('fs');
const handlebars = require('handlebars');
const { promisify } = require('util');
const defaultLayouts = require('./defaultLayouts');

module.exports = () => ({
  async fetchTemplate(page, clientId) {
    Hoek.assert(clientId, new Error('clientId is required in ThemeService::fetchTemplate'));

    let themeId = null;

    if (clientId) {
      const client = await bookshelf.model('client')
        .where({client_id: clientId})
        .fetch();
      themeId = client.get('theme_id');
    }

    // determine theme
    if (!themeId) {
      // is there a system theme configured?
      const systemTheme = await bookshelf.model('theme').where({
        system: true,
      }).fetch();

      if (systemTheme) {
        themeId = systemTheme.get('id');
      }
    }

    // scenario 1, there is no configured theme
    if (!themeId) return false;

    // scenario 2, client has theme but null template
    const template = await bookshelf.model('template').where({
      theme_id: themeId,
      name: page,
    }).fetch({withRelated: ['layout']});

    return template || false;
  },

  async getThemedTemplate(page, context, clientId) {
    const template = await this.fetchTemplate(page, clientId);

    let renderedTemplate;
    if (!template) {
      const readFileAsync = promisify(fs.readFile);
      const layoutCode = await readFileAsync(`./templates/layout/${defaultLayouts[page]}`);
      const layoutTemplate = handlebars.compile(layoutCode.toString());
      const templateCode = await readFileAsync(`./templates/${page}.hbs`);
      const pageTemplate = handlebars.compile(templateCode.toString());
      const layoutContext = Object.assign({}, context, { content: pageTemplate(context) });
      renderedTemplate = layoutTemplate(layoutContext);
    } else {
      renderedTemplate = await template.render(page, context);
    }

    return {
      template,
      renderedTemplate,
    };
  },

  async renderThemedTemplate(page, context, clientId) {
    const { renderedTemplate } = await this.getThemedTemplate(page, context, clientId);
    return renderedTemplate;
  }
});

module.exports['@singleton'] = true;
module.exports['@require'] = [];
