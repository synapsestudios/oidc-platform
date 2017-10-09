module.exports = (bookshelf) => ({
  tableName: 'SIP_template',
  idAttribute: false,

  layout() {
    return this.belongsTo('layout', 'layout_id');
  },
});
