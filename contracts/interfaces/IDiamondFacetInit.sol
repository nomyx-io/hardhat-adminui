// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "./IDiamondCut.sol";
import "./IERC165.sol";

interface IDiamondFacetInit is IERC165 {
    function initializeFacet(
        address _owner, 
        IDiamondCut.FacetCut memory _facet,
        bytes calldata _calldata) external;
}
