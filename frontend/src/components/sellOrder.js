const SellOrder= () => {

    return (
        <>
            <h1>Sell Order</h1>
            <input className='row mt-3' type="text" placeholder='Amount'/>
            <input className='row mt-3' type="text" placeholder='Limit Price'/>
            <input type="button" className='btn btn-danger mt-3' value='Place Sell Order' />       
        </>
    );
};

export default SellOrder;
