require("@nomiclabs/hardhat-ethers");
require("hardhat-deploy");
require(require.resolve("./src/index"));

const config = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
      outputSelection: {
        "*": {
          "*": ["abi", "evm.bytecode", "evm.deployedBytecode", "evm.methodIdentifiers", "metadata", "storageLayout"]
        }
      }
    }
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    hardhat: {
      chainId: 31337
    }
  },
  namedAccounts: {
    deployer: {
      default: 0, // Use the first account as deployer by default
    },
  },
};

export default config;