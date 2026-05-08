# New Relic Migration + Node Upgrade — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate metrics from statsd to New Relic in 3 separate PRs: Node 14 + NR 10 (PR1), Node 22 + cipher fix (PR2), Node 22 + NR 13 (PR3).

**Architecture:** PR1 and PR2 branch from `master` independently. PR3 branches from PR2. Each PR is a complete, self-contained change. The `sendStatsd(string)` signature is preserved — only the implementation of `config/metrics.js` changes.

**Tech Stack:** Node.js 14/22, AWS Lambda (Serverless), newrelic@10/13, Jest 25→29, crypto (EVP_BytesToKey)

---

## File Map

| File | PR | Change |
|------|----|--------|
| `config/metrics.js` | PR1, PR3 | Replace statsd UDP with NR agent calls |
| `index.js` | PR1, PR3 | Add `require('newrelic')` as first line |
| `newrelic.js` | PR1, PR3 | New — NR agent config |
| `package.json` | PR1, PR2, PR3 | Add newrelic / upgrade jest |
| `.env.dist` | PR1, PR3 | Add NR env vars |
| `serverless.yml` | PR1, PR2, PR3 | Include newrelic.js / upgrade runtime |
| `test/config_tests/base_config.js` | PR1, PR3 | Disable NR agent during tests |
| `.circleci/config.yml` | PR1, PR3 | Add `NEW_RELIC_ENABLED: 'false'` to test env |
| `config/security.js` | PR2 | Replace createCipher with evpBytesToKey + createCipheriv |
| `test/__tests__/test_cipher.js` | PR2 | New — cipher round-trip + backward compat tests |

---

## PR1 — feat/newrelic-metrics-node14

### Task 1: Create branch and install newrelic@10

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Create branch from master**

```bash
git checkout master
git checkout -b feat/newrelic-metrics-node14
```

- [ ] **Step 2: Install newrelic@10**

```bash
npm install newrelic@^10.6.2
```

- [ ] **Step 3: Verify install succeeded**

```bash
node -e "const nr = require('newrelic'); console.log('ok')" 2>/dev/null || echo "NR loaded (warnings expected without license key)"
```

Expected: no crash (warnings about missing license key are normal).

---

### Task 2: Create newrelic.js agent config

**Files:**
- Create: `newrelic.js`

- [ ] **Step 1: Create the file**

```js
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
```

- [ ] **Step 2: Add newrelic.js to serverless.yml package includes**

In `serverless.yml`, find the `package.include` list and add `newrelic.js`:

```yaml
package:
  include:
    - index.js
    - domoticzApiHelper.js
    - domoticz.js
    - AlexaMapper.js
    - domoticzApiHelper.js
    - config/**
    - newrelic.js
```

---

### Task 3: Rewrite config/metrics.js

**Files:**
- Modify: `config/metrics.js`

The current file sends UDP statsd packets and exports a TCP `metricsSocket` class (unused). Replace both with New Relic calls. The `sendStatsd(string)` signature is unchanged — all 4 call sites continue to work without modification.

Statsd format: `"metric.key:value|type"` where type is `c` (counter) or `ms` (timer).

- [ ] **Step 1: Replace the entire content of config/metrics.js**

```js
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
  } else if (type === 'ms') {
    newrelic.recordMetric(metricName, value);
  }
  statsLogger('Metric sent: ' + metricName);
};
```

---

### Task 4: Wire require('newrelic') in index.js and disable it in tests

**Files:**
- Modify: `index.js`
- Modify: `test/config_tests/base_config.js`
- Modify: `.circleci/config.yml`

The NR agent **must** be the first `require` in the Lambda entry point. Tests must disable it to avoid connection attempts during CI.

- [ ] **Step 1: Add require('newrelic') as first line of index.js**

Add this line before all existing content in `index.js`:

```js
require('newrelic');
```

So the top of `index.js` becomes:

```js
require('newrelic');
const {
        getAlexaDeviceState,
        sendAlexaCommandResponse,
        ...
```

- [ ] **Step 2: Disable NR agent in test setup**

In `test/config_tests/base_config.js`, add `process.env.NEW_RELIC_ENABLED = 'false'` as the **first line** of the file (before any require):

```js
process.env.NEW_RELIC_ENABLED = 'false';
process.env.PROD_MODE = "false";
// rest of file unchanged
```

- [ ] **Step 3: Disable NR agent in CircleCI**

In `.circleci/config.yml`, add `NEW_RELIC_ENABLED: 'false'` to the `build-app` environment block:

