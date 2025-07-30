//SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;


struct DiamondSettings {
  address owner;
  address factory;
  address svgManager;
  string symbol;
  string name;
}

struct DiamondContract {
  DiamondSettings settings;
  mapping(string=>string) metadata;
}

struct DiamondStorage {
  DiamondContract diamondContract;
}


interface IDiamond {
  function getDiamondAddress() external view returns (address);
}

