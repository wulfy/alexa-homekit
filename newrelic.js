'use strict'
exports.config = {
  app_name: [process.env.NEW_RELIC_APP_NAME || 'alexa-homekit'],
  license_key: process.env.NEW_RELIC_LICENSE_KEY || '',
  enabled: process.env.NEW_RELIC_ENABLED !== 'false',
  logging: {
    level: 'info'
  },
  distributed_tracing: {
    enabled: true
  },
  // Required for AWS Lambda. The default background harvest cycle never fires
  // (Lambda freezes the process between invocations) so the NR Lambda Extension
  // bundled in the NewRelicNodeJS22X layer must flush telemetry synchronously
  // at the end of each invocation.
  serverless_mode: {
    enabled: true
  }
}
