const SellOrder= ({tokenAddressPairs}) => {
    return (
        <>
            <h1>Sell Order</h1>
            <div className="d-flex flex-row">
                <input className='row mt-3' type="text" placeholder='Amount to sell'/>
                <select className="mt-3">
                    <option value=""></option>
                    {tokenAddressPairs && tokenAddressPairs.map(pair => (
                        <option value={pair.address} key={pair.address}>{pair.name}</option>
                    ))}                    
                </select>
            </div>
            <div className="d-flex flex-row">
                <input className='row mt-3' type="text" placeholder='Amount to receive'/>
                <select className="mt-3">
                    <option value=""></option>
                    {tokenAddressPairs && tokenAddressPairs.map(pair => (
                        <option value={pair.address} key={pair.address}>{pair.name}</option>
                    ))}                    
                </select>
            </div>
            <input type="button" className='btn btn-danger mt-3' value='Place Sell Order' />       
        </>
    );
};

export default SellOrder;
