// import detectEthereumProvider from "@metamask/detect-provider";
// NOTE: be aware of this: https://flaviocopes.com/parcel-regeneratorruntime-not-defined/
import Web3 from "web3";

// importing a compiled contract artifact which contains function signature etc. to interact
import artifact from "./truffleProj/build/contracts/Dex.json";

const myAddress = "0xcc6b9a2Ef844002c413d992B980EeB7b08899A10"; // PLEASE CHANGE IT TO YOURS
const ganacheWSS = 'ws://127.0.0.1:7545'; // PLEASE CHANGE IT TO YOURS

export const DexContractAddress = "0x5061e079E04392EdD45f848226C92D48c67Ee94c"; // PLEASE CHANGE IT TO YOURS
export const Testnet = "goerli"; // PLEASE CHANGE IT TO YOURS



// doc here: https://web3js.readthedocs.io/en/v1.2.11/web3.html#providers

// export const createToken = async (name, symbol) => {
//   // doc here: https://web3js.readthedocs.io/en/v1.2.11/web3-eth-contract.html#methods-mymethod-call
//   await contract.methods.createToken(name, symbol).call();
// };

export const retrieveTokens = async () => {
    // doc here: https://web3js.readthedocs.io/en/v1.2.11/web3-eth-contract.html#methods-mymethod-call
    const web3 = new Web3(window.ethereum);
    const networkId = await web3.eth.net.getId();
    const contract = new web3.eth.Contract(artifact.abi, artifact.networks[networkId].address);

    console.log(contract);
    const tokens = contract.methods.getAvailableTokens().call().then(console.log);
    // console.log("from SC",tokens);
    return { tokens: tokens };
};

