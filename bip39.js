const crypto = require('crypto');
const pbkdf2 = require('pbkdf2');
const wordList = require('./english.js');


module.exports = {
  genEntropy: genEntropy,
  genMnemonic: genMnemonic,
  validMnemonic: validMnemonic,
  mnemonicToSeedSync: mnemonicToSeedSync,
};

/**
 * Adding a padding on the left side
 * @param {string} str which is padded
 * @param {string} padString the padding consists off
 * @param {number} length of the overall string
 * @return {string} the left padded string
 */
function lpad(str, padString, length) {
  while (str.length < length) {
    str = padString + str;
  }
  return str;
}

/**
 * Hashes the given data using sha256
 * @param {*} data - Data to be hashed
 * @return {Buffer} Hash digest
 */
function hashData(data) {
  const sha256 = crypto.createHash('sha256');
  return sha256.update(data).digest();
}

/**
 * Invalid size exception which is thrown if the size of the entropy is off
 * @param {string} message
 */
function InvalidSizeException(message) {
  this.message = message;
  this.name = 'InvalidSizeException';
}

/**
 * Takes an entropy and mappes the words
 * @param {*} checksummedEntropy - Entrupy with a checksum
 * @return {string} Mnemonic
 */
function mapWords(checksummedEntropy) {
  let mnemonic = '';
  for (let i = 0; i < checksummedEntropy.length; i += 11) {
    value = parseInt(checksummedEntropy.slice(i, (i+11)), 2);
    mnemonic += wordList.numberToWord[value] + ' ';
  }
  return mnemonic.trimRight();
}

/**
 * Checks if a given mnemonic is valid
 * @param {string} mnemonic
 * @return {boolean} True, if valid, false is invalid
 */
function validMnemonic(mnemonic) {
  mnemonic = mnemonic.split(' ');
  // remove empty string
  let binary = '';
  // mapping from word to bi
  for (const word of mnemonic) {
    bin = wordList.wordToNumber[word].toString(2);
    binary += lpad(bin, '0', 11);
  }
  const checksumLength = Math.floor(binary.length / 32);
  const checksum = binary.slice(binary.length - checksumLength);
  const values = [];
  // extracting byte by byte
  for (let i = 0; i < binary.length - checksumLength; i += 8) {
    value = parseInt(binary.slice(i, (i+8)), 2);
    values.push(value);
  }
  const hash = hashData(Buffer.from(values));
  let hashBinary = hash[0].toString(2);
  hashBinary += lpad(hashBinary, '0', 8);
  hashBinary = hashBinary.slice(0, checksumLength);
  if (hashBinary !== checksum) {
    return false;
  }
  return true;
}

/**
 * Generates a mnemonic from a given entropy
 * @param {*} entropy - Entropy to generate mnemonic from. Without entropy
 * @return {string} Mnemonic
 */
function genMnemonic(entropy) {
  const size = entropy.length * 8;
  if (size < 128 || size > 256 || size % 32 !== 0) {
    throw new InvalidSizeException('The provided size is invalid');
  }
  let entropyBinary = '';
  // change from byte buffer to binary string
  for (const b of entropy) {
    entropyBinary += lpad(b.toString(2), '0', 8);
  }
  const hash = hashData(entropy);
  let hashBinary = hash[0].toString(2);
  hashBinary = lpad(hashBinary, '0', 8);
  // get only a slice of the hash as checksum
  hashBinary = hashBinary.slice(0, (size / 32));
  const checksummedEntropyBinary = entropyBinary + hashBinary;
  return mapWords(checksummedEntropyBinary);
}

/**
 * Salting a password
 * @param {string} password
 * @return {string} salted password
 */
function salt(password) {
  return 'mnemonic' + (password || '');
}

/**
 * @param {Number} size in bits
 * @return {Buffer} random (size / 8) bytes
 */
function genEntropy(size) {
  return crypto.randomBytes(size / 8);
}

/**
 * Takes a password and mnemonic and uses pbkdf2 (2048 rounds and sha512) 
 * function to generate a random seed.
 * @param {string} mnemonic
 * @param {string} password
 * @return {buffer} seed
 */
function mnemonicToSeedSync(mnemonic, password) {
  const mnemonicBuffer = Buffer.from(mnemonic, 'utf8');
  const saltBuffer = Buffer.from(salt(password), 'utf8');
  return pbkdf2.pbkdf2Sync(mnemonicBuffer, saltBuffer, 2048, 64, 'sha512');
}

const entropy = Buffer.from('000000000000000000000000000000000000000000000000', 'hex');
const mnemonic = genMnemonic(entropy);
console.log(mnemonic);
console.log('Valid? -', validMnemonic(mnemonic));
console.log('Seed:', mnemonicToSeedSync(mnemonic, 'TREZOR').toString('hex'));
