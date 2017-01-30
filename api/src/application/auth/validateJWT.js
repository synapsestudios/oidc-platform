module.exports = (bookshelf) => {
  return (decoded, request, cb) => {
    cb(null, true);
  };
};

module.exports['@singleton'] = true;
