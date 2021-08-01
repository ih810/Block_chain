const SHA256 = require("crypto-js/sha256");

class Transaction {
    constructor(credit, debit, amount){
        this.credit = credit;
        this.debit = debit;
        this.amount = amount;
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
      while(this.hash.substring(0, difficulty) !== Array(difficulty+1).join("0")){
        this.nonce ++;
        this.hash = this.calculateHash();
      }
      console.log('Block mined:', this.hash);
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
    return new Block("30/07/2021", "Genesis Block", "0");
  }

  getLatestBlock(){
    return this.chain[this.chain.length - 1];
  }

  minePendingTransactions(miningRewardAddress){
      let block = new Block(Date.now(), this.pendingTransactions);
      console.log('block:', block)
      block.mineBlock(this.difficulty);
      block.

      console.log('prepush this.chain', this.chain)
      this.chain.push(block);
      console.log('this.chain', this.chain)
      this.pendingTransactions = [
          new Transaction(null, miningRewardAddress, this.miningReward)
      ];
  }

  createTransaction(transaction){
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

        if(currentBlock.hash !== currentBlock.calculateHash()){
            return false;
        }
        if(currentBlock.previousHash !== previousBlock.hash){
            return false;
        }
      }
      return true;
  }
}

let coin = new Blockchain();
coin.createTransaction(new Transaction('ad1', 'ad2', 100));
console.log('coin', coin)
coin.createTransaction(new Transaction('ad2', 'ad1', 50));
console.log('coin', coin)


console.log('\n starting miner')
coin.minePendingTransactions('ad3');

console.log('\n Balance of ad3 is:', coin.getBalanceOfAddress('ad3'));

console.log('\n starting miner')
coin.minePendingTransactions('ad3');

//ad1 paid 100 to ad2 got 50 from ad2
console.log('Balance of ad1 is:', coin.getBalanceOfAddress('ad1'));
//ad2 got 100 from ad1 paid 50 to ad2
console.log('Balance of ad2 is:', coin.getBalanceOfAddress('ad2'));
//ad3 got its balance from mining reward
console.log('Balance of ad3 is:', coin.getBalanceOfAddress('ad3'));
