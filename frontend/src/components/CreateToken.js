import { useState } from "react";
import { createToken } from '../Dex.js';

const CreateToken= ({ addr }) => {
    const [tokenName, setTokenName] = useState('')
    const [tokenSymbol, setTokenSymbol] = useState('')


    const handleCreateToken = async(e) => {
        e.preventDefault()
        console.log(tokenName, tokenSymbol)
        await createToken(tokenName, tokenSymbol, addr)
    }

    return (
        <>
            <div>
                <h1>Create Token</h1>
                <input className='row mt-3' type="text" placeholder='Name' onChange={(e) => setTokenName(e.target.value)}/>
                <input className='row mt-3' type="text" placeholder='Symbol' onChange={(e) => setTokenSymbol(e.target.value)}/>
                <input type="button" className='btn btn-primary mt-3' value='Create New Token' onClick={handleCreateToken}/>      
            </div>
        </>
    );
};

export default CreateToken;