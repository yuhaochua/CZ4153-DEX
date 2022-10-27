const BuyOrder= () => {

    return (
        <>
            <h1>Buy Order</h1>
            <input className='row mt-3' type="text" placeholder='Amount'/>
            <input className='row mt-3' type="text" placeholder='Limit Price'/>
            <input type="button" className='btn btn-success mt-3' value='Place Buy Order' />       
        </>
    );
};

export default BuyOrder;
