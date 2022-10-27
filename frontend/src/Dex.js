// import detectEthereumProvider from "@metamask/detect-provider";
// NOTE: be aware of this: https://flaviocopes.com/parcel-regeneratorruntime-not-defined/
import Web3 from "web3";

// importing a compiled contract artifact which contains function signature etc. to interact
import artifact from "./truffleProj/build/contracts/Dex.json";

const myAddress = "0xcc6b9a2Ef844002c413d992B980EeB7b08899A10"; // PLEASE CHANGE IT TO YOURS
const ganacheWSS = 'ws://127.0.0.1:7545'; // PLEASE CHANGE IT TO YOURS

export const DexContractAddress = "0x240D3c56c532Fdc741bFFd676cBBF7D08e6f6521"; // PLEASE CHANGE IT TO YOURS
export const Testnet = "goerli"; // PLEASE CHANGE IT TO YOURS

const web3 = new Web3(window.ethereum);
// const web3 = new Web3(Web3.currentProvider || new Web3.providers.WebsocketProvider(ganacheWSS));

const contract = new web3.eth.Contract(artifact.abi, DexContractAddress);

// doc here: https://web3js.readthedocs.io/en/v1.2.11/web3.html#providers

export const createToken = async (name, symbol, addr) => {
  // doc here: https://web3js.readthedocs.io/en/v1.2.11/web3-eth-contract.html#methods-mymethod-call
//   const token = await contract.methods.createToken(name, symbol).send({ from: addr });
    await contract.methods.createToken(name, symbol).send({ from: addr });
};

export const sendToken = async (_token, _receipient, _amount, _addr) => {
    // doc here: https://web3js.readthedocs.io/en/v1.2.11/web3-eth-contract.html#methods-mymethod-call
    await contract.methods.sendToken(_token, _receipient, _amount).send({ from: _addr });
  };

export const retrieveTokens = async () => {
    // doc here: https://web3js.readthedocs.io/en/v1.2.11/web3-eth-contract.html#methods-mymethod-call
    const tokens = await contract.methods.getAvailableTokens().call();
    console.log("from SC",tokens);
    return { tokens: tokens };
};

export const retrieveTokenName = async (_name) => {
    // doc here: https://web3js.readthedocs.io/en/v1.2.11/web3-eth-contract.html#methods-mymethod-call
    const name = await contract.methods.getTokenName(_name).call();
    // console.log("token name",name);
    return name;
};

export const retrieveTokenBalance = async (_name, _addr) => {
    // doc here: https://web3js.readthedocs.io/en/v1.2.11/web3-eth-contract.html#methods-mymethod-call
    const balance = await contract.methods.getTokenBalance(_name).call({ from: _addr });
    // console.log("token name",name);
    return balance;
};

