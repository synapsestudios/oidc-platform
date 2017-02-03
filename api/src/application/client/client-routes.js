module.exports = (bookshelf) => {
  return [];
};

module.exports['@singleton'] = true;
module.exports['@require'] = [
  'bookshelf',

  //model registration
  'client/client-model',
  'client/client-contact-model',
  'client/client-default-acr-value-model',
  'client/client-grant-model',
  'client/client-post-logout-redirect-uri-model',
  'client/client-redirect-uri-model',
  'client/client-request-uri-model',
  'client/client-response-type-model',
];
