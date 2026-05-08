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
  }
}