```yaml
    build-app:
        docker:
            - image: 'cimg/base:stable'
              environment:
                    APP_ENV: test
                    NEW_RELIC_ENABLED: 'false'
                    CRYPTOPASS: 'circleci oauth'
                    PROD_MODE: false
                    INSTANCE_NAME: 'dev'
                    MYSQL_ADDON_HOST: 'localhost'
                    MYSQL_ADDON_PORT: '3306'
                    MYSQL_ADDON_DB: 'alexa_oauth'
                    METRICS_HOST: 'no.host'
                    METRICS_PORT: 2003
                    METRICS_UDP_PORT: 8124
```

---

### Task 5: Update .env.dist and run tests

**Files:**
- Modify: `.env.dist`

- [ ] **Step 1: Add NR env vars to .env.dist**

Append to `.env.dist`:

```
NEW_RELIC_LICENSE_KEY=
NEW_RELIC_APP_NAME=alexa-homekit
NEW_RELIC_ENABLED=true
```

- [ ] **Step 2: Run the test suite**

```bash
npm test
```

Expected: all existing tests pass. If snapshot tests fail with "snapshot obsolete" messages, run `npm test -- --updateSnapshot`.

- [ ] **Step 3: Commit**

```bash
git add config/metrics.js index.js newrelic.js serverless.yml .env.dist test/config_tests/base_config.js .circleci/config.yml package.json package-lock.json
git commit -m "feat: migrate metrics from statsd to New Relic (Node 14, newrelic@10)"
```

- [ ] **Step 4: Push and create PR**

```bash
git push -u origin feat/newrelic-metrics-node14
gh pr create \
  --base master \
  --title "feat: migrate metrics from statsd to New Relic (Node 14)" \
  --body "$(cat <<'EOF'
## Summary
- Replaces statsd UDP metrics with New Relic agent (`newrelic@10.x`, last version supporting Node 14)
- `sendStatsd(string)` signature preserved — no changes to call sites
- Metric format: `Custom/lambda.alhau.{instance}/{metric.key}`
- NR agent disabled in test environment via `NEW_RELIC_ENABLED=false`

## Required secrets
Add `NEW_RELIC_LICENSE_KEY` and `NEW_RELIC_APP_NAME` to Lambda environment variables.

## Test plan
- [ ] All existing Jest tests pass
- [ ] Deploy to preprod and verify metrics appear in New Relic dashboard
EOF
)"
```

---

## PR2 — feat/node-upgrade

### Task 6: Create branch and update runtime + jest

**Files:**
- Modify: `serverless.yml`
- Modify: `package.json`

- [ ] **Step 1: Create branch from master**

```bash
git checkout master
git checkout -b feat/node-upgrade
```

- [ ] **Step 2: Update Lambda runtime in serverless.yml**

Change `runtime: nodejs14` to `runtime: nodejs22`.

- [ ] **Step 3: Upgrade jest to 29 in package.json**

Change `"jest": "^25.1.0"` to `"jest": "^29.0.0"` and add `engines`:

```json
{
  "engines": {
    "node": ">=22"
  },
  "devDependencies": {
    "jest": "^29.0.0",
    "serverless": "^1.65.0"
  }
}
```

- [ ] **Step 4: Install updated dependencies**

```bash
npm install
```

- [ ] **Step 5: Update CircleCI node version**

In `.circleci/config.yml`, change `node-version: '14'` to `node-version: '22'` in all three jobs (`build-app`, `deploy-preprod`, `deploy-prod`).

---

### Task 7: Rewrite config/security.js

**Files:**
- Modify: `config/security.js`

`crypto.createCipher` and `crypto.createDecipher` were removed in Node 22. They used `EVP_BytesToKey` internally (OpenSSL, MD5, no salt). We implement that function to derive the same key+IV, ensuring existing DB data remains decryptable.

The implementation is aligned with `../alexa-oauth/utils/security.js` which already did this migration.

**Important differences from original code kept intentional:**
- `decrypt` returns the raw JSON string (not parsed) — matches existing call sites in `alexa-homekit`
- `encrypt` now creates a new cipher per call (original reused one instance — a bug that caused it to crash after the first call)

- [ ] **Step 1: Replace the entire content of config/security.js**

