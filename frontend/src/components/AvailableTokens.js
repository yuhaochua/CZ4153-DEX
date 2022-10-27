import { useState } from 'react';
import { useEffect } from 'react';
import { retrieveTokenName, retrieveTokenBalance } from '../Dex.js';

const AvailableTokens= ({ token, addr }) => {
    const [tokenName,setTokenName] = useState('')
    const [tokenBalance, setTokenBalance] = useState('')

    useEffect(() => {
        const populateTokenDetails = () => {
            retrieveTokenName(token).then((result) => {
                setTokenName(result)
            })
            
            retrieveTokenBalance(token, addr).then((result) => {
                setTokenBalance(result)
            })
        }
        populateTokenDetails()
        
    }, [])

    return (
        <div className='d-flex flex-row'>
            <h3 className='p-2' style={{color: 'green'}}>{tokenName}{":"}</h3><h3 className='p-2'>{tokenBalance}</h3>
        </div>
    );
};

export default AvailableTokens;