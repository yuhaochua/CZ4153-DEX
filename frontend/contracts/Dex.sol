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
    uint256 private numOrders;
    OrderbookFactory private books = new OrderbookFactory();
    bytes32[] private identifiers;

    address public owner;
    event LogTokenSent(address token, address receipient, uint256 amount);
    event LogTokenCreated(address tokenAddress, string tokenName, string tokenSymbol);
    event LogBuyOrderPlaced(address buyer, address buyToken, uint256 buyAmt, address payToken, uint256 payAmt);

    // Order struct containing price, quantity, and tokens being transacted
    struct Order {
        address orderedBy; // address of buyer/seller
        uint256 price;
        uint256 quantity;
        string token1;
        string token2;
        string orderType; // buy or sell
    }

    constructor () {
        owner = msg.sender;
        numTokens = 0;
        numOrders = 0;
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

    // the logic for this buy is a little weird, because the orderbook assumes the token to be bought/sold.
    // for example in orderbook for tokenA and tokenB. orderbook always assumes tokenA is the one being sold, 
    // tokenB is the one being bought. because of this, when we want to buy tokenA, we have to place a sell order for token B.
    function buy(address _buyToken, uint256 _buyAmt, address _payToken, uint256 _payAmt) public {
        // first check whether there is an existing orderboook for this pair of tokens
        address token1;
        address token2;
        if (uint160(_buyToken) > uint160(_payToken)) {
            token1 = _buyToken;
            token2 = _payToken;
        } else {
            token1 = _payToken;
            token2 = _buyToken;
        }
        bytes32 identifier = keccak256(abi.encodePacked(token1, token2));
        // if no existing orderbook for this pair of tokens then create it
        if(books.orderbooks(identifier) == address(0)){
            books.addPair(token1, token2);
            identifiers.push(identifier);
        }
        Orderbook book = Orderbook(books.orderbooks(identifier));
        // in orderbook token 1 acts as cash, token 2 acts as commodity.
        // so, by comparing _buyToken with token1, we will know if _buyToken here is cash or commodity.
        // if _buyToken is cash, means we need to place sell order, if is commodity, means we need to place buy order
        if(_buyToken == token1){
            //place sell order
            book.placeSell(_buyAmt, _payAmt, msg.sender);
        }else if(_buyToken == token2){
            //place buy order
            book.placeBuy(_payAmt, _buyAmt, msg.sender);
        }

        numOrders++;
        emit LogBuyOrderPlaced(msg.sender, _buyToken, _buyAmt, _payToken, _payAmt);
    }

    // will need this to retrieve address of orderbook, and address of token1 and token2 so we know which is getting bought/sold
    function getOrderbookAddress(address _token1, address _token2) view external returns (address, address, address) {
        address token1;
        address token2;
        if (uint160(_token1) > uint160(_token2)) {
            token1 = _token1;
            token2 = _token2;
        } else {
            token1 = _token2;
            token2 = _token1;
        }
        bytes32 identifier = keccak256(abi.encodePacked(token1, token2));
        return (books.orderbooks(identifier), token1, token2);
    }

    // create orderbook for the token pair and return the address
    function addTokenPair(address _token1, address _token2) external returns (address, address, address) {
        books.addPair(_token1, _token2);
        address token1;
        address token2;
        if (uint160(_token1) > uint160(_token2)) {
            token1 = _token1;
            token2 = _token2;
        } else {
            token1 = _token2;
            token2 = _token1;
        }
        bytes32 identifier = keccak256(abi.encodePacked(token1, token2));
        identifiers.push(identifier);
        return (books.orderbooks(identifier), token1, token2);
    }

    function getBuyOrders() view external returns (Order[] memory){
        // address token1;
        // address token2;
        // if (uint160(_token1) > uint160(_token2)) {
        //     token1 = _token1;
        //     token2 = _token2;
        // } else {
        //     token1 = _token2;
        //     token2 = _token1;
        // }
        // bytes32 identifier = keccak256(abi.encodePacked(token1, token2));
        // require(books.orderbooks(identifier) != address(0), "orderbook doesnt exist!");

        address[] memory addressTemp;
        uint256[] memory priceTemp;
        uint256[] memory quantityTemp;
        string memory _token1;
        string memory _token2;

        // address[] memory bsAddressTemp = new address[](numOrders); // stores address of buyer or seller
        Order[] memory _orders = new Order[](numOrders);
        // uint256[] memory buyPriceTemp = new uint256[](numOrders);
        // uint256[] memory buyQuantityTemp = new uint256[](numOrders);

        // address[] memory sellAddressTemp = new address[](numOrders);
        // uint256[] memory sellPriceTemp = new uint256[](numOrders);
        // uint256[] memory sellQuantityTemp = new uint256[](numOrders);
        uint256 k = 0; // for looping through orders
        // uint256 x = 0; // for looping through sell orders
        //loop through the available tokens
        for(uint256 i=0; i < identifiers.length; i++) {
            Orderbook book = Orderbook(books.orderbooks(identifiers[i]));
            (addressTemp, priceTemp, quantityTemp) = book.getBuySide();
            // _token1 = getTokenName(book.token1.address);
            // _token2 = getTokenName(book.token2.address);
            _token1 = getTokenName(address(book.token1()));
            _token2 = getTokenName(address(book.token2()));
            
            for(uint256 j=0; j < addressTemp.length; j++){
                // bsAddressTemp[k] = (addressTemp[j]);
                _orders[k] = Order(addressTemp[j], priceTemp[j], quantityTemp[j], _token1, _token2, "buy");
                // buyPriceTemp[k] = (priceTemp[j]);
                // buyQuantityTemp[k] = (quantityTemp[j]);
                k++;
            }

            (addressTemp, priceTemp, quantityTemp) = book.getSellSide();
            for(uint256 j=0; j < addressTemp.length; j++){
                // bsAddressTemp[k] = (addressTemp[j]);
                _orders[k] = Order(addressTemp[j], priceTemp[j], quantityTemp[j], _token1, _token2, "sell");
                // sellPriceTemp[x] = (priceTemp[j]);
                // sellQuantityTemp[x] = (quantityTemp[j]);
                k++;
            }
        }
        // still missing names of token being bought/sold.
        // buyPriceTemp holds the amount of token1 being paid, buyQuantityTemp holds the amount of token2 being bought
        // buyAddressTemp holds wallet addresses of those who placed the buy orders
        // 
        return _orders;
    }


}


