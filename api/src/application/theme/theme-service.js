const handlebars = require('handlebars');

const layout = `
<div>
  Layout
  <div>{{{content}}}</div>
</div>
`

const login = `
<div>LOGIN</div>
`

class ThemeService {
  constructor(bookshelf) {
    this.bookshelf = bookshelf;
  }

  /*
   * FUTURE AARON:
   *
   * In order for this to work you need to stop loading models with routes
   * and switch to loading all the models with the bookshelf module.
   *
   * You can't guarantee everything's loaded correctly in every context.
   */


  async renderThemedTemplate(clientId, page, context) {
    // scenario 1, client has null theme
    // scenario 2, client has theme but null template
    // scenario 3, client has theme and template but null layout
    // scenario 4, client has theme and template and layout

    const layoutTemplate = handlebars.compile(layout);
    const loginTemplate = handlebars.compile(login);

    const layoutContext = Object.assign({}, context, { content: loginTemplate(context) });
    return layoutTemplate(layoutContext);
  }
}

module.exports = ThemeService;
module.exports['@singleton'] = true;
module.exports['@require'] = [
  'bookshelf',

  'theme/theme-model',
];
