const crypto = require('crypto');
const {CRYPTOPASS} = require('./constants');
const {prodLogger, debugLogger} = require('./logger.js');

const ALGORITHM = 'aes-256-gcm';
const KEY_LEN = 32;
const IV_LEN = 12;
const SALT_LEN = 16;

function deriveKey(salt) {
    return crypto.scryptSync(CRYPTOPASS, salt, KEY_LEN);
}

exports.encrypt = (data) => {
    const toSave = JSON.stringify(data);
    const salt = crypto.randomBytes(SALT_LEN);
    const iv = crypto.randomBytes(IV_LEN);
    const key = deriveKey(salt);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(toSave, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    return [salt.toString('hex'), iv.toString('hex'), authTag.toString('hex'), encrypted].join(':');
}

exports.decrypt = (encryptedData) => {
    prodLogger("START DECRYPT");
    debugLogger(encryptedData);
    const parts = encryptedData.split(':');
    const salt = Buffer.from(parts[0], 'hex');
    const iv = Buffer.from(parts[1], 'hex');
    const authTag = Buffer.from(parts[2], 'hex');
    const ciphertext = parts[3];
    const key = deriveKey(salt);
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
    debugLogger("configured");
    decrypted += decipher.final('utf8');
    prodLogger("final");
    debugLogger(decrypted);
    return decrypted;
}