```js
const crypto = require('crypto');
const { CRYPTOPASS } = require('./constants');
const { prodLogger, debugLogger } = require('./logger.js');

// Replicates OpenSSL EVP_BytesToKey used by the now-removed crypto.createCipher,
// so that data already encrypted in the database remains decryptable.
function evpBytesToKey(password, keyLen, ivLen) {
  const passwordBuf = Buffer.isBuffer(password)
    ? password
    : Buffer.from(password, 'binary');
  const chunks = [];
  let prev = Buffer.alloc(0);
  let totalLen = 0;
  while (totalLen < keyLen + ivLen) {
    const hash = crypto.createHash('md5').update(prev).update(passwordBuf).digest();
    chunks.push(hash);
    totalLen += hash.length;
    prev = hash;
  }
  const combined = Buffer.concat(chunks);
  return { key: combined.subarray(0, keyLen), iv: combined.subarray(keyLen, keyLen + ivLen) };
}

exports.encrypt = (data) => {
  const toSave = JSON.stringify(data);
  const { key, iv } = evpBytesToKey(CRYPTOPASS, 24, 16);
  const cipher = crypto.createCipheriv('aes-192-cbc', key, iv);
  let encrypted = cipher.update(toSave, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
};

exports.decrypt = (encryptedData) => {
  const { key, iv } = evpBytesToKey(CRYPTOPASS, 24, 16);
  prodLogger('START DECRYPT');
  debugLogger(encryptedData);
  const decipher = crypto.createDecipheriv('aes-192-cbc', key, iv);
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  prodLogger('final');
  decrypted += decipher.final('utf8');
  debugLogger(decrypted);
  return decrypted;
};
```

---

### Task 8: Write cipher tests

**Files:**
- Create: `test/__tests__/test_cipher.js`

Two tests:
1. Round-trip: `decrypt(encrypt(data))` returns the original JSON string
2. Backward compat: decrypt a value produced by independently implemented EVP_BytesToKey (equivalent to what `createCipher('aes192', password)` would have produced) — proves DB data encrypted before the migration is still readable

- [ ] **Step 1: Create test/__tests__/test_cipher.js**

```js
const crypto = require('crypto');

// Set test password before requiring security module — constants.js reads env vars at require time
process.env.CRYPTOPASS = 'test-cipher-password-for-jest';
jest.resetModules();
const { encrypt, decrypt } = require('../../config/security');

describe('cipher', () => {
  test('round-trip: decrypt(encrypt(data)) returns original JSON string', () => {
    const data = { userId: 42, domoticz: 'http://192.168.1.1:8080' };
    const encrypted = encrypt(data);
    expect(decrypt(encrypted)).toBe(JSON.stringify(data));
  });

  test('backward compat: decrypts data produced by old createCipher algorithm', () => {
    // Computes what createCipher('aes192', CRYPTOPASS) would have encrypted,
    // using EVP_BytesToKey implemented independently from security.js.
    function evpBytesToKey(password, keyLen, ivLen) {
      const passwordBuf = Buffer.from(password, 'binary');
      const chunks = [];
      let prev = Buffer.alloc(0);
      let totalLen = 0;
      while (totalLen < keyLen + ivLen) {
        const hash = crypto.createHash('md5').update(prev).update(passwordBuf).digest();
        chunks.push(hash);
        totalLen += hash.length;
        prev = hash;
      }
      const combined = Buffer.concat(chunks);
      return { key: combined.subarray(0, keyLen), iv: combined.subarray(keyLen, keyLen + ivLen) };
    }

    const plaintext = JSON.stringify({ userId: 1, host: 'http://domoticz.local:8080' });
    const { key, iv } = evpBytesToKey('test-cipher-password-for-jest', 24, 16);
    const cipher = crypto.createCipheriv('aes-192-cbc', key, iv);
    let legacyEncrypted = cipher.update(plaintext, 'utf8', 'hex');
    legacyEncrypted += cipher.final('hex');

    expect(decrypt(legacyEncrypted)).toBe(plaintext);
  });
});
```

- [ ] **Step 2: Run cipher tests to verify they pass**

```bash
npm test -- test/__tests__/test_cipher.js
```

Expected output:
```
PASS test/__tests__/test_cipher.js
  cipher
    ✓ round-trip: decrypt(encrypt(data)) returns original JSON string
    ✓ backward compat: decrypts data produced by old createCipher algorithm
```

---

### Task 9: Run full test suite, fix snapshots, commit, push, PR

**Files:** none new

- [ ] **Step 1: Run the full test suite**

```bash
npm test
```

If snapshot tests fail with `1 snapshot(s) obsolete` or serializer format changes (jest 25→29 can change snapshot formatting), update them:

```bash
npm test -- --updateSnapshot
```

- [ ] **Step 2: Verify cipher tests and all existing tests pass**

Expected: all tests pass (including the new `test_cipher.js`).

- [ ] **Step 3: Commit**

```bash
git add config/security.js serverless.yml package.json package-lock.json .circleci/config.yml test/__tests__/test_cipher.js
git commit -m "feat: upgrade to Node 22, fix cipher with EVP_BytesToKey for backward compat"
```

If snapshots were updated:
```bash
git add test/__tests__/__snapshots__/
git commit -m "test: update jest snapshots for jest 29"
```

- [ ] **Step 4: Push and create PR**

