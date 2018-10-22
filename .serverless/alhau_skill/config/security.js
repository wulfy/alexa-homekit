const crypto = require('crypto');
const {CRYPTOPASS} = require('./constants');
const cipher = crypto.createCipher('aes192', CRYPTOPASS);


exports.encrypt = (data) => {
	const toSave = JSON.stringify(data);
	let encrypted = cipher.update(toSave, 'utf8', 'hex');
	encrypted += cipher.final('hex');
	return encrypted;
}

exports.decrypt = (encryptedData) => {
	const decipher = crypto.createDecipher('aes192', CRYPTOPASS);
	console.log("START DECRYPT")
	console.log(encryptedData);
	let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
	console.log("configured")
	decrypted += decipher.final('utf8');
	console.log("final")
	console.log(decrypted);
	return decrypted;
}