/* This contract represents a factory to create an arbitrary number of orderbooks
 * for unique trading pairs. If an orderbook for the trading pair already exists
 * then contract execution will revert.
 */
contract OrderbookFactory {
    // number of pairs supported
    uint256 public pairsSupported;

    // mapping of existing orderbooks
    mapping(bytes32 => address) public orderbooks;

    // event emitted every time a new token pair is added
    event NewPair(address indexed token1, address indexed token2);

    // Creates a new orderbook contract instance for the token pair
    function addPair(address _token1, address _token2) external {
        require(_token1 != _token2, "Tokens must be different");

        address token1;
        address token2;

        /* This ensures that token addresses are order correctly, this way if
         * the same pair is entered but in different order, a new orderbook will
         * NOT be created!
         */
        if (uint160(_token1) > uint160(_token2)) {
            token1 = _token1;
            token2 = _token2;
        } else {
            token1 = _token2;
            token2 = _token1;
        }

        // mapping identifier is computed from the hash of the ordered addresses
        bytes32 identifier = keccak256(abi.encodePacked(token1, token2));
        require(
            orderbooks[identifier] == address(0),
            "Token pair already exists"
        );

        /* create the new orderbook contract for the pair and store its address
         * in the orderbooks mapping
         */
        orderbooks[identifier] = address(new Orderbook(token1, token2));
        pairsSupported++;

        emit NewPair(token1, token2);
    }
}

/* This contract represents an orderbook with a buy side and sell side of the
 * book. This contract maintains an ordered list of both the buy side and the
 * sell side of the book and allows any user to remove his or her order. There
 * is also functionality to return both the buy and sell side of the book. Please
 * see the README for further assumptions.
 */
