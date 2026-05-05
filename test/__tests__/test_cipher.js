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
