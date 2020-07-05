JavaScript implementation of [Bitcoin BIP39](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki): Mnemonic code for generating deterministic keys


# EXAMPLE
```javascript
const size = 128;
const entropy = genEntropy(size)
const mnemonic = genMnemonic(entropy);
console.log(mnemonic);
console.log('Valid? -', validMnemonic(mnemonic));
console.log('Seed:', mnemonicToSeedSync(mnemonic, 'TREZOR').toString('hex'));
```

# TEST
```
npm test
```
Test vecots taken from [Trezor Python Mnemonic](https://github.com/trezor/python-mnemonic/blob/master/vectors.json).
Password to generate seed is 'TREZOR'.