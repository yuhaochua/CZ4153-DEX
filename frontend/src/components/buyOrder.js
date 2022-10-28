const BuyOrder= ({tokenAddressPairs}) => {

    return (
        <>
            <h1>Buy Order</h1>
            <div className="d-flex flex-row">
                <input className='row mt-3' type="text" placeholder='Amount to buy'/>
                <select className="mt-3">
                    <option value=""></option>
                    {tokenAddressPairs && tokenAddressPairs.map(pair => (
                        <option value={pair.address} key={pair.address}>{pair.name}</option>
                    ))}                    
                </select>
            </div>
            <div className="d-flex flex-row">
                <input className='row mt-3' type="text" placeholder='Amount to pay'/>
                <select className="mt-3">
                    <option value=""></option>
                    {tokenAddressPairs && tokenAddressPairs.map(pair => (
                        <option value={pair.address} key={pair.address}>{pair.name}</option>
                    ))}                    
                </select>
            </div>
            <input type="button" className='btn btn-success mt-3' value='Place Buy Order' />       
        </>
    );
};

export default BuyOrder;
