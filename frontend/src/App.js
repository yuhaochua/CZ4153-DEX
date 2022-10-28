import { useEffect, useState, useLayoutEffect } from 'react';
import './App.css';
import BuyOrder from './components/buyOrder';
import Navbar from "./components/Navbar"
import Orders from './components/Orders';
import SellOrder from './components/sellOrder';
// import Transfer from './components/Transfer';
import Web3 from 'web3';
import AvailableTokens from './components/AvailableTokens';
import IssueToken from './components/CreateToken';
import { retrieveTokenName, retrieveTokens, sendToken } from './Dex.js';
import DropDownOption from './components/DropDownOption';

function App() {
  const [address, setAddress] = useState('-')
  const [ethBalance, setEthBalance] = useState('-')
  const [isDisconnected, setIsDisconnected] = useState(true)
  const [returningUser, setReturningUser] = useState(false)
  const [tokens, setTokens] = useState([])
  const [tokenAddressPairs, setTokenAddressPairs] = useState([])
  const [receipient, setReceipient] = useState('') 
  const [amount, setAmount] = useState('')
  const [token, setToken] = useState('') 
  const admin = '0x2666eB9Eff46A404B1C875B23E1b5705855f866B' // THIS IS THE WALLET ADDRESS OF ADMIN. CAN CHANGE ACCORDINGLY.

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

  const handleSendToken = async(e) => {
    e.preventDefault()
    console.log("receipient:",receipient)
    console.log("amount:",amount)
    console.log("token:", token)
    await sendToken(token, receipient, amount, address)
  }

  const showAdminForms = () => {
    return <div className='col-8 row'>
      <div className="col-6">
            <IssueToken addr={address} key={address}/>
          </div>
          <div className="col-6">
              <h1>Issue Token</h1>
              <label htmlFor="tokens">Choose a token</label>
              <select id="tokens" onChange={(e) => setToken(e.target.value)}>
                  <option value=""></option>
                  {tokenAddressPairs && tokenAddressPairs.map(pair => (
                      <DropDownOption pair={pair} key={pair.address}/>
                  ))}
              </select>

              <input className='row mt-3' type="text" placeholder='Receipient' onLoad={(e) => setReceipient(e.target.value)} onChange={(e) => setReceipient(e.target.value)}/>
              <input className='row mt-3' type="text" placeholder='Amount' onChange={(e) => setAmount(e.target.value)}/>
              <input type="button" className='btn btn-primary mt-3' value='Issue Token' onClick={handleSendToken}/> 
          </div>
    </div>
  }
  
  useEffect(() => {
    window.ethereum.request({ method: 'eth_accounts' }).then((result) => {
      if(result.length > 0){
        setReturningUser(true)
      }
    })

    const fetchTokens = async () => {
      await retrieveTokens().then((result) => {
        setTokens(result.tokens)
      })
    }
    fetchTokens()

  }, [address])

  useLayoutEffect(() => {
    const updateTokenAddressPairs = () => {
      let tokenName
      const tempPairs = []
      tokens && tokens.map(token => {
        retrieveTokenName(token).then((result) => {
          tokenName=result
          const obj = {
            name: tokenName,
            address: token
          }
          tempPairs.push(obj)
          setTokenAddressPairs(tempPairs) //update using this method so that component re renders
        })
      })
    }
    updateTokenAddressPairs()
  }, [tokens.length])

  return (
    <div className="App">
      <Navbar address={address} ethBalance={ethBalance}/>
      <div className='container'>
        <div className='mt-3'>
          <input type="button" className='btn btn-primary' value='Connect To Wallet' disabled={!isDisconnected} onClick={connectWallet} />
          <input type="button" className='btn btn-danger' value='Disconnect Wallet' disabled={isDisconnected} onClick={disconnectWallet} />

        </div>

        <div className="mt-5 row">
          <div className="col-4">
            <BuyOrder tokenAddressPairs={tokenAddressPairs}/>
          </div>
          <div className="col-4">
            <SellOrder tokenAddressPairs={tokenAddressPairs}/>
          </div>
          <div className="col-4">
            <Orders />
          </div>
        </div>
        <div className="row mt-5">
          <div className="col-4">
            <h1>Your Tokens</h1>
            {address !== '-' && tokens && tokens.map(token => (
              <AvailableTokens token={token} addr={address} key={token}/>
            ))}
          </div>
          {address === admin && showAdminForms()}
        </div>
      </div>
    </div>
  );
}

export default App;
