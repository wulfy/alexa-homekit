const createDebug = require('debug')
createDebug.formatters.h = (v) => {
  return JSON.stringify(v);
};

exports.prodLogger = createDebug('prod');
exports.debugLogger = createDebug('debug');
exports.databaseLogger = createDebug('database');
exports.statsLogger = createDebug('stats');
exports.testLogger = createDebug('test');