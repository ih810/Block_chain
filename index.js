//block chain setup
const {Blockchain, Transaction} = require("./blockchain")

//elliptic setup
const EC = require('elliptic').ec
const ec = new EC('secp256k1');

const myKey = ec.keyFromPrivate('5e7688161c8c188d4afa8ab105708d34ef36864f196e8867dec3a33c14640f91');
const myWallet = myKey.getPublic('hex');

//testing blockchain
let coin = new Blockchain();
console.log('coin', coin)
const tx1 = new Transaction(myWallet, 'public key goes here', 10);
console.log('create new transaction', tx1)
tx1.signTransaction(myKey);
console.log('signing key 4 t1', tx1)
coin.addTransaction(tx1);
console.log('adding transaction', tx1)

console.log('\n starting miner')
coin.minePendingTransactions(myWallet);
coin.minePendingTransactions(myWallet);
console.log(coin)

//ad1 paid 100 to ad2 got 50 from ad2
console.log('Balance of myWallet is:', coin.getBalanceOfAddress(myWallet));