const ganache = require("ganache");
const { Web3 } = require("web3");
const assert = require("assert");
// updated imports added for convenience
const web3 = new Web3(ganache.provider());

const { interface, bytecode } = require("../compile");
let lottery;
let accounts;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();
  lottery = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({ data: bytecode })
    .send({ from: accounts[0], gas: "1000000" });
   
}); console.log(JSON.parse(interface), 'hello');

describe("Lottery contract", () => {
  it("deploys a contract", () => {
    assert.ok(lottery.options.address);
  });
  it("allows one account to enter", async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      //this is a web3 method which can be used to convert to wei. so it takes the amount and the unit
      value: web3.utils.toWei("0.02", "ether"),
    });
    const players = await lottery.methods.getPlayers().call({
      from: accounts[0],
    });
    assert.equal(accounts[0], players[0]);
    assert.equal(1, players.length);
  });
  it("allows multiple accounts to enter", async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      //this is a web3 method which can be used to convert to wei. so it takes the amount and the unit
      value: web3.utils.toWei("0.02", "ether"),
    });
    await lottery.methods.enter().send({
      from: accounts[1],
      //this is a web3 method which can be used to convert to wei. so it takes the amount and the unit
      value: web3.utils.toWei("0.02", "ether"),
    });
    await lottery.methods.enter().send({
      from: accounts[2],
      //this is a web3 method which can be used to convert to wei. so it takes the amount and the unit
      value: web3.utils.toWei("0.02", "ether"),
    });
    const players = await lottery.methods.getPlayers().call({
      from: accounts[0],
    });
    assert.equal(accounts[0], players[0]);

    assert.equal(accounts[1], players[1]);

    assert.equal(accounts[2], players[2]);
  });

  it("requires a minimum amount of ether to enter", async () => {
    try {
      await lottery.methods.enter().send({
        from: accounts[0],
        value: "100",
      });
      assert(false);
    } catch (err) {
      assert(err);
    }
  });

  it("only manager can call pickWinner", async () => {
    try {
      await lottery.methods.pickWinner().send({
        from: accounts[1],
      });
      assert(false);
    } catch (err) {
      assert(err);
    }
  });

  it("sends mmoney to the winner and resets the players", async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei("1", "ether"),
    });
    
    const initialBalance = await web3.eth.getBalance(accounts[0]);
    await lottery.methods.pickWinner().send({ from: accounts[0] });
    const finalBalance = await web3.eth.getBalance(accounts[0]);
    const difference = finalBalance - initialBalance;

    assert(difference > web3.utils.toWei("0.8", "ether"));
  });
});