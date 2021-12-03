const sinon = require('sinon');
const Confidence = require('confidence');

module.exports = {
  async stubConfig(getStub, loadStub) {
    const stub = sinon.stub(Confidence, 'Store').returns({
        get: getStub,
        load: loadStub
    });
    return stub;
  }
}
