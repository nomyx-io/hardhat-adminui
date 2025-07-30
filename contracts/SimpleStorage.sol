// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title SimpleStorage
 * @dev Store & retrieve value in a variable
 */
contract SimpleStorage {
    uint256 public storedValue;
    address public owner;
    
    event ValueChanged(uint256 oldValue, uint256 newValue, address changedBy);
    
    constructor(uint256 _initialValue) {
        storedValue = _initialValue;
        owner = msg.sender;
        emit ValueChanged(0, _initialValue, msg.sender);
    }
    
    /**
     * @dev Store value in variable
     * @param _value value to store
     */
    function setValue(uint256 _value) public {
        uint256 oldValue = storedValue;
        storedValue = _value;
        emit ValueChanged(oldValue, _value, msg.sender);
    }
    
    /**
     * @dev Return value 
     * @return value of 'storedValue'
     */
    function getValue() public view returns (uint256) {
        return storedValue;
    }
    
    /**
     * @dev Increment the stored value by 1
     */
    function increment() public {
        setValue(storedValue + 1);
    }
    
    /**
     * @dev Reset value to zero (only owner)
     */
    function reset() public {
        require(msg.sender == owner, "Only owner can reset");
        setValue(0);
    }
}