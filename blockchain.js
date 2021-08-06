const SHA256 = require("crypto-js/sha256");
const EC = require('elliptic').ec
const ec = new EC('secp256k1');

class Transaction {
    constructor(credit, debit, amount){
        this.credit = credit;
        this.debit = debit;
        this.amount = amount;
    }

    calculateHash(){
        console.log('calculating transaction hash')
        return SHA256(this.credit, this.debit, this.amount).toString();
    }

    signTransaction(signingKey){
        console.log('signing transaction')
        if(signingKey.getPublic('hex') !== this.credit){
            throw new Error("you can't")
        }

        const hashTx = this.calculateHash()
        const sig = signingKey.sign(hashTx, 'base64');
        this.signature = sig.toDER('hex');
        console.log('sign success')
    }

    isValid(){
        console.log('checking validity')
        if(this.credit === null){
            console.log('credit === null')
            return true;
        }
        if(!this.signature || this.signature.length === 0){
            throw new Error('no signature')
        }
        const publicKey = ec.keyFromPublic(this.credit, 'hex');
        console.log('is Valid')
        return publicKey.verify(this.calculateHash(), this.signature);
    }
}

class Block {
  constructor(timestamp, transactions, previousHash) {
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.hash = this.calculateHash();
    this.nonce = 0;
  }

  calculateHash() {
      console.log('calculating block hash')
    return SHA256(
      this.index +
        this.previousHash +
        this.timestamp +
        JSON.stringify(this.transactions) + 
        this.nonce
    ).toString();
  }

  //proof of work
  mineBlock(difficulty){
        console.log('mining block')
      while(this.hash.substring(0, difficulty) !== Array(difficulty+1).join("0")){
        this.nonce ++;
        this.hash = this.calculateHash();
      }
      console.log('Block mined:', this.hash);
  }

  hasValidTransactions(){
      console.log('checking transactions validity')
      for(const tx of this.transactions){
          if(!tx.isValid()){
              console.log('tx not valid')
              return false
          }
      }
      console.log('')
      return true
  }
}

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 2;
    this.pendingTransactions = [];
    this.miningReward = 100;
  }

  createGenesisBlock() {
      console.log('create gen block')
    return new Block(Date.parse('2021-08-10'), [], "Genesis Block");
  }

  getLatestBlock(){
    return this.chain[this.chain.length - 1];
  }

  minePendingTransactions(miningRewardAddress){
      let block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash);
      block.mineBlock(this.difficulty);

      this.chain.push(block);
      this.pendingTransactions = [
          new Transaction(null, miningRewardAddress, this.miningReward)
      ];
  }

  addTransaction(transaction){
      if(!transaction.credit || !transaction.debit){
          throw new Error('transaction must contain two parties')
      }
      if(!transaction.isValid()){
          throw new Error('cannot add invalid transactions')
      }
      this.pendingTransactions.push(transaction);
      console.log('push 2 pending trans', this.pendingTransactions)
  }

  getBalanceOfAddress(address){
      let balance = 0;

      for(let block of this.chain){
          for(let transaction of block.transactions){
            if(transaction.credit === address){
                console.log('-', transaction)
                balance -= transaction.amount;
            }
            if(transaction.debit === address){
                console.log('+', transaction)
                balance += transaction.amount;
            }
          }
      }
      return balance;
  }

  isValid(){
      for(let i = 1; i < this.chain.length; i++){
        const currentBlock = this.chain[i];
        const previousBlock = this.chain[i-1];
        if(!currentBlock.hasValidTransactions()){
            console.log('transactions are not valid')
            return false
        }
        if(currentBlock.hash !== currentBlock.calculateHash()){
            console.log('hash is not valid')
            return false;
        }
        if(currentBlock.previousHash !== previousBlock.hash){
            console.log('block is not linked properly')
            return false;
        }
      }
      return true;
  }
}

module.exports.Blockchain = Blockchain;
module.exports.Transaction = Transaction;