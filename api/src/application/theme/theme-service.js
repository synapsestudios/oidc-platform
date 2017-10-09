const handlebars = require('handlebars');

const layout = `
<div>
  Layout
  <div>{{{content}}}</div>
</div>
`

module.exports = bookshelf => ({
  async renderThemedTemplate(clientId, page, context) {
    const client = await bookshelf.model('client')
      .where({client_id: clientId})
      .fetch({ withRelated: ['theme.templates'] });

    // scenario 1, client has null theme
    if (!client.get('theme_id')) return false;

    // scenario 2, client has theme but null template
    const template = client.related('theme').related('templates').find(template => template.get('name') === page);
    if (!template) return false;

    // scenario 3, client has theme and template but null layout

    // scenario 4, client has theme and template and layout
    const layoutTemplate = handlebars.compile(layout);
    const pageTemplate = handlebars.compile(template.get('code'));

    const layoutContext = Object.assign({}, context, { content: pageTemplate(context) });
    return layoutTemplate(layoutContext);
  }
});

module.exports['@singleton'] = true;
module.exports['@require'] = [
  'bookshelf',
];
