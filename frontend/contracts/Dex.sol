pragma solidity ^0.8.17;

import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20 {
    address public admin;

    constructor(string memory _name, string memory _symbol) ERC20(_name, _symbol) {
        admin = msg.sender;
        _mint(msg.sender, 1000);
    }

    function mint(address _to, uint256 _amount) external {
        require(msg.sender == admin, "Only admin can mint");
        _mint(_to, _amount);
    }
}

contract Dex {
    mapping (address => ERC20) private availableTokens;
    address[] private tokenAddresses;
    uint256 private numTokens;

    address public owner;
    event LogTokenSent(address token, address receipient, uint256 amount);
    event LogTokenCreated(address tokenAddress, string tokenName, string tokenSymbol);

    constructor () {
        owner = msg.sender;
        numTokens = 0;
    }


    // Allows admin to create new token, and new token will be added into availableTokens dict.
    function createToken(string memory _name, string memory _symbol) public {
        // only allow owner to create tokens
        require(owner == msg.sender, "Only the owner can create tokens!");

        //mapping address of new Token created
        address newTokenAddress = address(new Token(_name, _symbol));
        availableTokens[newTokenAddress] = ERC20(newTokenAddress);
        tokenAddresses.push(newTokenAddress);
        numTokens++;

        // log token creation event
        emit LogTokenCreated(newTokenAddress, _name, _symbol);
    }

    // Allows admin to send token
    function sendToken(address _token, address _receipient, uint256 _amount) public {
        // only allow owner to create tokens
        require(owner == msg.sender, "Only the owner can send tokens!");
        ERC20 ERC20TOKEN = availableTokens[_token];
        ERC20TOKEN.transfer(_receipient, _amount);

        // log token sent event
        emit LogTokenSent(_token, _receipient, _amount);
    }

    // Returns an array of available tokens
    function getAvailableTokens() public view returns(address[] memory) {
        address[] memory addressTemp = new address[](numTokens);

        //loop through the available tokens
        for (uint256 i=0; i < numTokens; i++) {
            if(tokenAddresses[i] == address(0)){
                i--; //so that i does not increase
                continue;
            }
            addressTemp[i] = tokenAddresses[i];
        }
        return addressTemp;
    }

    function getTokenName(address _token) public view returns(string memory) {
        ERC20 ERC20TOKEN = availableTokens[_token];
        return ERC20TOKEN.name();
    }

    function getTokenBalance(address _token) public view returns(uint256) {
        ERC20 ERC20TOKEN = availableTokens[_token];
        return ERC20TOKEN.balanceOf(msg.sender);
    }
}

