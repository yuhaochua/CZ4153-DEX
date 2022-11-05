import { useState } from "react";
import { placeOrder } from "../Dex";

const BuyOrder= ({tokenAddressPairs, addr, refreshHandler}) => {
    const [buyToken, setBuyToken] = useState('')
    const [payToken, setPayToken] = useState('')
    const [isTimed, setIsTimed] = useState(false)
    const [buyAmt, setBuyAmt] = useState('')
    const [payAmt, setPayAmt] = useState('')

    const handleBuy = async(e) => {
        e.preventDefault()
        await placeOrder(buyToken, buyAmt, payToken, payAmt, addr, isTimed)
        refreshHandler()
    }

    return (
        <>
            <h1>Place Order</h1>
            <div className="d-flex flex-row">
                <input className='row mt-3' type="text" placeholder='Amount to order' onChange={(e) => setBuyAmt(e.target.value)}/>
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
            <div className="d-flex flex-row mt-3">                
                <input class="form-check-input mt-2" type="checkbox" id="isTimed" onChange={(e) => setIsTimed(e.target.checked)}/>
                <label class="form-check-label mt-2" for="isTimed">
                    Timed Order
                </label>
                <input type="button" className='btn btn-success mx-3' value='Place Order' onClick={handleBuy}/>     
            </div>
        </>
    );
};

export default BuyOrder;
