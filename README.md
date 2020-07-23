JavaScript implementation of [Bitcoin BIP39](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki): Mnemonic code for generating deterministic keys

# INSTALL
To install the package, just run

```
npm i bip39js
```

# EXAMPLE
```javascript
const bip39 = require('bip39js');

const size = 128; // 12 words
const entropy = bip39.genEntropy(size);
const mnemonic = bip39.genMnemonic(entropy);
console.log(mnemonic);
console.log('Valid? -', bip39.validMnemonic(mnemonic));
console.log('Seed:', bip39.mnemonicToSeedSync(mnemonic, 'TREZOR').toString('hex'));
```
What can you do with the seed? You can use the generate seed as master node ([BIP44](https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki)) to generate a deterministic wallet.

# Word length
The following table describes the relation between the bit size and the length of the generated mnemonic sentence (MS) in words.
```
|  Size |  MS  |
+-------+------+
|  128  |  12  |
|  160  |  15  |
|  192  |  18  |
|  224  |  21  |
|  256  |  24  |
```

# TEST
```
npm test
```
Test vecots taken from [Trezor Python Mnemonic](https://github.com/trezor/python-mnemonic/blob/master/vectors.json).
Password to generate seed is 'TREZOR'.

# License
MIT