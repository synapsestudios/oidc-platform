const FactoryGirl = require('factory-girl');

const initializeUserFactory = require('./user');

const factory = FactoryGirl.factory;
const adapter = new FactoryGirl.BookshelfAdapter();
factory.setAdapter(adapter);

initializeUserFactory(factory);

module.exports = factory;
