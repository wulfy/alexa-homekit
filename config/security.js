const crypto = require('crypto');
const {CRYPTOPASS} = require('./constants');
const {prodLogger, debugLogger} = require('./logger.js');

// Replicates OpenSSL EVP_BytesToKey (MD5, no salt) used by the removed crypto.createCipher
function evpBytesToKey(password, keyLen, ivLen) {
	const pass = Buffer.from(password);
	let derived = Buffer.alloc(0);
	let prev = Buffer.alloc(0);
	while (derived.length < keyLen + ivLen) {
		prev = crypto.createHash('md5').update(Buffer.concat([prev, pass])).digest();
		derived = Buffer.concat([derived, prev]);
	}
	return { key: derived.slice(0, keyLen), iv: derived.slice(keyLen, keyLen + ivLen) };
}

const { key, iv } = evpBytesToKey(CRYPTOPASS, 24, 16);

exports.encrypt = (data) => {
	const toSave = JSON.stringify(data);
	const cipher = crypto.createCipheriv('aes-192-cbc', key, iv);
	let encrypted = cipher.update(toSave, 'utf8', 'hex');
	encrypted += cipher.final('hex');
	return encrypted;
}

exports.decrypt = (encryptedData) => {
	const decipher = crypto.createDecipheriv('aes-192-cbc', key, iv);
	prodLogger("START DECRYPT")
	debugLogger(encryptedData);
	let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
	debugLogger("configured")
	decrypted += decipher.final('utf8');
	prodLogger("final")
	debugLogger(decrypted);
	return decrypted;
}