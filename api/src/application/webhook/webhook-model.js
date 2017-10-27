module.exports = bookshelf => ({
  tableName: 'SIP_webhook',

  events() {
    return this.hasMany('webhook_event', 'webhook_id');
  }
});
