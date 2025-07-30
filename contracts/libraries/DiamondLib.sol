//SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "@openzeppelin/contracts/interfaces/IERC165.sol";
import "@openzeppelin/contracts/interfaces/IERC721.sol";
import "@openzeppelin/contracts/interfaces/IERC721Metadata.sol";

import { IDiamondCut } from "../interfaces/IDiamondCut.sol";
import { DiamondStorage } from "../interfaces/IDiamond.sol";
import { IDiamondLoupe } from "../interfaces/IDiamondLoupe.sol";
import { IERC173 } from "../interfaces/IERC173.sol";

import "./LibDiamond.sol";

import "../upgradeInitializers/DiamondInit.sol";

library DiamondLib {

  bytes32 internal constant DIAMOND_STORAGE_POSITION =
    keccak256("diamond.nextblock.bitgem.app.DiamondStorage.storage");

  function diamondStorage() internal pure returns (DiamondStorage storage ds) {
    bytes32 position = DIAMOND_STORAGE_POSITION;
    assembly {
      ds.slot := position
    }
  }
}
