const metadata = {
  name: "Diamond Proxy Contract Tests",
  description: "Comprehensive testing scenarios for the EIP-2535 Diamond Standard implementation",
  tags: ["diamond", "proxy", "eip-2535", "integration", "architecture"],
  version: "1.0.0"
};

const scenarios = [
  {
    name: "Diamond Core Functionality",
    description: "Test basic diamond proxy functionality and introspection",
    steps: [
      {
        name: "Check Diamond Address",
        action: "call",
        contract: "Diamond",
        function: "diamondAddress",
        args: [],
        expect: {
          success: true,
          returnType: "address"
        }
      },
      {
        name: "Check Initial Owner",
        action: "call",
        contract: "Diamond",
        function: "owner",
        args: [],
        expect: {
          success: true,
          returnType: "address"
        }
      },
      {
        name: "Verify Diamond Address Self-Reference",
        action: "verify",
        description: "Ensure diamondAddress() returns the contract's own address",
        expect: {
          condition: "diamondAddress == contractAddress"
        }
      }
    ]
  },
  {
    name: "Diamond Loupe Functionality",
    description: "Test diamond introspection capabilities using DiamondLoupeFacet",
    steps: [
      {
        name: "Get All Facets",
        action: "call",
        contract: "Diamond",
        function: "facets",
        args: [],
        expect: {
          success: true,
          returnType: "array"
        }
      },
      {
        name: "Get Facet Addresses",
        action: "call",
        contract: "Diamond",
        function: "facetAddresses",
        args: [],
        expect: {
          success: true,
          returnType: "array"
        }
      },
      {
        name: "Check Diamond Cut Facet Address",
        action: "call",
        contract: "Diamond",
        function: "facetAddress",
        args: ["0x1f931c1c"], // diamondCut selector
        expect: {
          success: true,
          returnType: "address"
        }
      },
      {
        name: "Verify ERC165 Support",
        action: "call",
        contract: "Diamond",
        function: "supportsInterface",
        args: ["0x01ffc9a7"], // ERC165 interface ID
        expect: {
          success: true,
          returnValue: true
        }
      },
      {
        name: "Verify Diamond Cut Interface Support",
        action: "call",
        contract: "Diamond",
        function: "supportsInterface",
        args: ["0x1f931c1c"], // IDiamondCut interface ID
        expect: {
          success: true,
          returnValue: true
        }
      }
    ]
  },
  {
    name: "Ownership Management",
    description: "Test diamond ownership transfer functionality",
    steps: [
      {
        name: "Current Owner Check",
        action: "call",
        contract: "Diamond",
        function: "owner",
        args: [],
        expect: {
          success: true,
          returnValue: "{{owner}}"
        }
      },
      {
        name: "Transfer Ownership to User1",
        action: "call",
        contract: "Diamond",
        function: "transferOwnership",
        args: ["{{user1}}"],
        from: "owner",
        expect: {
          success: true,
          events: [
            {
              name: "OwnershipTransferred",
              args: {
                previousOwner: "{{owner}}",
                newOwner: "{{user1}}"
              }
            }
          ]
        }
      },
      {
        name: "Verify New Owner",
        action: "call",
        contract: "Diamond",
        function: "owner",
        args: [],
        expect: {
          success: true,
          returnValue: "{{user1}}"
        }
      },
      {
        name: "Non-Owner Transfer Attempt",
        action: "call",
        contract: "Diamond",
        function: "transferOwnership",
        args: ["{{user2}}"],
        from: "user2",
        expect: {
          success: false,
          revertReason: "LibDiamond: Must be contract owner"
        }
      },
      {
        name: "Transfer Back to Original Owner",
        action: "call",
        contract: "Diamond",
        function: "transferOwnership",
        args: ["{{owner}}"],
        from: "user1",
        expect: {
          success: true,
          events: ["OwnershipTransferred"]
        }
      }
    ]
  },
  {
    name: "Counter Facet Functionality",
    description: "Test functionality provided by the CounterFacet",
    steps: [
      {
        name: "Get Initial Counter Value",
        action: "call",
        contract: "Diamond",
        function: "getCount",
        args: [],
        expect: {
          success: true,
          returnValue: "0"
        }
      },
      {
        name: "Increment Counter",
        action: "call",
        contract: "Diamond",
        function: "increment",
        args: [],
        expect: {
          success: true,
          events: ["CounterIncremented"]
        }
      },
      {
        name: "Verify Incremented Value",
        action: "call",
        contract: "Diamond",
        function: "getCount",
        args: [],
        expect: {
          success: true,
          returnValue: "1"
        }
      },
      {
        name: "Increment Multiple Times",
        action: "repeat",
        count: 5,
        step: {
          name: "Increment Counter",
          action: "call",
          contract: "Diamond",
          function: "increment",
          args: [],
          expect: {
            success: true
          }
        }
      },
      {
        name: "Verify Final Count",
        action: "call",
        contract: "Diamond",
        function: "getCount",
        args: [],
        expect: {
          success: true,
          returnValue: "6" // 1 + 5 increments
        }
      },
      {
        name: "Reset Counter",
        action: "call",
        contract: "Diamond",
        function: "reset",
        args: [],
        from: "owner",
        expect: {
          success: true,
          events: ["CounterReset"]
        }
      },
      {
        name: "Verify Reset Value",
        action: "call",
        contract: "Diamond",
        function: "getCount",
        args: [],
        expect: {
          success: true,
          returnValue: "0"
        }
      }
    ]
  },
  {
    name: "Diamond Cut Operations",
    description: "Test diamond upgrade functionality (advanced)",
    steps: [
      {
        name: "Get Current Facet Count",
        action: "call",
        contract: "Diamond",
        function: "facetAddresses",
        args: [],
        expect: {
          success: true,
          returnType: "array"
        }
      },
      {
        name: "Check Diamond Cut Function Selector",
        action: "call",
        contract: "Diamond",
        function: "facetFunctionSelectors",
        args: ["{{DiamondCutFacet}}"],
        expect: {
          success: true,
          returnType: "array"
        }
      },
      {
        name: "Verify Diamond Cut Facet Exists",
        action: "call",
        contract: "Diamond",
        function: "facetAddress",
        args: ["0x1f931c1c"], // diamondCut function selector
        expect: {
          success: true,
          returnType: "address"
        }
      }
    ]
  },
  {
    name: "Fallback Function Testing",
    description: "Test diamond proxy fallback delegation",
    steps: [
      {
        name: "Call Non-Existent Function",
        action: "call",
        contract: "Diamond",
        function: "nonExistentFunction",
        args: [],
        expect: {
          success: false,
          revertReason: "Diamond: Function does not exist"
        }
      },
      {
        name: "Verify Function Routing",
        action: "call",
        contract: "Diamond",
        function: "facetAddress",
        args: ["0x8da5cb5b"], // owner() function selector
        expect: {
          success: true,
          returnType: "address"
        }
      }
    ]
  },
  {
    name: "Interface Compliance Testing",
    description: "Test ERC-165 interface compliance",
    steps: [
      {
        name: "Check ERC165 Interface",
        action: "call",
        contract: "Diamond",
        function: "supportsInterface",
        args: ["0x01ffc9a7"], // ERC165
        expect: {
          success: true,
          returnValue: true
        }
      },
      {
        name: "Check ERC173 Interface (Ownership)",
        action: "call",
        contract: "Diamond",
        function: "supportsInterface",
        args: ["0x7f5828d0"], // ERC173
        expect: {
          success: true,
          returnValue: true
        }
      },
      {
        name: "Check Diamond Loupe Interface",
        action: "call",
        contract: "Diamond",
        function: "supportsInterface",
        args: ["0x48e2b093"], // IDiamondLoupe
        expect: {
          success: true,
          returnValue: true
        }
      },
      {
        name: "Check Unsupported Interface",
        action: "call",
        contract: "Diamond",
        function: "supportsInterface",
        args: ["0xffffffff"], // Invalid interface
        expect: {
          success: true,
          returnValue: false
        }
      }
    ]
  }
];

