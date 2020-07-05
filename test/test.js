const fs = require('fs');
const assert = require('assert');
const bip39 = require('../bip39.js');

const rawData = fs.readFileSync('./test/test_vector.json');
const testVector = JSON.parse(rawData);
const PASSWORD = 'TREZOR';

describe('Array', function() {
  testVector.english.forEach(function(entry) {
    describe('checking entropy: ' + entry[0], function() {
      it('check mnemonic generation against test vector', function() {
        const mnemonic = bip39.genMnemonic(
            Buffer.from(entry[0], 'hex'),
        );
        const seed = bip39.mnemonicToSeedSync(mnemonic, PASSWORD);
        assert.equal(mnemonic, entry[1]);
        assert.equal(seed.toString('hex'), entry[2]);
      });
    });
  });
});
