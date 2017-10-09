module.exports = bookshelf => ({
  tableName: 'SIP_theme',
  idAttribute: 'id',

  templates() {
    return this.hasMany('template', 'theme_id')
  }
});
