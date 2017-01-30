var ioc = require('electrolyte');

ioc.use(ioc.dir('src/application'));
ioc.use(ioc.dir('src/bin'));
ioc.use(ioc.dir('src/lib'));

module.exports = ioc;
