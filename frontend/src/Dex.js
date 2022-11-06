// import detectEthereumProvider from "@metamask/detect-provider";
// NOTE: be aware of this: https://flaviocopes.com/parcel-regeneratorruntime-not-defined/
import Web3 from "web3";

// importing a compiled contract artifact which contains function signature etc. to interact
import artifact from "./truffleProj/build/contracts/Dex.json";

export const DexContractAddress = "0x38458ce8789fA6d39F80a4514689e0cA6820993d"; // PLEASE CHANGE IT TO YOURS

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

export const placeOrder = async (_buyToken, _buyAmt, _payToken, _payAmt, _addr, _isTimed) => {
    // only need the approve function from ERC20
    let minABI = [
        // approve
        {
            "constant": false,
            "inputs": [
                {
                    "name": "_spender",
                    "type": "address"
                },
                {
                    "name": "_value",
                    "type": "uint256"
                }
            ],
            "name": "approve",
            "outputs": [
                {
                    "name": "",
                    "type": "bool"
                }
            ],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        }
    ];

    // expecting result to be (orderbookaddress, token1address, token2address)
    let result = await contract.methods.getOrderbookAddress(_buyToken, _payToken).call();
    console.log("orderbook address: ", result[0]);
    if(result[0] === '0x0000000000000000000000000000000000000000') {
        result = await contract.methods.addTokenPair(_buyToken, _payToken).call({from: _addr});
    }

    let _payTokenContract = new web3.eth.Contract(minABI, _payToken);
    await _payTokenContract.methods.approve(result[0], _payAmt).send({from: _addr});
    
    await contract.methods.buy(_buyToken, _buyAmt, _payToken, _payAmt, _isTimed).send({from: _addr});
}

export const retrieveOrders = async () => {
    // doc here: https://web3js.readthedocs.io/en/v1.2.11/web3-eth-contract.html#methods-mymethod-call
    console.log("retrieving orders...")
    const orders = await contract.methods.getOrders().call();
    console.log("orders: ", orders);
    return orders;
};

export const cancelBuy = async (_token1, _token2, _addr) => {
    // doc here: https://web3js.readthedocs.io/en/v1.2.11/web3-eth-contract.html#methods-mymethod-call
    let minCancelBuyABI = [{
        "inputs": [],
        "name": "cancelBuy",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      }]
    let result = await contract.methods.getOrderbookAddress(_token1, _token2).call();
    console.log("orderbook address: ", result[0]);

    let _orderbookContract = new web3.eth.Contract(minCancelBuyABI, result[0]);
    await _orderbookContract.methods.cancelBuy().send({from: _addr});
};

export const cancelSell = async (_token1, _token2, _addr) => {
    // doc here: https://web3js.readthedocs.io/en/v1.2.11/web3-eth-contract.html#methods-mymethod-call
    let minCancelSellABI = [{
        "inputs": [],
        "name": "cancelSell",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      }]
    let result = await contract.methods.getOrderbookAddress(_token1, _token2).call();
    console.log("orderbook address: ", result[0]);

    let _orderbookContract = new web3.eth.Contract(minCancelSellABI, result[0]);
    await _orderbookContract.methods.cancelSell().send({from: _addr});
};

