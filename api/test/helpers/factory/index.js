const FactoryGirl = require('factory-girl');

const initializeUserFactory = require('./user');
const initializeClientFactory = require('./client');

const factory = FactoryGirl.factory;
const adapter = new FactoryGirl.BookshelfAdapter();
factory.setAdapter(adapter);

initializeUserFactory(factory);
initializeClientFactory(factory);

module.exports = factory;
