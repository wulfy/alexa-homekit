require('dotenv').config();
const { METRICS_BASE } = require('./constants');
const { statsLogger } = require('./logger.js');
const newrelic = require('newrelic');

exports.sendStatsd = (data) => {
  const colonIdx = data.lastIndexOf(':');
  if (colonIdx === -1) return;
  const metricKey = data.substring(0, colonIdx);
  const rest = data.substring(colonIdx + 1);
  const pipeIdx = rest.indexOf('|');
  if (pipeIdx === -1) return;
  const value = parseFloat(rest.substring(0, pipeIdx));
  const type = rest.substring(pipeIdx + 1);
  const metricName = 'Custom/' + METRICS_BASE + '/' + metricKey;

  if (type === 'c') {
    newrelic.incrementMetric(metricName, value);
    statsLogger('Metric sent: ' + metricName);
  } else if (type === 'ms') {
    newrelic.recordMetric(metricName, value);
    statsLogger('Metric sent: ' + metricName);
  } else {
    statsLogger('Unknown metric type, dropped: ' + data);
  }
};
