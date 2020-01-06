const Handlebars = require("handlebars");

Handlebars.registerHelper("ifEq", function(v1, v2, options) {
  if (v1 === v2) {
    return options.fn(this);
  }
  return options.inverse(this);
});

Handlebars.registerHelper("ifStartsWith", function(v1, v2, options) {
  if (v1.startsWith(v2)) {
    return options.fn(this);
  }
  return options.inverse(this);
});

module.exports = Handlebars;
