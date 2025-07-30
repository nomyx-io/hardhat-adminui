// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title Marketplace
 * @dev A simple marketplace for buying and selling items
 */
contract Marketplace {
    struct Item {
        uint256 id;
        string name;
        string description;
        uint256 price;
        address payable seller;
        bool sold;
        uint256 listedAt;
    }
    
    uint256 public nextItemId;
    uint256 public marketplaceFee; // Fee in basis points (100 = 1%)
    address public owner;
    bool public paused;
    
    mapping(uint256 => Item) public items;
    mapping(address => uint256[]) public sellerItems;
    mapping(address => uint256) public sellerEarnings;
    
    event ItemListed(
        uint256 indexed itemId,
        string name,
        uint256 price,
        address indexed seller
    );
    
    event ItemSold(
        uint256 indexed itemId,
        string name,
        uint256 price,
        address indexed seller,
        address indexed buyer
    );
    
    event ItemRemoved(uint256 indexed itemId, address indexed seller);
    event EarningsWithdrawn(address indexed seller, uint256 amount);
    event FeeUpdated(uint256 oldFee, uint256 newFee);
    event MarketplacePaused(bool paused);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier notPaused() {
        require(!paused, "Marketplace is paused");
        _;
    }
    
    modifier itemExists(uint256 _itemId) {
        require(_itemId < nextItemId, "Item does not exist");
        _;
    }
    
    constructor(uint256 _marketplaceFee) {
        owner = msg.sender;
        marketplaceFee = _marketplaceFee;
        nextItemId = 1; // Start IDs from 1
    }
    
    function listItem(
        string memory _name,
        string memory _description,
        uint256 _price
    ) public notPaused returns (uint256) {
        require(bytes(_name).length > 0, "Item name cannot be empty");
        require(_price > 0, "Price must be greater than 0");
        
        uint256 itemId = nextItemId;
        nextItemId++;
        
        items[itemId] = Item({
            id: itemId,
            name: _name,
            description: _description,
            price: _price,
            seller: payable(msg.sender),
            sold: false,
            listedAt: block.timestamp
        });
        
        sellerItems[msg.sender].push(itemId);
        
        emit ItemListed(itemId, _name, _price, msg.sender);
        return itemId;
    }
    
    function buyItem(uint256 _itemId) public payable notPaused itemExists(_itemId) {
        Item storage item = items[_itemId];
        require(!item.sold, "Item already sold");
        require(msg.sender != item.seller, "Cannot buy your own item");
        require(msg.value == item.price, "Incorrect payment amount");
        
        item.sold = true;
        
        uint256 fee = (item.price * marketplaceFee) / 10000;
        uint256 sellerAmount = item.price - fee;
        
        sellerEarnings[item.seller] += sellerAmount;
        
        emit ItemSold(_itemId, item.name, item.price, item.seller, msg.sender);
    }
    
    function removeItem(uint256 _itemId) public itemExists(_itemId) {
        Item storage item = items[_itemId];
        require(msg.sender == item.seller, "Only seller can remove item");
        require(!item.sold, "Cannot remove sold item");
        
        delete items[_itemId];
        emit ItemRemoved(_itemId, msg.sender);
    }
    
    function withdrawEarnings() public {
        uint256 earnings = sellerEarnings[msg.sender];
        require(earnings > 0, "No earnings to withdraw");
        
        sellerEarnings[msg.sender] = 0;
        payable(msg.sender).transfer(earnings);
        
        emit EarningsWithdrawn(msg.sender, earnings);
    }
    
    function getSellerItems(address _seller) public view returns (uint256[] memory) {
        return sellerItems[_seller];
    }
    
    function getItemCount() public view returns (uint256) {
        return nextItemId - 1;
    }
    
    // Owner functions
    function setMarketplaceFee(uint256 _newFee) public onlyOwner {
        require(_newFee <= 1000, "Fee cannot exceed 10%"); // Max 10%
        uint256 oldFee = marketplaceFee;
        marketplaceFee = _newFee;
        emit FeeUpdated(oldFee, _newFee);
    }
    
    function setPaused(bool _paused) public onlyOwner {
        paused = _paused;
        emit MarketplacePaused(_paused);
    }
    
    function withdrawFees() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        payable(owner).transfer(balance);
    }
    
    // Emergency function to withdraw specific earnings (owner only)
    function emergencyWithdraw(address _seller) public onlyOwner {
        uint256 earnings = sellerEarnings[_seller];
        require(earnings > 0, "No earnings for this seller");
        
        sellerEarnings[_seller] = 0;
        payable(_seller).transfer(earnings);
        emit EarningsWithdrawn(_seller, earnings);
    }
}