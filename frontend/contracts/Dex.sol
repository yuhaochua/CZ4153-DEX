// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";

/* OrderbookFactory
   ===========================
   Creates a new Orderbook between 2 supported tokens
*/
contract OrderbookFactory {
    //Existing Orderbooks
    mapping(bytes32 => address) public orderbooks;
    event newPair(address indexed token1, address indexed token2);
    function addPair(address token1, address token2) external {
        require(token1 != token2, "Token must be different!");

        bytes32 orderbookID = keccak256(abi.encodePacked(token1, token2)); // Compute orderbookID from  the hash of the ordered address
        require(orderbooks[orderbookID] == address(0), "Token pair already exists"); 

        orderbooks[orderbookID] = address(new Orderbook(token1, token2)); // Instantiate new Orderbook contract
        emit newPair(token1, token2);
    }
}

contract Orderbook{
    string name; //token2/token1
    IERC20 token1;
    IERC20 token2;
    
    struct Order{
        uint256 price;
        uint256 quantity;
        uint256 date;
        uint256 unitPrice;
    }

    mapping(address => Order) buyOrders; //Maps Buy Orders
    mapping(address => address) nextBuy; 
    uint256 public buyCount;

    mapping(address => Order) sellOrders; //Maps Sell Orders
    mapping(address => address) nextSell;
    uint256 public sellCount;

    address constant BUFFER = address(1);

    event CancelBuyOrder(address indexed buyer);
    event CancelSellOrder(address indexed seller);

    event BuyOrderPlaced(
        uint256 indexed unitPrice,
        uint256 price,
        uint256 quantity,
        address indexed buyer
    );
    event SellOrderPlaced(
        uint256 indexed unitPrice,
        uint256 price,
        uint256 quantity,
        address indexed seller
    );

    /* Constructor
       =========================================
    */
    constructor(address _token1, address _token2){
        token1 = IERC20(_token1);
        token2 = IERC20(_token2);
        nextBuy[BUFFER] = BUFFER;
        nextSell[BUFFER] = BUFFER;
    }

    function _verifyIndexBuy( 
        address prev,
        uint256 unitPrice,
        address next
    ) internal view returns (bool) {
        return ((prev == BUFFER || unitPrice <= buyOrders[prev].unitPrice) && 
            (next == BUFFER || unitPrice > buyOrders[next].unitPrice));
    }
    function _verifyIndexSell(
        address prev,
        uint256 unitPrice,
        address next
    ) internal view returns (bool) {
        return ((prev == BUFFER || unitPrice >= sellOrders[prev].unitPrice) &&
            (next == BUFFER || unitPrice < sellOrders[next].unitPrice));
    }
    

    function _findPrevBuy(uint256 unitPrice) internal view returns (address) {
        address prev = BUFFER;
        while (true) {
            if (_verifyIndexBuy(prev, unitPrice, nextBuy[prev])) {
                return prev;
            }
            prev = nextBuy[prev];
        }
    }
    function _findPrevSell(uint256 unitPrice) internal view returns (address) {
        address prev = BUFFER;
        while (true) {
            if (_verifyIndexSell(prev, unitPrice, nextSell[prev])) {
                return prev;
            }
            prev = nextSell[prev];
        }
    }

    function _getPrevious(address target) internal view returns (address) {
        address current = BUFFER;
        while (nextBuy[current] != BUFFER) {
            if (nextBuy[current] == target) {
                return current;
            }
            current = nextBuy[current];
        }
    }
    
    function placeBuy(uint256 _price, uint256 _quantity) external { // Places a buy order and locks associated collateral
        require( 
            buyOrders[msg.sender].date == 0, // Only one buy order per address
            "First delete existing buy order"
        );
        require(
            _price != 0 && _quantity != 0,
            "Must have nonzero pice and quantity"
        );

        buyOrders[msg.sender] = Order(_price, _quantity, block.timestamp, _price/_quantity); // Create a new order in the buy order mapping for msg.sender

        // Add msg.sender into the appropriate position in the ordering mapping. This is similar to linked list insertion
        address prev = _findPrevBuy(_price/_quantity);
        address temp = nextBuy[prev];
        nextBuy[prev] = msg.sender;
        nextBuy[msg.sender] = temp;

        buyCount++; // Increment the overall buy count
        token1.transferFrom(msg.sender, address(this), _price); // Transfer the buy order price of token1 from the buyer to the orderbook contract. This locks the associated collateral
        emit BuyOrderPlaced(_price/_quantity,_price, _quantity, msg.sender);  // Emit buy order placed event
    }

    function cancelBuy() external { // Cancels the buy order associated with msg.sender if it exists
        require(
            buyOrders[msg.sender].date != 0,
            "Buy order must already exist"
        );
        uint256 quantity = buyOrders[msg.sender].quantity; // Store quantity of buy order to refund msg.sender with correct amount
        address prev = _getPrevious(msg.sender); // Find the previous address of the msg.sender in the ordering mapping
        nextBuy[prev] = nextBuy[msg.sender]; // Delete msg.sender from ordering mapping. Similar to linked list deletion

        // Delete buy order from buy order mapping and ordering mapping
        delete nextBuy[msg.sender];
        delete buyOrders[msg.sender];
        buyCount--; // Decrement the buy count
        token1.transfer(msg.sender, quantity); // Unlock associated collateral and send it back to msg.sender
        emit CancelBuyOrder(msg.sender); // Emit a cancel buy order event
    }

    function placeSell(uint256 _price, uint256 _quantity) external { // Places a sell order and locks associated collateral
        require(
            sellOrders[msg.sender].date == 0, // Only one sell order per address
            "First delete existing sell order"
        );
        require(
            _price != 0 && _quantity != 0,
            "Must have nonzero pice and quantity"
        );

        sellOrders[msg.sender] = Order(_price, _quantity, block.timestamp,_price/_quantity); // Create a new order in the sell order mapping for msg.sender

        // Add msg.sender into the appropriate position in the ordering mapping. This is similar to linked list insertion
        address prev = _findPrevSell(_price/_quantity);
        address temp = nextSell[prev];
        nextSell[prev] = msg.sender;
        nextSell[msg.sender] = temp;
        sellCount++; // Increment the sell count
        token2.transferFrom(msg.sender, address(this), _quantity); //Transfer the sell order quantity of token2 from the seller to the orderbook contract. This locks the associated collateral
        emit SellOrderPlaced(_price/_quantity,_price, _quantity, msg.sender); // Emit a sell order placed event
    }

    // Cancels the sell order associated with msg.sender if it exists
    function cancelSell() external {
        require(
            sellOrders[msg.sender].date != 0,
            "Sell order must already exist"
        );

        
        uint256 quantity = sellOrders[msg.sender].quantity; // Store quantity of sell order to refund msg.sender with correct amount
        address prev = _getPrevious(msg.sender); // Find the previous address of the msg.sender in the ordering mapping
        nextSell[prev] = nextSell[msg.sender]; // Delete msg.sender from ordering mapping. Similar to linked list deletion

        // Delete sell order from sell order mapping and ordering mapping
        delete nextSell[msg.sender];
        delete sellOrders[msg.sender];

        
        sellCount--; // Decrement sell count
        token2.transferFrom(address(this), msg.sender, quantity); // Unlock associated collateral and send it back to msg.sender
        emit CancelSellOrder(msg.sender); // Emit a cencel sell order event
    }

    /* Returns the buy side of the orderbook in four separate arrays. The first
     * array contains all the addresses with active buy orders, and second, third
     * and fourth arrays contain the associated unitPrices, prices and quantities of these
     * buy orders respectively. Arrays are returned in descending order
     */
    function getBuySide()
        external
        view
        returns (
            address[] memory,
            uint256[] memory,
            uint256[] memory,
            uint256[] memory
        )
    {
        // Instantiate four arrays equal in length to the total buy count
        address[] memory addressTemp = new address[](buyCount);
        uint256[] memory unitPriceTemp = new uint256[](buyCount);
        uint256[] memory priceTemp = new uint256[](buyCount);
        uint256[] memory quantityTemp = new uint256[](buyCount);

        // Set current address equal to the first buy order address
        address current = nextBuy[BUFFER];

        // Iterate through each array and store the corresponding values
        for (uint256 i = 0; i < addressTemp.length; i++) {
            addressTemp[i] = current;
            Order storage order = buyOrders[current];

            unitPriceTemp[i] = order.unitPrice;
            priceTemp[i] = order.price;
            quantityTemp[i] = order.quantity;

            current = nextBuy[current];
        }

        // Return the three arrays
        return (addressTemp, unitPriceTemp, priceTemp, quantityTemp);
    }

    /* Returns the sell side of the orderbook in four separate arrays. The first
     * array contains all the addresses with active sell orders, and the second, third
     * and fourth arrays contain the associated unitPrices, prices and quantities of these
     * sell orders respectively. Arrays are returned in ascending order
     */
    function getSellSide()
        external
        view
        returns (
            address[] memory,
            uint256[] memory,
            uint256[] memory,
            uint256[] memory
        )
    {
        // Instantiate four arrays equal in length to the total sell count
        address[] memory addressTemp = new address[](sellCount);
        uint256[] memory unitPriceTemp = new uint256[](sellCount);
        uint256[] memory priceTemp = new uint256[](sellCount);
        uint256[] memory quantityTemp = new uint256[](sellCount);

        // Set current address equal to the first sell order address
        address current = nextSell[BUFFER];

        // Iterate through each array and store the corresponding values
        for (uint256 i = 0; i < addressTemp.length; i++) {
            addressTemp[i] = current;
            Order storage order = sellOrders[current];

            unitPriceTemp[i] = order.unitPrice;
            priceTemp[i] = order.price;
            quantityTemp[i] = order.quantity;

            current = nextSell[current];
        }

        // Return the four arrays
        return (addressTemp, unitPriceTemp, priceTemp, quantityTemp);
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