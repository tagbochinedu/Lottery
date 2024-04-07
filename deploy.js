const HDWalletProvider = require("@truffle/hdwallet-provider");
const { Web3 } = require("web3");
const { interface, bytecode } = require("./compile");

const provider = new HDWalletProvider(
  "smart quiz wrong jewel seminar runway since trade dove kidney affair industry",
  "https://sepolia.infura.io/v3/d59a4b573a9640138aec628a1293e188"
);
const web3 = new Web3(provider);

const deploy = async () => {
  const accounts = await web3.eth.getAccounts();
  const result = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({ data: bytecode })
    .send({ gas: "1000000", from: accounts[0] });
  console.log(result.options.address, interface);
  provider.engine.stop();
};
deploy();
