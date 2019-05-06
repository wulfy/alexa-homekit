exports.prodLogger = require('debug')('prod');
exports.debugLogger = require('debug')('debug').formatters.h = (v) => {
  return JSON.stringify(v);
};
exports.databaseLogger = require('debug')('database');
exports.statsLogger = require('debug')('stats');
exports.testLogger = require('debug')('test');