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
