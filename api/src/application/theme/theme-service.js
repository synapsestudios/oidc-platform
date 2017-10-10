const handlebars = require('handlebars');
const fs = require('fs');
const { promisify } = require('util');

const defaultLayouts = {
  'end_session': 'default.hbs',
  'forgot-password-success': 'default.hbs',
  'forgot-password': 'default.hbs',
  'interaction': 'default.hbs',
  'login': 'default.hbs',
  'reset-password-success': 'default.hbs',
  'reset-password': 'default.hbs',
  'user-profile': 'default.hbs',
  'user-registration': 'default.hbs',
  'forgot-password-email': 'email.hbs',
  'invite-email': 'email.hbs',
}

module.exports = bookshelf => ({
  async renderThemedTemplate(clientId, page, context) {
    const client = await bookshelf.model('client')
      .where({client_id: clientId})
      .fetch({ withRelated: ['theme.templates.layout'] });

    // scenario 1, client has null theme
    if (!client.get('theme_id')) return false;

    // scenario 2, client has theme but null template
    const template = client.related('theme').related('templates').find(template => template.get('name') === page);
    if (!template) return false;

    let layoutTemplate;
    if (!template.get('layout_id')) {
      // scenario 3, client has theme and template but null layout
      const readFileAsync = promisify(fs.readFile);
      console.log(defaultLayouts[page]);
      const code = await readFileAsync(`./templates/layout/${defaultLayouts[page]}`);
      layoutTemplate = handlebars.compile(code.toString());
    } else {
      // scenario 4, client has theme and template and layout
      layoutTemplate = handlebars.compile(template.related('layout').get('code'));
    }

    const pageTemplate = handlebars.compile(template.get('code'));
    const layoutContext = Object.assign({}, context, { content: pageTemplate(context) });
    return layoutTemplate(layoutContext);
  }
});

module.exports['@singleton'] = true;
module.exports['@require'] = [
  'bookshelf',
];
