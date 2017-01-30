module.exports = (bookshelf) => {
  return [];
};

module.exports['@singleton'] = true;
module.exports['@require'] = [
  'bookshelf',

  //model registration
  'client/client-model',
  'client/client-contact-model',
  'client/client-grant-model',
  'client/client-redirect-uri-model',
];
