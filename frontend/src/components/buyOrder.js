import { useState } from "react";
import { placeBuyOrder } from "../Dex";

const BuyOrder= ({tokenAddressPairs, addr}) => {
    const [buyToken, setBuyToken] = useState('')
    const [payToken, setPayToken] = useState('')
    const [buyAmt, setBuyAmt] = useState('')
    const [payAmt, setPayAmt] = useState('')

    const handleBuy = async(e) => {
        e.preventDefault()
        await placeBuyOrder(buyToken, buyAmt, payToken, payAmt, addr)
    }

    return (
        <>
            <h1>Buy Order</h1>
            <div className="d-flex flex-row">
                <input className='row mt-3' type="text" placeholder='Amount to buy' onChange={(e) => setBuyAmt(e.target.value)}/>
                <select className="mt-3" onChange={(e) => setBuyToken(e.target.value)}>
                    <option value=""></option>
                    {tokenAddressPairs && tokenAddressPairs.map(pair => (
                        <option value={pair.address} key={pair.address}>{pair.name}</option>
                    ))}                    
                </select>
            </div>
            <div className="d-flex flex-row">
                <input className='row mt-3' type="text" placeholder='Amount to pay' onChange={(e) => setPayAmt(e.target.value)}/>
                <select className="mt-3" onChange={(e) => setPayToken(e.target.value)}>
                    <option value=""></option>
                    {tokenAddressPairs && tokenAddressPairs.map(pair => (
                        <option value={pair.address} key={pair.address}>{pair.name}</option>
                    ))}                    
                </select>
            </div>
            <input type="button" className='btn btn-success mt-3' value='Place Buy Order' onClick={handleBuy}/>       
        </>
    );
};

export default BuyOrder;
