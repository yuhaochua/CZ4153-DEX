import { useState } from "react";
import { sendToken } from '../Dex.js';

const IssueToken= ({ tokenAddressPairs, addr,refreshHandler }) => {
    const [receipient, setReceipient] = useState('') 
    const [amount, setAmount] = useState('')
    const [token, setToken] = useState('')

    const handleSendToken = async(e) => {
        e.preventDefault()
        console.log(receipient, amount, token)
        await sendToken(token, receipient, amount, addr)
        refreshHandler()
    }


    return (
        <div className="col-6"> 
            <h1>Issue Token</h1>
            <label htmlFor="tokens">Choose a token</label>
            <select id="tokens" onChange={(e) => setToken(e.target.value)}>
                <option></option>
                {tokenAddressPairs && tokenAddressPairs.map(pair => (
                    // <DropDownOption pair={pair} key={pair.address}/>
                    <option value={pair.address} key={pair.address}>{pair.name}</option>
                ))}
            </select>

            <input className='row mt-3' type="text" placeholder='Receipient' onChange={(e) => setReceipient(e.target.value)}/>
            <input className='row mt-3' type="text" placeholder='Amount' onChange={(e) => setAmount(e.target.value)}/>
            <input type="button" className='btn btn-primary mt-3' value='Issue Token' onClick={handleSendToken}/> 
        </div>
    );
};

export default IssueToken;