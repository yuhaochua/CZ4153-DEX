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
    mapping (address => uint) private balances;
    mapping (uint => address) private availableTokens;
    uint256 private numTokens=0;

    address public owner;
    event LogDepositMade(address accountAddress, uint amount);
    event LogTokenCreated(address tokenAddress, string tokenName, string tokenSymbol);

    constructor () {
        owner = msg.sender;
        availableTokens[0] = address(0);
    }


    // Allows admin to create new token, and new token will be added into availableTokens dict.
    function createToken(string memory _name, string memory _symbol) public {
        // only allow owner to create tokens
        // require(owner == msg.sender, "Only the owner can create tokens!");

        //mapping address of new Token created
        address newTokenAddress = address(new Token(_name, _symbol));
        availableTokens[numTokens] = newTokenAddress;
        numTokens++;

        // log token creation event
        emit LogTokenCreated(newTokenAddress, _name, _symbol);
    }

    // Returns an array of available tokens
    function getAvailableTokens() public view returns(address[] memory){
        address[] memory addressTemp = new address[](numTokens);

        //loop through the available tokens
        for (uint256 i=0; i < numTokens; i++) {
            addressTemp[i] = availableTokens[i];
        }
        return addressTemp;
    }


    function withdraw(uint withdrawAmount) public returns (uint remainingBal) {
        require(withdrawAmount <= balances[msg.sender]);

        balances[msg.sender] -= withdrawAmount;

        payable(msg.sender).transfer(withdrawAmount);

        return balances[msg.sender];
    }
}

