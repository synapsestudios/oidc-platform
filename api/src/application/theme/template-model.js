const handlebars = require('handlebars');
const fs = require('fs');
const { promisify } = require('util');
const defaultLayouts = require('./defaultLayouts');

// const defaultLayouts = {
//   'end_session': 'default.hbs',
//   'forgot-password-success': 'default.hbs',
//   'forgot-password': 'default.hbs',
//   'interaction': 'default.hbs',
//   'login': 'default.hbs',
//   'reset-password-success': 'default.hbs',
//   'reset-password': 'default.hbs',
//   'user-profile': 'default.hbs',
//   'user-registration': 'default.hbs',
//   'change-password': 'default.hbs',
//   'email-settings': 'default.hbs',
//   'email-verify-success': 'default.hbs',

//   'forgot-password-email': 'email.hbs',
//   'invite-email': 'email.hbs',
//   'change-password-success-email': 'email.hbs',
//   'email-verify-email': 'email.hbs',
//   'change-email-verify-email': 'email.hbs',
//   'change-email-alert-email': 'email.hbs',
// };

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
