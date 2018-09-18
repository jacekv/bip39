import hashlib
import os

"""
Source: https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki
Test vectors: https://github.com/trezor/python-mnemonic/blob/master/vectors.json

"""

def read_wordlist():
    """
    Reads in all the words from a wordlist and returns a list.

    Returns:
        list: List containing all the words from the file.
    """
    with open('english.txt', 'r') as f:
        words = [word.strip() for word in f]
    return words


def gen_entropy(size_bits):
    """
    Returns a string of size_bites / 8 random bytes.

    Args:
        size_bits (int): First paramter for the length of the random string in bits

    Returns:
        bytes: Returns a size_bits / 8 byte long random string.
    """
    entropy = os.urandom(int(size_bits / 8))
    return entropy

def _hash_entropy(entropy):
    return hashlib.sha256(entropy)


def gen_checksum_entropy(entropy, size_bits):
    """
    The function takes an entropy and a size_bits paramter, hashes the entropy
    using sha256 and appends the first (size_bits / 32) of the hash to the
    entropy as a checksum.

    Args:
        entropy (bytes): Entropy to be hashed.
        size_bits (int): Length of entropy in bits.

    Returns:
        String: Entropy plus checksum as a binary string.
    """
    hash = _hash_entropy(entropy)
    hash_bits = format(int(hash.hexdigest(), 16), '0256b')

    f = '0' + str(size_bits) + 'b'
    checksummed_bits = format(int(entropy.hex(), 16), f)

    n = int(size_bits / 32)
    return (checksummed_bits + hash_bits[:n])


def map_words(checksummed_entropy, words):
    """
    Takes a checksummed entropy and cuts it into pieces of 11 bits. 
    The bits are mapped to a word in the word list. A list with all the
    words is returned.

    Args:
        checksummed_entropy (string): String representing a binary number.
        words (list): A list which contains all words from a file.

    Returns:
        list: Containing a list with words as a mnemonic.
    """
    mnemonic = []
    for i in range(0, len(checksummed_entropy), 11):
        chunk = checksummed_entropy[i:(i+11)]
        mnemonic.append(words[int(chunk, 2)])
    return mnemonic

def map_numbers(mnemonic, words):
   """
   Takes a mnemonic string, which contains all words and verifies the
   checksum of the mnemonic.

   Args:
       mnemonic (string): Mnemonic string containing all words.
       words (list): List containing all the words used to generate the mnemonic.

   Returns:
       bool: True if valid, False otherwise
   """
   checksummed_bits = ''
   for word in mnemonic.split(" "):
       i = words.index(word)
       checksummed_bits += format(i, '011b')
   cutting_point = (len(checksummed_bits) % 32) * -1
   entropy = checksummed_bits[:cutting_point]
   
   f = '0' + str(len(entropy)) + 'b'
   hash = _hash_entropy(int(entropy, 2).to_bytes((len(entropy) + 7) // 8, 'big'))
   hash_str = format(int(hash.hexdigest(), 16), '0256b')[:(cutting_point*-1)]

   checksum = checksummed_bits[cutting_point:]
   print(entropy)
   print(checksum)
   print(hash_str)
   if(hash_str == checksum):
       print('Valid mnemonic')
       return True
   print('Invalid mnemonic')
   return False

def gen_seed(mnemonic, password=''):
    """
    Taking a mnemonic and a password to derive a seed from using pbkdf2 using sha512 as hmac.

    Args:
        Mnemonic (string): Mnemonic string consisting of the words joined with a whitespace.
        Password (string): Password used during derivation.

    Returns:
        String: The seed represented as a string.
    """
    seed = hashlib.pbkdf2_hmac('sha512', bytes(mnemonic,'utf8'), bytes("mnemonic" + password, 'utf8'), 2048)
    return seed.hex()



if __name__ == '__main__':
    size_bits = 128
    words = read_wordlist()
    e = gen_entropy(size_bits)

    #e = "7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f"
    #e = int(e, 16).to_bytes(size_bits // 8, 'big')
    #print(e)

    checksummed_entropy = gen_checksum_entropy(e, size_bits)
    print('Len: ', checksummed_entropy)
    mnemonic = map_words(checksummed_entropy, words)
    mnemonic = ' '.join(mnemonic)
    password = ""
    seed = gen_seed(mnemonic, password)

    print(mnemonic)
    print('Seed: ', seed)
    mnemonic = "evidence dilemma tomato body thrive better antenna never drift alley attitude bargain like rocket material august evoke melt spatial margin eye velvet immune hammer"
    map_numbers(mnemonic, words)
