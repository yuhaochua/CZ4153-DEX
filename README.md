# CZ4153-DEX
Minimal Viable Decentralized Exchange using order book

1. cd into frontend folder, run `npm install`

## Local testing on ganache
1. launch ganache, and add truffle-config.js into a new ganache workspace. Increase the gas limit of the new workspace to 9999999 before saving it.
2. run `truffle compile`, if there are any missing dependencies, you need to install them, for example `npm install @truffle/hdwallet-provider`
3. run `truffle migrate`
4. check in ganache that the contracts are deployed(under contracts tab), should be only **Migrations** and **Dex** deployed.
5. copy the address of **Dex** contract and paste it into *frontend/src/Dex.js* on **line 8**, replacing the existing address.
6. copy the address of the first wallet in ganache(under accounts tab), the first wallet should have some ETH deducted from deploying the contracts
7. paste the address into *frontend/src/App.js* on **line 29**, replacing the existing admin wallet address.
8. in your chrome browser(or any other browser), add the ganache network into MetaMask if you havent already done before.
9. import 2 wallets from ganache into MetaMask using their private keys. 1 of the wallets has to be the first wallet in ganache, the other wallet can be any wallet.
10. run `npm start` from the frontend folder.
11. interact with the frontend through your browser.

## Testing on goerli testnet
1. create new project on goerli testnet(or any other testnet) through alchemy(or your preferred platform)
2. update(or create if you do not have one) `.env` file in frontend folder 
##### Example of what `.env` file should look like
MNEMONIC = `YOUR SECRET WORDS`
PROJECT_ID = `API KEY`
3. in MetaMask, add a new network with the details(RPC URL, Chain ID) of your newly created project.

4. you might need to update **lines 85-91** in *truffle-config.js* to suit your testnet settings
5. run `truffle compile`, if there are any missing dependencies, need install them, for example `npm install @truffle/hdwallet-provider`
6. run `truffle migrate --network goerli` (change goerli to your preferred testnet as required)
7. check in alchemy(or your preferred platform) or etherscan to confirm that your contracts are deployed
NOTE: to check on etherscan, you will have to copy the contract address from the terminal output and search on etherscan(choose the correct ether scan for your testnet)
8. copy the Dex contract address from terminal output and paste into **line 8** of *frontend/src/Dex.js* 
9. copy your goerli testnet wallet address(the one used to deploy the Dex contract) and paste it into *frontend/src/App.js* on **line 29**, replacing the existing admin wallet address.
10. run `npm start` from the frontend folder.
11. interact with the frontend through your browser.