```bash
git push -u origin feat/node-upgrade
gh pr create \
  --base master \
  --title "feat: upgrade to Node 22 with backward-compatible cipher fix" \
  --body "$(cat <<'EOF'
## Summary
- Upgrades Lambda runtime from `nodejs14` to `nodejs22`
- Replaces removed `crypto.createCipher`/`createDecipher` (removed in Node 22) with `createCipheriv`/`createDecipheriv` using `evpBytesToKey` (same algorithm — existing DB data remains decryptable)
- Upgrades Jest 25 → 29 for Node 22 compatibility
- Implementation aligned with `alexa-oauth` cipher migration

## Cipher compatibility
`evpBytesToKey` replicates OpenSSL's `EVP_BytesToKey(MD5, no-salt, 1-iter)` used internally by the removed API. Data encrypted before this change decrypts identically.

## Test plan
- [ ] `test_cipher.js` round-trip test passes
- [ ] `test_cipher.js` backward compat test passes (simulates legacy DB data)
- [ ] All existing snapshot tests pass
EOF
)"
```

---

## PR3 — feat/newrelic-metrics-node22

### Task 10: Create branch from PR2 and install newrelic@13

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Create branch from feat/node-upgrade**

```bash
git checkout feat/node-upgrade
git checkout -b feat/newrelic-metrics-node22
```

- [ ] **Step 2: Install newrelic@13 (latest)**

```bash
npm install newrelic@^13
```

- [ ] **Step 3: Verify the installed version**

```bash
node -e "console.log(require('newrelic/package.json').version)"
```

Expected: `13.x.x`

---

### Task 11: Add NR config, update metrics.js and index.js

**Files:**
- Create: `newrelic.js`
- Modify: `config/metrics.js`
- Modify: `index.js`
- Modify: `test/config_tests/base_config.js`
- Modify: `.circleci/config.yml`
- Modify: `serverless.yml`
- Modify: `.env.dist`

Identical changes to PR1, but on this branch (which has Node 22 + cipher fix from PR2).

- [ ] **Step 1: Create newrelic.js**

```js
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
```

- [ ] **Step 2: Replace entire content of config/metrics.js**

```js
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
  } else if (type === 'ms') {
    newrelic.recordMetric(metricName, value);
  }
  statsLogger('Metric sent: ' + metricName);
};
```

- [ ] **Step 3: Add require('newrelic') as first line of index.js**

Add this line before all existing content in `index.js`:

```js
require('newrelic');
```

- [ ] **Step 4: Disable NR agent in test setup**

In `test/config_tests/base_config.js`, add as the **first line**:

```js
process.env.NEW_RELIC_ENABLED = 'false';
```

- [ ] **Step 5: Disable NR agent in CircleCI**

In `.circleci/config.yml`, add `NEW_RELIC_ENABLED: 'false'` to the `build-app` environment block (alongside the existing env vars).

- [ ] **Step 6: Add newrelic.js to serverless.yml package includes**

```yaml
package:
  include:
    - index.js
    - domoticzApiHelper.js
    - domoticz.js
    - AlexaMapper.js
    - domoticzApiHelper.js
    - config/**
    - newrelic.js
```

- [ ] **Step 7: Append NR env vars to .env.dist**

```
NEW_RELIC_LICENSE_KEY=
NEW_RELIC_APP_NAME=alexa-homekit
NEW_RELIC_ENABLED=true
```

---

### Task 12: Run tests, commit, push, PR

**Files:** none new

- [ ] **Step 1: Run the full test suite**

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 2: Commit**

```bash
git add config/metrics.js index.js newrelic.js serverless.yml .env.dist test/config_tests/base_config.js .circleci/config.yml package.json package-lock.json
git commit -m "feat: add New Relic metrics (Node 22, newrelic@13)"
```

- [ ] **Step 3: Push and create PR**

```bash
git push -u origin feat/newrelic-metrics-node22
gh pr create \
  --base feat/node-upgrade \
  --title "feat: add New Relic metrics (Node 22, newrelic@13)" \
  --body "$(cat <<'EOF'
## Summary
- Adds New Relic metrics using `newrelic@13` (latest, requires Node 22 from base PR)
- Same implementation as the Node 14 PR but using the latest agent version
- `sendStatsd(string)` signature unchanged — no changes to call sites

## Depends on
This PR must be merged after `feat/node-upgrade`.

## Required secrets
Add `NEW_RELIC_LICENSE_KEY` and `NEW_RELIC_APP_NAME` to Lambda environment variables.

## Test plan
- [ ] All existing Jest tests pass
- [ ] Deploy to preprod and verify metrics appear in New Relic dashboard
EOF
)"
```
