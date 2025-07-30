// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/******************************************************************************\
* Author: Nick Mudge <nick@perfectabstractions.com> (https://twitter.com/mudgen)
* EIP-2535 Diamonds: https://eips.ethereum.org/EIPS/eip-2535
*
* Implementation of the diamond cut functions.
/******************************************************************************/

import { LibDiamond } from "../libraries/LibDiamond.sol";
import { IDiamondCut } from "../interfaces/IDiamondCut.sol";
import { IERC165 } from "@openzeppelin/contracts/interfaces/IERC165.sol";

/**
 * @title DiamondCutFacet
 * @dev Implementation of the diamond cut functionality with a timelock mechanism.
 *      The diamond cut operation allows adding, replacing, or removing facets and functions
 *      from the diamond proxy contract. This implementation adds a security timelock
 *      that requires a two-step process (propose and execute) for diamond cuts,
 *      enhancing security by allowing time for review before execution.
 *      Based on the EIP-2535 Diamond Standard.
 */
contract DiamondCutFacet is IDiamondCut {
    /// @notice Propose a diamond cut to be executed after the timelock period
    /// @dev First step in the two-step process for modifying the diamond. This queues up
    ///      changes that can only be executed after a predefined timelock period.
    ///      Only the contract owner can propose changes.
    /// @param _diamondCut Contains the facet addresses and function selectors to add, replace, or remove
    /// @param _init The address of the contract or facet to execute initialization code
    /// @param _calldata A function call, including function selector and arguments, for initialization
    function proposeDiamondCut(
        IDiamondCut.FacetCut[] calldata _diamondCut,
        address _init,
        bytes calldata _calldata
    ) external {
        LibDiamond.enforceIsContractOwner();
        LibDiamond.proposeDiamondCut(_diamondCut, _init, _calldata);
    }
    
    /// @notice Execute a previously proposed diamond cut after the timelock period has elapsed
    /// @dev Second and final step in the two-step diamond modification process.
    ///      This executes the changes that were previously proposed, but only if
    ///      the required timelock period has passed. The timelock period is a
    ///      security measure to allow stakeholders time to review proposed changes.
    ///      Only the contract owner can execute the diamond cut.
    /// @custom:security Reverts if no diamond cut is proposed, if the timelock period
    ///                  hasn't expired, or if the initialization call fails
    function executeDiamondCut() external {
        LibDiamond.enforceIsContractOwner();
        LibDiamond.executeDiamondCut();
    }
    
    /// @notice Cancel a previously proposed diamond cut
    /// @dev Allows the contract owner to cancel a pending diamond cut proposal
    ///      before it is executed. This is useful if errors are found in the
    ///      proposed changes during the timelock period or if the changes
    ///      are no longer desired. Once cancelled, the proposal is completely
    ///      removed and a new proposal would need to be submitted if needed.
    /// @custom:security Only callable by the contract owner
    function cancelDiamondCut() external {
        LibDiamond.enforceIsContractOwner();
        LibDiamond.cancelDiamondCut();
    }
    
    /// @notice Add/replace/remove any number of functions and optionally execute initialization code
    /// @dev THIS FUNCTION IS DEPRECATED and will always revert when called.
    ///      It has been replaced by the more secure two-step process using
    ///      proposeDiamondCut() followed by executeDiamondCut(), which adds a timelock
    ///      security feature. This function remains to maintain compatibility with
    ///      the IDiamondCut interface but cannot be used.
    /// @custom:security Always reverts with an error message directing to the new functions
    function diamondCut(
        IDiamondCut.FacetCut[] calldata,
        address,
        bytes calldata
    ) external pure override {
        revert("Function deprecated: Use proposeDiamondCut() + executeDiamondCut() instead");
    }
}