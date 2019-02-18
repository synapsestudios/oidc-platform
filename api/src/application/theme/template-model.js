const handlebars = require('handlebars');
const fs = require('fs');
const { promisify } = require('util');
const defaultLayouts = require('./defaultLayouts');

module.exports = () => ({
  tableName: 'SIP_template',
  idAttribute: false,

  layout() {
    return this.belongsTo('layout', 'layout_id');
  },

  async render(page, context) {
    let layoutTemplate;
    if (!this.get('layout_id')) {
      // scenario 3, client has theme and template but null layout
      const readFileAsync = promisify(fs.readFile);
      const code = await readFileAsync(`./templates/layout/${defaultLayouts[page]}`);
      layoutTemplate = handlebars.compile(code.toString());
    } else {
      // scenario 4, client has theme and template and layout
      layoutTemplate = handlebars.compile(this.related('layout').get('code'));
    }

    const pageTemplate = handlebars.compile(this.get('code'));
    const layoutContext = Object.assign({}, context, { content: pageTemplate(context) });
    return layoutTemplate(layoutContext);
  },
});
