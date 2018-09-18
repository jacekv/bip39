let crypto = require("crypto");
let fs = require("fs");

//32 bytes = 256 bits
let size = 32;
let sha256 = crypto.createHash('sha256');

let content = fs.readFileSync('english.txt', 'utf8');
let words = content.split("\n");

let mnemonic = "";

crypto.randomBytes(size, (err, entropy) => {
    if (err) throw err;
    let hash = sha256.update(entropy).digest();

    let binary;
    let entropy_binary = "";
    let l;
    for (const b of entropy) {
        binary = b.toString(2);
        l = binary.length;
        if(l < 8){
            binary = "0".repeat(8 - l) + binary;
        }
        entropy_binary += binary;
    }
    let hash_binary = hash[0].toString(2);
    let n = (size * 8) / 32;
    hash_binary = hash_binary.slice(0, n);
    l = hash_binary.length;
    if(l < n) {
        hash_binary = "0".repeat((n - l)) + hash_binary;
    }
    let checksummed_entropy_binary = entropy_binary + hash_binary.slice(0, n);
    for(let i = 0; i < checksummed_entropy_binary.length; i += 11) {
        value = parseInt(checksummed_entropy_binary.slice(i, (i+11)), 2);
        mnemonic += words[value] + " ";
    }
    console.log(mnemonic);
})
