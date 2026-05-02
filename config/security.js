const crypto = require('crypto');
const {CRYPTOPASS} = require('./constants');
const {prodLogger, debugLogger} = require('./logger.js');
const cipher = crypto.createCipher('aes192', CRYPTOPASS);


exports.encrypt = (data) => {
	const toSave = JSON.stringify(data);
	let encrypted = cipher.update(toSave, 'utf8', 'hex');
	encrypted += cipher.final('hex');
	return encrypted;
}

exports.decrypt = (encryptedData) => {
	const decipher = crypto.createDecipher('aes192', CRYPTOPASS);
	prodLogger("START DECRYPT")
	debugLogger(encryptedData);
	let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
	debugLogger("configured")
	decrypted += decipher.final('utf8');
	prodLogger("final")
	debugLogger(decrypted);
	return decrypted;
}