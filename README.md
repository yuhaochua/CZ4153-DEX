# CZ4153-DEX
Minimal Viable Decentralized Exchange using order book

1. cd into frontend folder, run `npm install`

## Local testing on ganache
1. launch ganache, and add truffle-config.js into a new ganache workspace.
2. run `truffle compile`, if there are any missing dependencies, need install them, for example `npm install @truffle/hdwallet-provider`
3. run `truffle migrate`
4. check in ganache that the contracts are deployed(under contracts tab), should be only **Migrations** and **Dex** deployed.
5. copy the address of **Dex** contract and paste it into *frontend/src/Dex.js* on **line 11**, replacing the existing address.
6. copy the address of the first wallet in ganache(under accounts tab), the first wallet should have some ETH deducted from deploying the contracts
7. paste the address into *frontend/src/App.js* on **line 24**, replacing the existing admin wallet address.
8. in your chrome browser(or any other browser), add the ganache network into MetaMask if you havent already done before.
9. import 2 wallets from ganache into MetaMask using their private keys. 1 of the wallets has to be the first wallet in ganache, the other wallet can be any wallet.
10. run `npm start` from the frontend folder.
11. interact with the frontend through your browser.
