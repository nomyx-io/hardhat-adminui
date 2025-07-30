const metadata = {
  name: "Simple Storage Contract Tests",
  description: "Comprehensive testing scenarios for the SimpleStorage contract functionality",
  tags: ["basic", "storage", "integration"],
  version: "1.0.0"
};

const scenarios = [
  {
    name: "Basic Storage Operations",
    description: "Test basic setValue, getValue, and increment operations",
    steps: [
      {
        name: "Get Deployment Info",
        action: "call",
        contract: "SimpleStorage",
        function: "getValue",
        args: [],
        expect: {
          success: true,
          returnValue: "42" // Initial value from constructor
        }
      },
      {
        name: "Set New Value",
        action: "call",
        contract: "SimpleStorage",
        function: "setValue",
        args: [100],
        expect: {
          success: true,
          events: ["ValueChanged"]
        }
      },
      {
        name: "Verify New Value",
        action: "call",
        contract: "SimpleStorage",
        function: "getValue",
        args: [],
        expect: {
          success: true,
          returnValue: "100"
        }
      },
      {
        name: "Increment Value",
        action: "call",
        contract: "SimpleStorage",
        function: "increment",
        args: [],
        expect: {
          success: true,
          events: ["ValueChanged"]
        }
      },
      {
        name: "Verify Incremented Value",
        action: "call",
        contract: "SimpleStorage",
        function: "getValue",
        args: [],
        expect: {
          success: true,
          returnValue: "101"
        }
      }
    ]
  },
  {
    name: "Owner-Only Reset Function",
    description: "Test that only the owner can reset the value",
    steps: [
      {
        name: "Check Owner Address",
        action: "call",
        contract: "SimpleStorage",
        function: "owner",
        args: [],
        expect: {
          success: true,
          returnType: "address"
        }
      },
      {
        name: "Owner Reset Value",
        action: "call",
        contract: "SimpleStorage",
        function: "reset",
        args: [],
        from: "owner",
        expect: {
          success: true,
          events: ["ValueChanged"]
        }
      },
      {
        name: "Verify Reset Value",
        action: "call",
        contract: "SimpleStorage",
        function: "getValue",
        args: [],
        expect: {
          success: true,
          returnValue: "0"
        }
      },
      {
        name: "Non-Owner Reset Attempt",
        action: "call",
        contract: "SimpleStorage",
        function: "reset",
        args: [],
        from: "user1",
        expect: {
          success: false,
          revertReason: "Only owner can reset"
        }
      }
    ]
  },
  {
    name: "Event Emission Testing",
    description: "Verify proper event emission with correct parameters",
    steps: [
      {
        name: "Set Initial Value for Event Test",
        action: "call",
        contract: "SimpleStorage",
        function: "setValue",
        args: [250],
        expect: {
          success: true,
          events: [
            {
              name: "ValueChanged",
              args: {
                oldValue: "0",
                newValue: "250",
                changedBy: "{{signer}}"
              }
            }
          ]
        }
      },
      {
        name: "Change Value and Check Event",
        action: "call",
        contract: "SimpleStorage",
        function: "setValue",
        args: [500],
        expect: {
          success: true,
          events: [
            {
              name: "ValueChanged",
              args: {
                oldValue: "250",
                newValue: "500",
                changedBy: "{{signer}}"
              }
            }
          ]
        }
      }
    ]
  }
];

const setup = async (hre) => {
  console.log("Setting up SimpleStorage test environment...");
  
  const [owner, user1] = await hre.ethers.getSigners();
  
  // Get the deployed SimpleStorage contract
  const simpleStorageDeployment = await hre.deployments.get("SimpleStorage");
  const simpleStorage = await hre.ethers.getContractAt("SimpleStorage", simpleStorageDeployment.address);
  
  return {
    contracts: {
      SimpleStorage: simpleStorage
    },
    signers: {
      owner,
      user1
    },
    deploymentInfo: {
      SimpleStorage: simpleStorageDeployment
    }
  };
};

const teardown = async (hre, setupData) => {
  console.log("Cleaning up SimpleStorage test environment...");
  
  // Log final state
  const finalValue = await setupData.contracts.SimpleStorage.getValue();
  console.log(`Final stored value: ${finalValue}`);
};

module.exports = {
  metadata,
  scenarios,
  setup,
  teardown
};
