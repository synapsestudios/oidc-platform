const Lab = require('@hapi/lab');
const Code = require('@hapi/code');

const { describe, it, afterEach } = (exports.lab = Lab.script());
const { expect } = Code;
const { PassThrough } = require('stream');

const streamToString = require('../../../src/lib/stream-to-string');

describe('stream-to-string function', () => {
  let mockReadableStream;

  afterEach(async () => {
    mockReadableStream.push(null);
  });

  it(`accepts a data stream and returns the expected data`, async () => {
    mockReadableStream = new PassThrough({
      objectMode: true,
      read: function (size) {
        this.push('Good morning!');
        return this.push(null);
      },
    });
    const result = await streamToString(mockReadableStream);
    expect(result).to.equal('Good morning!');
  });

  it(`rejects if a stream error is encountered`, async () => {
    mockReadableStream = new PassThrough({
      objectMode: true,
      read: function (size) {
        this.push('Good morn...');
        this.emit('error', new Error('Stream crossed...'));
        this.push(null);
        return;
      },
    });
    await expect(streamToString(mockReadableStream)).to.reject(
      Error,
      'Stream crossed...'
    );
  });

  it(`rejects if a non-stream object is provided`, async () => {
    await expect(streamToString('notAStream')).to.reject(
      Error,
      'readableStream.on is not a function'
    );
  });
});
