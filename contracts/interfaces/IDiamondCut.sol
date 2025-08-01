// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

/******************************************************************************\
* Author: Nick Mudge <nick@perfectabstractions.com> (https://twitter.com/mudgen)
* EIP-2535 Diamonds: https://eips.ethereum.org/EIPS/eip-2535
/******************************************************************************/

interface IDiamondCut {
    enum FacetCutAction {Add, Replace, Remove}
    // Add=0, Replace=1, Remove=2

    struct FacetCut {
        address facetAddress;
        FacetCutAction action;
        bytes4[] functionSelectors;
    }

    /// @notice Add/replace/remove any number of functions and optionally execute
    ///         a function with delegatecall
    /// @param _diamondCut Contains the facet addresses and function selectors
    /// @param _init The address of the contract or facet to execute _calldata
    /// @param _calldata A function call, including function selector and arguments
    ///                  _calldata is executed with delegatecall on _init
    function diamondCut(
        FacetCut[] calldata _diamondCut,
        address _init,
        bytes calldata _calldata
    ) external;
    
    /// @notice Propose an upgrade to be executed after the timelock period
    /// @param _diamondCut Contains the facet addresses and function selectors
    /// @param _init The address of the contract or facet to execute _calldata
    /// @param _calldata A function call, including function selector and arguments
    function proposeDiamondCut(
        FacetCut[] calldata _diamondCut,
        address _init,
        bytes calldata _calldata
    ) external;
    
    /// @notice Execute a previously proposed upgrade after the timelock period
    function executeDiamondCut() external;
    
    /// @notice Cancel a proposed upgrade
    function cancelDiamondCut() external;

    event DiamondCut(FacetCut[] _diamondCut, address _init, bytes _calldata);
    event DiamondCutProposed(address indexed proposer, uint256 indexed proposalTime, uint256 executionTime);
    event DiamondCutCancelled(address indexed canceller);
}
