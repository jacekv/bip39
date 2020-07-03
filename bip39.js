const crypto = require("crypto");
const wordList = require('./english.js');


//16 bytes = 128 bits
let size = 128;

function hashData(data) {
    let sha256 = crypto.createHash('sha256');
    return sha256.update(data).digest();
}

function InvalidSizeException(message) {
    this.message = message;
    this.name = 'InvalidSizeException'
}

function mapWords(checksummed_entropy) {
    let mnemonic = '';
    for(let i = 0; i < checksummed_entropy.length; i += 11) {
        value = parseInt(checksummed_entropy.slice(i, (i+11)), 2)
        mnemonic += wordList.numberToWord[value] + ' '; 
    }
    return mnemonic;
}

function mapNumbers(mnemonic) {
    mnemonic = mnemonic.split(' ');
    // remove empty string
    mnemonic.pop();
    let binary = '';
    // mapping from word to bi
    for (const word of mnemonic) {
        bin = wordList.wordToNumber[word].toString(2)
        binary += "00000000000".substr(bin.length) + bin;
    }
    let checksumLength = Math.floor(binary.length / 32)
    let checksum = binary.slice(binary.length - checksumLength);
    let values = [];
    //
    for(let i = 0; i < binary.length - checksumLength; i += 8) {
        value = parseInt(binary.slice(i, (i+8)), 2)
        values.push(value)
    }
    let hash = hashData( new Buffer.from(values));
    let hash_binary = hash[0].toString(2);
    hash_binary = hash_binary.slice(0, checksumLength)
    if (hash_binary === checksum) {
        console.log('All good')
    } else {
        console.log('Invalid');
    }
}

function gen_mnemonic(size) {
    if (size < 128 || size > 256 || size % 32 !== 0) {
        throw new InvalidSizeException('The provided size is invalid');
    }
    let entropy = crypto.randomBytes(size / 8);
    let binary;
    let entropy_binary = "";
    // change from byte buffer to binary string
    for (const b of entropy) {
        binary = b.toString(2);
        entropy_binary += "00000000".substr(binary.length) + binary;
    }
    let hash = hashData(entropy);
    let hash_binary = hash[0].toString(2);
    hash_binary = "0000".substr(hash_binary.length) + hash_binary;
    // get only a slice of the hash as checksum
    hash_binary = hash_binary.slice(0, (size / 32));
    let checksummed_entropy_binary = entropy_binary + hash_binary;
    return mapWords(checksummed_entropy_binary);
}


let mnemonic = gen_mnemonic(size)
console.log(mnemonic)
mapNumbers(mnemonic) 
