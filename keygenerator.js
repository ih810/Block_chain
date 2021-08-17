//eliptic to generate a keys
const EC = require('elliptic').ec
const ec = new EC('secp256k1');

const key = ec.genKeyPair();
const publicKey = key.getPublic('hex');
const privateKey = key.getPrivate('hex');

//after running this file, put the public ket and private key into your .env
console.log('private key: ', privateKey);
console.log('public key: ', publicKey)