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

    //a signiature should be credit's key
    signTransaction(signingKey){
        console.log('signing transaction')
        //if the signiature is not from the credit
        if(signingKey.getPublic('hex') !== this.credit){
            throw new Error("nice try dumb fuck")
        }

        //add the signature into the hash
        const hashTx = this.calculateHash()
        const sig = signingKey.sign(hashTx, 'base64');
        this.signature = sig.toDER('hex');
        console.log('sign success')
    }

    //check to see if the transaction is valid
    isValid(){
        console.log('checking validity')
        // if(this.credit === null){
        //     console.log('credit === null')
        //     return true;
        // }

        //if there is no signature/ the signature is wrong
        if(!this.signature || this.signature.length === 0){
            throw new Error('no signature')
        }
        const publicKey = ec.keyFromPublic(this.credit, 'hex');
        console.log('is Valid')
        //verify the hash
        return publicKey.verify(this.calculateHash(), this.signature);
    }
}

class Block {
  constructor(timestamp, transactions, previousHash) {
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.hash = this.calculateHash();
    this.nonce = 0;    //use nonce to create unique hash
  }

  calculateHash() {
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
        //increase time complexity by forcing computer to add 0 infront of hash
        while(this.hash.substring(0, difficulty) !== Array(difficulty+1).join("0")){
        this.nonce ++;
        this.hash = this.calculateHash();
      }
      console.log('Block mined:', this.hash);
  }

  hasValidTransactions(){
      console.log('checking transactions validity')
      //check this block's tx only
      for(const tx of this.transactions){
          if(!tx.isValid()){
              console.log('tx not valid')
              return false
          }
      }
      console.log('tx is valid')
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
      //the very first block
      console.log('create gen block')
    return new Block(Date.parse('2021-08-10'), [], "Genesis Block");
  }

  getLatestBlock(){
    return this.chain[this.chain.length - 1];
  }

  //mining means verifing new transactions legitimacy then add the transaction into the ledger
  minePendingTransactions(miningRewardAddress){
      //genertae a new block with the pending transactions
      let block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash);
      block.mineBlock(this.difficulty);

      //after block is mined, push the block into the chain
      this.chain.push(block);
      //the miner should be rewarded after he/she mined the block, the reward will be transfer to that person after the next block is mined
      this.pendingTransactions = [
          new Transaction(null, miningRewardAddress, this.miningReward)
      ];
  }

  //adding a transaction to the pending transaction list
  addTransaction(transaction){
      //in any transaction there should be a credit and a debit
      if(!transaction.credit || !transaction.debit){
          throw new Error('transaction must contain two parties')
      }
      if(!transaction.isValid()){
          throw new Error('cannot add invalid transactions')
      }
      //after verifing the transaction, push to the pending transaction in the chain
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
  //checking the chain validity
  isValid(){
      for(let i = 1; i < this.chain.length; i++){
        const currentBlock = this.chain[i];
        const previousBlock = this.chain[i-1];
        //check for transaction's validity
        if(!currentBlock.hasValidTransactions()){
            console.log('transactions are not valid')
            return false
        }
        //check each hash has not been tempered with
        if(currentBlock.hash !== currentBlock.calculateHash()){
            console.log('hash is not valid')
            return false;
        }
        //check the link of each hash is correct
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