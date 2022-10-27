import '../styles/navbar.css';
import ether from '../icons/ether.png';
import Blockies from 'react-blockies';

const Navbar = ( { address, ethBalance } ) => {

    return (
        <div className="navbar">
            <h1 className="align-content-center mb-0">
                <div className="dex-name">Minimal Viable Decentralized Exchange</div>
            </h1>
            <nav className="address-n-ether">
                <div>
                    <Blockies
                        seed="Jeremy"
                    />
                    <span>{ address }</span>

                    <img className="etherLogo" src={ether} alt="etherLogo" />
                    <span>{ ethBalance }</span>

                </div>    
            </nav>                
        </div>
    );
};

export default Navbar;
