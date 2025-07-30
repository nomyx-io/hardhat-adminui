// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { LibDiamond } from "../libraries/LibDiamond.sol";

/**
 * @title CounterFacet
 * @dev A sample facet that demonstrates basic diamond functionality with a simple counter
 *      This facet provides increment, decrement, and view operations for a counter value
 *      stored in diamond storage. It serves as an example of how to implement business
 *      logic in a diamond facet while using the diamond storage pattern.
 */
contract CounterFacet {
    // Custom storage struct for this facet
    struct CounterStorage {
        uint256 counter;
        address lastUpdater;
        uint256 lastUpdateTimestamp;
        mapping(address => uint256) userCounters;
    }

    // Storage position for this facet
    bytes32 constant COUNTER_STORAGE_POSITION = keccak256("counter.facet.storage");

    // Events
    event CounterIncremented(address indexed user, uint256 newValue);
    event CounterDecremented(address indexed user, uint256 newValue);
    event CounterReset(address indexed user, uint256 previousValue);
    event UserCounterUpdated(address indexed user, uint256 newValue);

    /**
     * @notice Get the counter storage
     * @dev Internal function to access the counter's diamond storage slot
     * @return cs The counter storage struct
     */
    function counterStorage() internal pure returns (CounterStorage storage cs) {
        bytes32 position = COUNTER_STORAGE_POSITION;
        assembly {
            cs.slot := position
        }
    }

    /**
     * @notice Increment the global counter by 1
     * @dev Increases the global counter and updates metadata
     */
    function increment() external {
        CounterStorage storage cs = counterStorage();
        cs.counter += 1;
        cs.lastUpdater = msg.sender;
        cs.lastUpdateTimestamp = block.timestamp;
        
        emit CounterIncremented(msg.sender, cs.counter);
    }

    /**
     * @notice Decrement the global counter by 1
     * @dev Decreases the global counter and updates metadata
     *      Reverts if counter would go below zero
     */
    function decrement() external {
        CounterStorage storage cs = counterStorage();
        require(cs.counter > 0, "CounterFacet: Counter cannot go below zero");
        
        cs.counter -= 1;
        cs.lastUpdater = msg.sender;
        cs.lastUpdateTimestamp = block.timestamp;
        
        emit CounterDecremented(msg.sender, cs.counter);
    }

    /**
     * @notice Reset the global counter to zero
     * @dev Only the diamond owner can reset the counter
     */
    function resetCounter() external {
        LibDiamond.enforceIsContractOwner();
        CounterStorage storage cs = counterStorage();
        
        uint256 previousValue = cs.counter;
        cs.counter = 0;
        cs.lastUpdater = msg.sender;
        cs.lastUpdateTimestamp = block.timestamp;
        
        emit CounterReset(msg.sender, previousValue);
    }

    /**
     * @notice Get the current global counter value
     * @return The current counter value
     */
    function getCounter() external view returns (uint256) {
        return counterStorage().counter;
    }

    /**
     * @notice Get metadata about the last counter update
     * @return lastUpdater Address of the last user to update the counter
     * @return lastUpdateTimestamp Timestamp of the last update
     */
    function getCounterMetadata() external view returns (address lastUpdater, uint256 lastUpdateTimestamp) {
        CounterStorage storage cs = counterStorage();
        return (cs.lastUpdater, cs.lastUpdateTimestamp);
    }

    /**
     * @notice Increment a user's personal counter
     * @dev Each user has their own counter independent of the global one
     */
    function incrementUserCounter() external {
        CounterStorage storage cs = counterStorage();
        cs.userCounters[msg.sender] += 1;
        
        emit UserCounterUpdated(msg.sender, cs.userCounters[msg.sender]);
    }

    /**
     * @notice Get a user's personal counter value
     * @param user The address of the user
     * @return The user's counter value
     */
    function getUserCounter(address user) external view returns (uint256) {
        return counterStorage().userCounters[user];
    }

    /**
     * @notice Set a user's counter to a specific value
     * @dev Only the user themselves or the diamond owner can set their counter
     * @param value The new counter value
     */
    function setUserCounter(uint256 value) external {
        CounterStorage storage cs = counterStorage();
        cs.userCounters[msg.sender] = value;
        
        emit UserCounterUpdated(msg.sender, value);
    }

    /**
     * @notice Set any user's counter (owner only)
     * @dev Only the diamond owner can set other users' counters
     * @param user The user whose counter to set
     * @param value The new counter value
     */
    function setUserCounterAsOwner(address user, uint256 value) external {
        LibDiamond.enforceIsContractOwner();
        CounterStorage storage cs = counterStorage();
        cs.userCounters[user] = value;
        
        emit UserCounterUpdated(user, value);
    }
}