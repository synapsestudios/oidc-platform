const FactoryGirl = require('factory-girl');

const initializeUserFactory = require('./user');
const initializeClientFactory = require('./client');
const initializeClientRedirectUriFactory = require('./clientRedirectUri');
const initializeEmailTokenFactory = require('./emailToken');

const factory = FactoryGirl.factory;
const adapter = new FactoryGirl.BookshelfAdapter();
factory.setAdapter(adapter);

initializeUserFactory(factory);
initializeClientFactory(factory);
initializeClientRedirectUriFactory(factory);
initializeEmailTokenFactory(factory);

module.exports = factory;
