import { useEffect, useState } from 'react';
import './App.css';
import BuyOrder from './components/buyOrder';
import Navbar from "./components/Navbar"
import Orders from './components/Orders';
import SellOrder from './components/sellOrder';
// import Transfer from './components/Transfer';
import Web3 from 'web3';
import AvailableTokens from './components/AvailableTokens';
import IssueToken from './components/IssueToken';
import { createToken, retrieveTokens } from './Dex.js';

function App() {
  const transactionTypes = ['ethToToken', 'tokenToEth']
  const [address, setAddress] = useState('-')
  const [ethBalance, setEthBalance] = useState('-')
  const [isDisconnected, setIsDisconnected] = useState(true)
  const [returningUser, setReturningUser] = useState(false)
  const [tokens, setTokens] = useState(null)

  // subsequently will connect to metamask
  const connectWallet = async () => {
    setIsDisconnected(false)
    


    // console.log(account)

    if(typeof window.ethereum !== 'undefined') {
      const web3 = new Web3(window.ethereum)

      if(!returningUser){
        await window.ethereum.request({method: "eth_requestAccounts"}).catch((err)=>{
          //error
          console.log(err.code)
        })
      }
      else{
        await window.ethereum.request({
          method: "wallet_requestPermissions",
          params: [
            {
              eth_accounts: {}
            }
          ]
        })
      }
      
      var account = await web3.eth.getAccounts()
      var balance = await web3.eth.getBalance(account[0])
      console.log(account)
      balance = web3.utils.fromWei(balance)

    }else{
      alert('Please install MetaMask')
    }



    setAddress(account[0])
    setEthBalance(balance)
    // setAddress('0x8934598')
    // setEthBalance('0.24939')
    setReturningUser(true)
  }

  const disconnectWallet = async () => {
    setIsDisconnected(true)
    // setReturningUser(false)

    setAddress('-')
    setEthBalance('-')
  }
  
  useEffect(() => {
    window.ethereum.request({ method: 'eth_accounts' }).then((result) => {
      if(result.length > 0){
        setReturningUser(true)
      }
    })


    const fetchTokens = async () => {
      const result = retrieveTokens();
      setTokens(result.tokens);
      console.log(result.tokens);
    }
    fetchTokens()
  }, [])

  return (
    <div className="App">
      <Navbar address={address} ethBalance={ethBalance}/>
      <div className='container'>
        <div className='mt-3'>
          <input type="button" className='btn btn-primary' value='Connect To Wallet' disabled={!isDisconnected} onClick={connectWallet} />
          <input type="button" className='btn btn-danger' value='Disconnect Wallet' disabled={isDisconnected} onClick={disconnectWallet} />

        </div>
        {/* {transactionTypes.map(transactionType => (
          <Transfer transactionType={transactionType} key={transactionType} />
        ))}         */}
        <div className="mt-5 row">
          <div className="col-4">
            <BuyOrder />
          </div>
          <div className="col-4">
            <SellOrder />
          </div>
          <div className="col-4">
            <Orders />
          </div>
        </div>
        <div className="row mt-5">
          <div className="col-4">
            <AvailableTokens />
          </div>
          <div className="col-4">
            <IssueToken />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
