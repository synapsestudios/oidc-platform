#! /usr/bin/env node
var config       = require('../../../config');
var hapiEmailKue = require('hapi-email-kue');

hapiEmailKue.process(config('/email'));