const setup = async (hre) => {
  console.log("Setting up Diamond Proxy test environment...");
  
  const [owner, user1, user2] = await hre.ethers.getSigners();
  
  // Get the deployed Diamond contract
  const diamondDeployment = await hre.deployments.get("Diamond");
  const diamond = await hre.ethers.getContractAt("Diamond", diamondDeployment.address);
  
  // Get the facet deployments
  const diamondCutFacetDeployment = await hre.deployments.get("DiamondCutFacet");
  const diamondLoupeFacetDeployment = await hre.deployments.get("DiamondLoupeFacet");
  const counterFacetDeployment = await hre.deployments.get("CounterFacet");
  
  // Create interfaces for facet interactions
  const diamondCutFacet = await hre.ethers.getContractAt("DiamondCutFacet", diamondDeployment.address);
  const diamondLoupeFacet = await hre.ethers.getContractAt("DiamondLoupeFacet", diamondDeployment.address);
  const counterFacet = await hre.ethers.getContractAt("CounterFacet", diamondDeployment.address);
  
  // Log initial state
  console.log(`Diamond Address: ${diamondDeployment.address}`);
  console.log(`Owner: ${await diamond.owner()}`);
  
  try {
    const facets = await diamondLoupeFacet.facets();
    console.log(`Number of facets: ${facets.length}`);
    
    for (let i = 0; i < facets.length; i++) {
      console.log(`Facet ${i + 1}: ${facets[i].facetAddress} (${facets[i].functionSelectors.length} selectors)`);
    }
  } catch (error) {
    console.log("Could not retrieve facets information:", error.message);
  }
  
  return {
    contracts: {
      Diamond: diamond,
      DiamondCutFacet: diamondCutFacet,
      DiamondLoupeFacet: diamondLoupeFacet,
      CounterFacet: counterFacet
    },
    signers: {
      owner,
      user1,
      user2
    },
    deploymentInfo: {
      Diamond: diamondDeployment,
      DiamondCutFacet: diamondCutFacetDeployment,
      DiamondLoupeFacet: diamondLoupeFacetDeployment,
      CounterFacet: counterFacetDeployment
    }
  };
};

const teardown = async (hre, setupData) => {
  console.log("Cleaning up Diamond Proxy test environment...");
  
  const { contracts } = setupData;
  const diamond = contracts.Diamond;
  
  console.log("Final diamond state:");
  console.log(`Final Owner: ${await diamond.owner()}`);
  console.log(`Diamond Address: ${await diamond.diamondAddress()}`);
  
  try {
    const facets = await contracts.DiamondLoupeFacet.facets();
    console.log(`Final Facet Count: ${facets.length}`);
    
    if (contracts.CounterFacet) {
      try {
        const finalCount = await contracts.CounterFacet.getCount();
        console.log(`Final Counter Value: ${finalCount}`);
      } catch (error) {
        console.log("Could not retrieve counter value:", error.message);
      }
    }
  } catch (error) {
    console.log("Could not retrieve final facet information:", error.message);
  }
};

module.exports = {
  metadata,
  scenarios,
  setup,
  teardown
};
