// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/******************************************************************************\
* Author: Nick Mudge <nick@perfectabstractions.com> (https://twitter.com/mudgen)
* EIP-2535 Diamonds: https://eips.ethereum.org/EIPS/eip-2535
*
* Implementation of a diamond.
/******************************************************************************/

import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/interfaces/IERC165.sol";
import "@openzeppelin/contracts/interfaces/IERC721.sol";
import "@openzeppelin/contracts/interfaces/IERC721Metadata.sol";

import "./interfaces/IERC721Enumerable.sol";
import "./libraries/DiamondLib.sol";
import { LibDiamond } from "./libraries/LibDiamond.sol";
import { DiamondLib } from "./libraries/DiamondLib.sol";
import { IDiamondCut } from "./interfaces/IDiamondCut.sol";
import { DiamondSettings } from "./interfaces/IDiamond.sol";
import { IERC173 } from "./interfaces/IERC173.sol";

/**
 * @title Diamond
 * @dev Core diamond proxy contract implementing the EIP-2535 Diamond Standard
 * Functionality has been separated into facets:
 * - DiamondCutFacet: Handles diamond cut operations
 * - DiamondLoupeFacet: Provides introspection functions
 * - OwnershipFacet: Handles ownership operations
 */
contract Diamond is Initializable, IERC173 {
    /**
     * @notice Initialize the Diamond contract
     * @param _owner The owner of the contract
     * @param params Diamond settings including name and symbol
     * @param _facets The initial facets to add
     * @param diamondInit The initialization contract
     * @param _calldata The initialization calldata
     */
    function initialize(
        address _owner,
        DiamondSettings memory params,
        IDiamondCut.FacetCut[] calldata _facets,
        address diamondInit,
        bytes calldata _calldata
    ) public initializer {
        // Set up interfaces
        LibDiamond.diamondStorage().supportedInterfaces[type(IERC165).interfaceId] = true;
        LibDiamond.diamondStorage().supportedInterfaces[type(IDiamondCut).interfaceId] = true;
        LibDiamond.diamondStorage().supportedInterfaces[type(IERC173).interfaceId] = true;
        LibDiamond.diamondStorage().supportedInterfaces[type(IERC721).interfaceId] = true;
        LibDiamond.diamondStorage().supportedInterfaces[type(IERC721Metadata).interfaceId] = true;
        LibDiamond.diamondStorage().supportedInterfaces[type(IERC721Enumerable).interfaceId] = true;

        // Initialize the diamond
        LibDiamond.diamondCut(_facets, diamondInit, _calldata);

        // Set the owner
        LibDiamond.setContractOwner(_owner);

        // Set the symbol and name of the diamond
        DiamondLib.diamondStorage().diamondContract.settings.owner = _owner;
        DiamondLib.diamondStorage().diamondContract.metadata['symbol'] = params.symbol;
        DiamondLib.diamondStorage().diamondContract.metadata['name'] = params.name;

        // Initialize the upgrade timelock
        LibDiamond.initializeUpgradeTimelock(LibDiamond.DEFAULT_UPGRADE_TIMELOCK);
    }

    /**
     * @notice Transfer ownership to a new address
     * @param _newOwner The new owner address
     */
    function transferOwnership(address _newOwner) external override {
        LibDiamond.enforceIsContractOwner();
        LibDiamond.setContractOwner(_newOwner);
    }

    /**
     * @notice Get the current contract owner
     * @return owner_ The current owner address
     */
    function owner() external override view returns (address owner_) {
        owner_ = LibDiamond.contractOwner();
    }

    /**
     * @notice Get this contract's address
     * @return This contract's address
     */
    function diamondAddress() external view returns (address) {
        return address(this);
    }

    /**
     * @dev Diamond Proxy fallback function
     * Find facet for function that is called and execute the
     * function using delegatecall
     */
    fallback() external payable {
        LibDiamond.DiamondStorage storage ds;
        bytes32 position = LibDiamond.DIAMOND_STORAGE_POSITION;
        // Get diamond storage
        assembly {
            ds.slot := position
        }
        // Get facet from function selector
        address facet = ds.selectorToFacetAndPosition[msg.sig].facetAddress;
        require(facet != address(0), "Diamond: Function does not exist");
        
        // Execute external function from facet using delegatecall and return any value
        assembly {
            // Copy function selector and any arguments
            calldatacopy(0, 0, calldatasize())
            // Execute function call using the facet
            let result := delegatecall(gas(), facet, 0, calldatasize(), 0, 0)
            // Get any return value
            returndatacopy(0, 0, returndatasize())
            // Return any return value or error back to the caller
            switch result
                case 0 {
                    revert(0, returndatasize())
                }
                default {
                    return(0, returndatasize())
                }
        }
    }

    // Allow contract to receive ETH
    receive() external payable {}
}
