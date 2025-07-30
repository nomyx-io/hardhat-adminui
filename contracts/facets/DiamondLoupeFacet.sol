// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/******************************************************************************\
* Author: Nick Mudge <nick@perfectabstractions.com> (https://twitter.com/mudgen)
* EIP-2535 Diamonds: https://eips.ethereum.org/EIPS/eip-2535
*
* Implementation of the diamond loupe functions.
/******************************************************************************/

import { LibDiamond } from "../libraries/LibDiamond.sol";
import { IDiamondLoupe } from "../interfaces/IDiamondLoupe.sol";
import { IERC165 } from "@openzeppelin/contracts/interfaces/IERC165.sol";

/**
 * @title DiamondLoupeFacet
 * @dev Implementation of the DiamondLoupe standard which provides introspection functions
 *      to view what facets and functions are available in the diamond contract.
 *      The Diamond Loupe functions make it possible to look up facets and functions
 *      implemented by a diamond. This implementation is based on the EIP-2535 Diamond Standard.
 */
contract DiamondLoupeFacet is IDiamondLoupe, IERC165 {
    /// @notice Gets all facets and their selectors that are registered with the diamond
    /// @dev This function is used to inspect the full facet structure of the diamond
    /// @return facets_ An array of Facet structs containing the facet addresses and
    ///         their associated function selectors
    function facets() external override view returns (Facet[] memory facets_) {
        LibDiamond.DiamondStorage storage ds = LibDiamond.diamondStorage();
        uint256 numFacets = ds.facetAddresses.length;
        facets_ = new Facet[](numFacets);
        for (uint256 i; i < numFacets; i++) {
            address facetAddress_ = ds.facetAddresses[i];
            facets_[i].facetAddress = facetAddress_;
            facets_[i].functionSelectors = ds.facetFunctionSelectors[facetAddress_].functionSelectors;
        }
    }

    /// @notice Gets all the function selectors supported by a specific facet
    /// @dev Used to retrieve all function selectors managed by a single facet implementation
    /// @param _facet The facet address to query
    /// @return facetFunctionSelectors_ Array of function selectors (bytes4) supported by the facet
    function facetFunctionSelectors(address _facet) external override view returns (bytes4[] memory facetFunctionSelectors_) {
        LibDiamond.DiamondStorage storage ds = LibDiamond.diamondStorage();
        facetFunctionSelectors_ = ds.facetFunctionSelectors[_facet].functionSelectors;
    }

    /// @notice Get all the facet addresses registered in the diamond
    /// @dev Provides a complete list of implementation contracts that make up the diamond's functionality
    /// @return facetAddresses_ Array of all registered facet addresses
    function facetAddresses() external override view returns (address[] memory facetAddresses_) {
        LibDiamond.DiamondStorage storage ds = LibDiamond.diamondStorage();
        facetAddresses_ = ds.facetAddresses;
    }

    /// @notice Gets the facet address that implements a specific function
    /// @dev Used to determine which implementation contract handles a particular function.
    ///      This function is critical for understanding the diamond's current function routing.
    ///      If no facet is found for the selector, returns address(0).
    /// @param _functionSelector The 4-byte function selector to find the implementation for
    /// @return facetAddress_ The facet address implementing the function, or address(0) if not found
    function facetAddress(bytes4 _functionSelector) external override view returns (address facetAddress_) {
        LibDiamond.DiamondStorage storage ds = LibDiamond.diamondStorage();
        facetAddress_ = ds.selectorToFacetAndPosition[_functionSelector].facetAddress;
    }

    /// @notice Checks if the contract implements an interface
    /// @dev ERC-165 implementation that checks if the diamond supports a specific interface.
    ///      Returns true for IDiamondLoupe and IERC165 interfaces, and any additional
    ///      interfaces registered with the diamond.
    /// @param _interfaceId The interface identifier to check, as specified in ERC-165
    /// @return True if the contract implements the interface, false otherwise
    function supportsInterface(bytes4 _interfaceId) external view override returns (bool) {
        LibDiamond.DiamondStorage storage ds = LibDiamond.diamondStorage();
        return _interfaceId == type(IERC165).interfaceId || 
               _interfaceId == type(IDiamondLoupe).interfaceId ||
               ds.supportedInterfaces[_interfaceId];
    }
}