contract Orderbook {
    IERC20 public token1;
    IERC20 public token2;

    // Order struct containing price, quantity, and date created
    struct Order {
        uint256 price;
        uint256 quantity;
        uint256 date;
    }

    // mapping of buyer address to buy order
    mapping(address => Order) buyOrders;

    // mapping used to preserve order based on buy price
    mapping(address => address) nextBuy;

    // overall buy order count
    uint256 public buyCount;

    // mapping of seller address to sell order
    mapping(address => Order) sellOrders;

    // mapping used to preserve order based on sell price
    mapping(address => address) nextSell;

    // overall sell order count
    uint256 public sellCount;

    // BUFFER used to signal beginning and end of order mappings
    address constant BUFFER = address(1);

    // event emitted whenever a buy order is placed
    event BuyOrderPlaced(
        uint256 indexed price,
        uint256 quantity,
        address indexed buyer
    );

    // event emitted whenever a buy order is cancelled
    event CancelBuyOrder(address indexed buyer);

    // event emitted whenever a sell order is placed
    event SellOrderPlaced(
        uint256 indexed price,
        uint256 quantity,
        address indexed seller
    );

    // event emitted whenever a sell order is cancelled
    event CancelSellOrder(address indexed seller);

    // initialize token1 and token2 of the pair
    constructor(address _token1, address _token2) {
        token1 = IERC20(_token1);
        token2 = IERC20(_token2);

        // initialize order mappings
        nextBuy[BUFFER] = BUFFER;
        nextSell[BUFFER] = BUFFER;
    }

    /* Helper function used to verify the correct insertion position of a
     * buy order when it is added to the buy side. Returns true if the order is
     * at least as expensive as the previous buy order in the list and definitely
     * more expensive than the next order in the list (for descending order)
     */
    function _verifyIndexBuy(
        address prev,
        uint256 price,
        address next
    ) internal view returns (bool) {
        return ((prev == BUFFER || price <= buyOrders[prev].price) &&
            (next == BUFFER || price > buyOrders[next].price));
    }

    /* Helper function used to verify the correct insertion position of a
     * sell order when it is added to the sell side. Returns true if the order is
     * at least as cheap as the previous sell order in the list and definitely
     * less expensive than the next order in the list (for ascending order)
     */
    function _verifyIndexSell(
        address prev,
        uint256 price,
        address next
    ) internal view returns (bool) {
        return ((prev == BUFFER || price >= sellOrders[prev].price) &&
            (next == BUFFER || price < sellOrders[next].price));
    }

    /* Helper function that finds the previous buy order address for the new buy
     * order to add to the list based on the new buy order price.
     */
    function _findPrevBuy(uint256 price) internal view returns (address) {
        address prev = BUFFER;
        while (true) {
            if (_verifyIndexBuy(prev, price, nextBuy[prev])) {
                return prev;
            }
            prev = nextBuy[prev];
        }
    }

    /* Helper function that finds the previous sell order address for the new
     * sell order to add to the list based on the new sell order price.
     */
    function _findPrevSell(uint256 price) internal view returns (address) {
        address prev = BUFFER;
        while (true) {
            if (_verifyIndexSell(prev, price, nextSell[prev])) {
                return prev;
            }
            prev = nextSell[prev];
        }
    }

    /* Finds the previous address of the target address in the order mapping of
     * either buy or sell order addresses. Used for removing buy or sell orders.
     */
    function _getPrevious(address target) internal view returns (address) {
        address current = BUFFER;
        while (nextBuy[current] != BUFFER) {
            if (nextBuy[current] == target) {
                return current;
            }
            current = nextBuy[current];
        }
    }

    // Places a buy order and locks associated collateral
    function placeBuy(uint256 _price, uint256 _quantity, address _buyer) external {
        // Only one buy order per address
        require(
            buyOrders[_buyer].date == 0,
            "First delete existing buy order"
        );
        require(
            _price != 0 && _quantity != 0,
            "Must have nonzero pice and quantity"
        );

        // Create a new order in the buy order mapping for _buyer
        buyOrders[_buyer] = Order(_price, _quantity, block.timestamp);

        /* Add _buyer into the appropriate position in the ordering mapping.
         * This is similar to linked list insertion
         */
        address prev = _findPrevBuy(_price);
        address temp = nextBuy[prev];
        nextBuy[prev] = _buyer;
        nextBuy[_buyer] = temp;

        // Increment the overall buy count
        buyCount++;

        /* Transfer the buy order quantity of token1 from the buyer to the
         * orderbook contract. This locks the associated collateral
         */
        token1.transferFrom(_buyer, address(this), _price);

        // Emit buy order placed event
        emit BuyOrderPlaced(_price, _quantity, _buyer);
    }

    // Cancels the buy order associated with _buyer if it exists
    function cancelBuy() external {
        require(
            buyOrders[msg.sender].date != 0,
            "Buy order must already exist"
        );

        // Store quantity of buy order to refund msg.sender with correct amount
        uint256 quantity = buyOrders[msg.sender].quantity;

        // Find the previous address of the msg.sender in the ordering mapping
        address prev = _getPrevious(msg.sender);

        // Delete msg.sender from ordering mapping. Similar to linked list deletion
        nextBuy[prev] = nextBuy[msg.sender];

        // Delete buy order from buy order mapping and ordering mapping
        delete nextBuy[msg.sender];
        delete buyOrders[msg.sender];

        // Decrement the buy count
        buyCount--;

        // approve corresponding wallet to draw funds from this contract
        token1.approve(msg.sender, quantity);
        // uint256 allowance = token1.allowance(address(this), msg.sender);
        // Unlock associated collateral and send it back to msg.sender
        token1.transfer(msg.sender, quantity);

        // Emit a cancel buy order event
        emit CancelBuyOrder(msg.sender);
    }

    // Places a sell order and locks associated collateral
    function placeSell(uint256 _price, uint256 _quantity, address _seller) external {
        // Only one sell order per address
        require(
            sellOrders[_seller].date == 0,
            "First delete existing sell order"
        );
        require(
            _price != 0 && _quantity != 0,
            "Must have nonzero pice and quantity"
        );

        // Create a new order in the sell order mapping for _seller
        sellOrders[_seller] = Order(_price, _quantity, block.timestamp);

        /* Add _seller into the appropriate position in the ordering mapping.
         * This is similar to linked list insertion
         */
        address prev = _findPrevSell(_price);
        address temp = nextSell[prev];
        nextSell[prev] = _seller;
        nextSell[_seller] = temp;

        // Increment the sell count
        sellCount++;

        /* Transfer the sell order quantity of token2 from the seller to the
         * orderbook contract. This locks the associated collateral
         */
        token2.transferFrom(_seller, address(this), _quantity);

        // Emit a sell order placed event
        emit SellOrderPlaced(_price, _quantity, _seller);
    }

    // Cancels the sell order associated with msg.sender if it exists
    function cancelSell() external {
        require(
            sellOrders[msg.sender].date != 0,
            "Sell order must already exist"
        );

        // Store quantity of sell order to refund msg.sender with correct amount
        uint256 quantity = sellOrders[msg.sender].quantity;

        // Find the previous address of the msg.sender in the ordering mapping
        address prev = _getPrevious(msg.sender);

        // Delete msg.sender from ordering mapping. Similar to linked list deletion
        nextSell[prev] = nextSell[msg.sender];

        // Delete sell order from sell order mapping and ordering mapping
        delete nextSell[msg.sender];
        delete sellOrders[msg.sender];

        // Decrement sell count
        sellCount--;

        // approve corresponding wallet to draw funds from this contract
        token2.approve(msg.sender, quantity);
        // console.log(token2.allowance(address(this), msg.sender));
        // Unlock associated collateral and send it back to msg.sender
        token2.transfer(msg.sender, quantity);

        // Emit a cencel sell order event
        emit CancelSellOrder(msg.sender);
    }

    /* Returns the buy side of the orderbook in three separate arrays. The first
     * array contains all the addresses with active buy orders, and the second
     * and third arrays contain the associated prices and quantities of these
     * buy orders respectively. Arrays are returned in descending order
     */
    function getBuySide()
        external
        view
        returns (
            address[] memory,
            uint256[] memory,
            uint256[] memory
        )
    {
        // Instantiate three arrays equal in length to the total buy count
        address[] memory addressTemp = new address[](buyCount);
        uint256[] memory priceTemp = new uint256[](buyCount);
        uint256[] memory quantityTemp = new uint256[](buyCount);

        // Set current address equal to the first buy order address
        address current = nextBuy[BUFFER];

        // Iterate through each array and store the corresponding values
        for (uint256 i = 0; i < addressTemp.length; i++) {
            addressTemp[i] = current;
            Order storage order = buyOrders[current];

            priceTemp[i] = order.price;
            quantityTemp[i] = order.quantity;

            current = nextBuy[current];
        }

        // Return the three arrays
        return (addressTemp, priceTemp, quantityTemp);
    }

    /* Returns the sell side of the orderbook in three separate arrays. The first
     * array contains all the addresses with active sell orders, and the second
     * and third arrays contain the associated prices and quantities of these
     * sell orders respectively. Arrays are returned in ascending order
     */
    function getSellSide()
        external
        view
        returns (
            address[] memory,
            uint256[] memory,
            uint256[] memory
        )
    {
        // Instantiate three arrays equal in length to the total sell count
        address[] memory addressTemp = new address[](sellCount);
        uint256[] memory priceTemp = new uint256[](sellCount);
        uint256[] memory quantityTemp = new uint256[](sellCount);

        // Set current address equal to the first sell order address
        address current = nextSell[BUFFER];

        // Iterate through each array and store the corresponding values
        for (uint256 i = 0; i < addressTemp.length; i++) {
            addressTemp[i] = current;
            Order storage order = sellOrders[current];

            priceTemp[i] = order.price;
            quantityTemp[i] = order.quantity;

            current = nextSell[current];
        }

        // Return the three arrays
        return (addressTemp, priceTemp, quantityTemp);
    }

    /* Returns the spread of the orderbook defined as the absolute value of the
     * difference between the highest buy price and the lowest sell price.
     */
    function getSpread() external view returns (uint256) {
        uint256 bestSell = sellOrders[nextSell[BUFFER]].price;
        uint256 bestBuy = buyOrders[nextBuy[BUFFER]].price;

        // Return the spread as a positive number (uint must be positive)
        return bestBuy > bestSell ? bestBuy - bestSell : bestSell - bestBuy;
    }
}

