const SHA256 = require("crypto-js/sha256");

class Block {
  constructor(index, timestamp, data, previousHash) {
    this.index = index;
    this.timestamp = timestamp;
    this.data = data;
    this.previousHash = previousHash;
    this.hash = this.calculateHash();
    this.nonce = 0;
  }

  calculateHash() {
    return SHA256(
      this.index +
        this.previousHash +
        this.timestamp +
        JSON.stringify(this.data) + 
        this.nonce
    ).toString();
  }

  mineBlock(difficulty){//4
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
    this.difficulty = 4;
  }

  createGenesisBlock() {
      console.log('create gen block')
    return new Block(0, "30/07/2021", "Genesis Block", "0");
  }

  getLatestBlock(){
    return this.chain[this.chain.length - 1];
  }

  addBlock(newBlock){
    newBlock.previousHash = this.getLatestBlock().hash;
    newBlock.mineBlock(this.difficulty);
    this.chain.push(newBlock);
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

let newBlockChain = new Blockchain();

//add two block for demo
console.log('mining block one')
newBlockChain.addBlock(new Block(1, '31/07/2021', { amount:4 }));
console.log('mining block two')
newBlockChain.addBlock(new Block(2, '31/07/2021', { amount:5 }));

console.log('is valid?', newBlockChain.isValid());

//block tempering
newBlockChain.chain[1].data = {amount: 16 };
newBlockChain.chain[1].calculateHash();

//will be false
console.log('is valid?', newBlockChain.isValid());

// console.log('json', JSON.stringify(newBlockChain, null, 4));