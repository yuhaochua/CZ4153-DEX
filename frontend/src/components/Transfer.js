import '../styles/transfer.css';
import { Input } from "antd";
import ether from '../icons/ether.png';
import Blockies from 'react-blockies';

const Transfer = ({ transactionType }) => {

    return (
        <div className="transfer-form">
            {/* just trying out this Input component from antd library */}
                {/* <Input
            size="large"
            placeholder="ethToToken"
            autoComplete="off"
            name="ethToToken"
            /> */}
            <span>{transactionType}</span>
            <input name='transactionAmt'/>
            <input type='button' className='btn btn-primary btn-sm' value='trade'/>
        </div>
    );
};

export default Transfer;
