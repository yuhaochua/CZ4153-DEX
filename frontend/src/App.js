import { useEffect, useState, useLayoutEffect } from 'react';
import './App.css';
import BuyOrder from './components/buyOrder';
import Navbar from "./components/Navbar"
import Orders from './components/Orders';
import SellOrder from './components/sellOrder';
// import Transfer from './components/Transfer';
import Web3 from 'web3';
import AvailableTokens from './components/AvailableTokens';
import CreateToken from './components/CreateToken';
import { retrieveOrders, retrieveTokenName, retrieveTokens, sendToken } from './Dex.js';
import DropDownOption from './components/DropDownOption';
// import IssueToken from './components/IssueToken';

function App() {
  const [address, setAddress] = useState('-') // wallet address of current user
  const [ethBalance, setEthBalance] = useState('-') // eth balance of current user
  const [isDisconnected, setIsDisconnected] = useState(true) // user wallet disconnected
  const [returningUser, setReturningUser] = useState(false) // used to bring up metamask when reconnecting
  const [tokens, setTokens] = useState([]) // available tokens in system
  const [orders, setOrders] = useState([]) // orders placed
  const [tokenAddressPairs, setTokenAddressPairs] = useState([]) // mapping between tokens and their addresses
  const [receipient, setReceipient] = useState('')  // receipient to issue token to
  const [amount, setAmount] = useState('') // amount of token to issue
  const [token, setToken] = useState('')  // type of token to issue
  const [refresh, setRefresh] = useState(false) // just a state to make the page refresh content
  const admin = '0xf78517fea7Ac30df55aa36499BEcff324Dc5747e' // THIS IS THE WALLET ADDRESS OF ADMIN. CAN CHANGE ACCORDINGLY.

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
    console.log("receipient:",receipient)
    console.log("amount:",amount)
    console.log("token:", token)
    await sendToken(token, receipient, amount, address)
    setRefresh(!refresh)
  }

  const handleRefresh = async() => {
    setRefresh(!refresh) // flipping this boolean will cause refresh state to change, and refresh the content of the page
  }

  const showAdminForms = () => {
    return <div className='col-8 row'>
      <div className="col-6">
            <CreateToken addr={address} refreshHandler={handleRefresh} key={address}/>
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
          {/* <IssueToken tokenAddressPairs={tokenAddressPairs} addr={address} refreshHandler={handleRefresh} /> */}
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

    const fetchOrders = async () => {
      await retrieveOrders().then((result) => {
        console.log("order results", result)
        setOrders(result);
      })
    }
    fetchOrders()

  }, [address, refresh])

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
            <BuyOrder tokenAddressPairs={tokenAddressPairs} refreshHandler={handleRefresh} addr={address}/>
          </div>
          <div className="col-4">
            <SellOrder tokenAddressPairs={tokenAddressPairs} refreshHandler={handleRefresh} addr={address}/>
          </div>
          <div className="col-4">
          <h1>Your Orders</h1>
          {address !== '-' ? <Orders addr={address} orders={orders}/> : null}
          </div>
        </div>
        <div className="row mt-5">
          <div className="col-4">
            <h1>Your Tokens</h1>
            {address !== '-' && tokens && tokens.map(token => (
              <AvailableTokens refresh={refresh} token={token} addr={address} key={token}/>
            ))}
          </div>
          {address === admin && showAdminForms()}
        </div>
      </div>
    </div>
  );
}

export default App;
