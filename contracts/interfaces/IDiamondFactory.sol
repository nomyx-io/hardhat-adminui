// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import { IDiamondCut } from "./IDiamondCut.sol";

struct DiamondFactoryInit {
    string setName;
    IDiamondCut.FacetCut[] facetAddresses;
    bytes diamondBytecode;
}

struct DiamondFactoryContract {
    string[] diamondSymbols;
    mapping(string => address) diamondAddresses;
    mapping(string => IDiamondCut.FacetCut[]) facetsToAdd;
    string[] facetSets;
    string defaultFacetSet;
    address diamondInit_;
    bytes calldata_;
}
