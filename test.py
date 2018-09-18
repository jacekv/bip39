import json
from bip39 import *


with open("test_vector.json") as f:
    data = json.load(f)

words = read_wordlist()
for entry in (data['english']):
    e = str(entry[0])
    t_mnemonic = entry[1]
    size_bits = len(e) * 4
    print('Entropy: ', e, size_bits)
    checksummed_entropy = gen_checksum_entropy(int(e, 16).to_bytes(size_bits // 8, 'big'), size_bits)
    mnemonic = map_words(checksummed_entropy, words)
    mnemonic = ' '.join(mnemonic)
    print(mnemonic)
    assert(mnemonic == t_mnemonic)
    print('VALID')
    print()
