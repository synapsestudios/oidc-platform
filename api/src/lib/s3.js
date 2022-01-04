const aws = require('aws-sdk');

module.exports = new aws.S3({ apiVersion: '2006-03-01' });
