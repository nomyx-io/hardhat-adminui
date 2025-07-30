const metadata = {
  name: "ERC20 Token Contract Tests",
  description: "Comprehensive testing scenarios for the SimpleToken ERC20 implementation",
  tags: ["token", "erc20", "integration", "security"],
  version: "1.0.0"
};

const scenarios = [
  {
    name: "Token Metadata and Initial State",
    description: "Verify token deployment parameters and initial state",
    steps: [
      {
        name: "Check Token Name",
        action: "call",
        contract: "SimpleToken",
        function: "name",
        args: [],
        expect: {
          success: true,
          returnValue: "Demo Token"
        }
      },
      {
        name: "Check Token Symbol",
        action: "call",
        contract: "SimpleToken",
        function: "symbol",
        args: [],
        expect: {
          success: true,
          returnValue: "DEMO"
        }
      },
      {
        name: "Check Token Decimals",
        action: "call",
        contract: "SimpleToken",
        function: "decimals",
        args: [],
        expect: {
          success: true,
          returnValue: 18
        }
      },
      {
        name: "Check Initial Total Supply",
        action: "call",
        contract: "SimpleToken",
        function: "totalSupply",
        args: [],
        expect: {
          success: true,
          returnValue: "1000000000000000000000000" // 1M tokens with 18 decimals
        }
      },
      {
        name: "Check Owner Initial Balance",
        action: "call",
        contract: "SimpleToken",
        function: "balanceOf",
        args: ["{{owner}}"],
        expect: {
          success: true,
          returnValue: "1000000000000000000000000"
        }
      }
    ]
  },
  {
    name: "Basic Transfer Operations",
    description: "Test token transfers between accounts",
    steps: [
      {
        name: "Transfer Tokens to User1",
        action: "call",
        contract: "SimpleToken",
        function: "transfer",
        args: ["{{user1}}", "1000000000000000000000"], // 1000 tokens
        from: "owner",
        expect: {
          success: true,
          returnValue: true,
          events: [
            {
              name: "Transfer",
              args: {
                from: "{{owner}}",
                to: "{{user1}}",
                value: "1000000000000000000000"
              }
            }
          ]
        }
      },
      {
        name: "Verify User1 Balance",
        action: "call",
        contract: "SimpleToken",
        function: "balanceOf",
        args: ["{{user1}}"],
        expect: {
          success: true,
          returnValue: "1000000000000000000000"
        }
      },
      {
        name: "Transfer from User1 to User2",
        action: "call",
        contract: "SimpleToken",
        function: "transfer",
        args: ["{{user2}}", "500000000000000000000"], // 500 tokens
        from: "user1",
        expect: {
          success: true,
          returnValue: true,
          events: ["Transfer"]
        }
      },
      {
        name: "Verify User2 Balance",
        action: "call",
        contract: "SimpleToken",
        function: "balanceOf",
        args: ["{{user2}}"],
        expect: {
          success: true,
          returnValue: "500000000000000000000"
        }
      },
      {
        name: "Attempt Transfer to Zero Address",
        action: "call",
        contract: "SimpleToken",
        function: "transfer",
        args: ["0x0000000000000000000000000000000000000000", "100000000000000000000"],
        from: "user1",
        expect: {
          success: false,
          revertReason: "Cannot transfer to zero address"
        }
      }
    ]
  },
  {
    name: "Approval and TransferFrom Operations",
    description: "Test allowance mechanism and delegated transfers",
    steps: [
      {
        name: "User1 Approves User2",
        action: "call",
        contract: "SimpleToken",
        function: "approve",
        args: ["{{user2}}", "300000000000000000000"], // 300 tokens
        from: "user1",
        expect: {
          success: true,
          returnValue: true,
          events: [
            {
              name: "Approval",
              args: {
                owner: "{{user1}}",
                spender: "{{user2}}",
                value: "300000000000000000000"
              }
            }
          ]
        }
      },
      {
        name: "Check Allowance",
        action: "call",
        contract: "SimpleToken",
        function: "allowance",
        args: ["{{user1}}", "{{user2}}"],
        expect: {
          success: true,
          returnValue: "300000000000000000000"
        }
      },
      {
        name: "User2 Transfers from User1 to User3",
        action: "call",
        contract: "SimpleToken",
        function: "transferFrom",
        args: ["{{user1}}", "{{user3}}", "200000000000000000000"], // 200 tokens
        from: "user2",
        expect: {
          success: true,
          returnValue: true,
          events: ["Transfer"]
        }
      },
      {
        name: "Check Remaining Allowance",
        action: "call",
        contract: "SimpleToken",
        function: "allowance",
        args: ["{{user1}}", "{{user2}}"],
        expect: {
          success: true,
          returnValue: "100000000000000000000" // 300 - 200 = 100
        }
      },
      {
        name: "Attempt Excessive TransferFrom",
        action: "call",
        contract: "SimpleToken",
        function: "transferFrom",
        args: ["{{user1}}", "{{user3}}", "200000000000000000000"], // More than allowance
        from: "user2",
        expect: {
          success: false,
          revertReason: "Insufficient allowance"
        }
      }
    ]
  },
  {
    name: "Minting Operations (Owner Only)",
    description: "Test token minting functionality",
    steps: [
      {
        name: "Owner Mints Tokens to User3",
        action: "call",
        contract: "SimpleToken",
        function: "mint",
        args: ["{{user3}}", "2000000000000000000000"], // 2000 tokens
        from: "owner",
        expect: {
          success: true,
          events: [
            {
              name: "Mint",
              args: {
                to: "{{user3}}",
                value: "2000000000000000000000"
              }
            },
            {
              name: "Transfer",
              args: {
                from: "0x0000000000000000000000000000000000000000",
                to: "{{user3}}",
                value: "2000000000000000000000"
              }
            }
          ]
        }
      },
      {
        name: "Verify Increased Total Supply",
        action: "call",
        contract: "SimpleToken",
        function: "totalSupply",
        args: [],
        expect: {
          success: true,
          returnValue: "1002000000000000000000000" // Original + minted
        }
      },
      {
        name: "Non-Owner Mint Attempt",
        action: "call",
        contract: "SimpleToken",
        function: "mint",
        args: ["{{user1}}", "1000000000000000000000"],
        from: "user1",
        expect: {
          success: false,
          revertReason: "Only owner can mint"
        }
      },
      {
        name: "Mint to Zero Address",
        action: "call",
        contract: "SimpleToken",
        function: "mint",
        args: ["0x0000000000000000000000000000000000000000", "1000000000000000000000"],
        from: "owner",
        expect: {
          success: false,
          revertReason: "Cannot mint to zero address"
        }
      }
    ]
  },
  {
    name: "Burning Operations",
    description: "Test token burning functionality",
    steps: [
      {
        name: "User3 Burns Tokens",
        action: "call",
        contract: "SimpleToken",
        function: "burn",
        args: ["1000000000000000000000"], // 1000 tokens
        from: "user3",
        expect: {
          success: true,
          events: [
            {
              name: "Burn",
              args: {
                from: "{{user3}}",
                value: "1000000000000000000000"
              }
            },
            {
              name: "Transfer",
              args: {
                from: "{{user3}}",
                to: "0x0000000000000000000000000000000000000000",
                value: "1000000000000000000000"
              }
            }
          ]
        }
      },
      {
        name: "Verify Decreased Total Supply",
        action: "call",
        contract: "SimpleToken",
        function: "totalSupply",
        args: [],
        expect: {
          success: true,
          returnValue: "1001000000000000000000000" // Previous - burned
        }
      },
      {
        name: "Attempt Burn More Than Balance",
        action: "call",
        contract: "SimpleToken",
        function: "burn",
        args: ["10000000000000000000000"], // More than user balance
        from: "user2",
        expect: {
          success: false,
          revertReason: "Insufficient balance to burn"
        }
      }
    ]
  },
  {
    name: "Edge Cases and Security Tests",
    description: "Test edge cases and security scenarios",
    steps: [
      {
        name: "Zero Value Transfer",
        action: "call",
        contract: "SimpleToken",
        function: "transfer",
        args: ["{{user1}}", "0"],
        from: "owner",
        expect: {
          success: true,
          returnValue: true,
          events: ["Transfer"]
        }
      },
      {
        name: "Zero Value Approval",
        action: "call",
        contract: "SimpleToken",
        function: "approve",
        args: ["{{user1}}", "0"],
        from: "owner",
        expect: {
          success: true,
          returnValue: true,
          events: ["Approval"]
        }
      },
      {
        name: "Self Transfer",
        action: "call",
        contract: "SimpleToken",
        function: "transfer",
        args: ["{{user1}}", "100000000000000000000"],
        from: "user1",
        expect: {
          success: true,
          returnValue: true,
          events: ["Transfer"]
        }
      },
      {
        name: "Approve Self",
        action: "call",
        contract: "SimpleToken",
        function: "approve",
        args: ["{{user1}}", "100000000000000000000"],
        from: "user1",
        expect: {
          success: true,
          returnValue: true,
          events: ["Approval"]
        }
      }
    ]
  }
];

const setup = async (hre) => {
  console.log("Setting up ERC20 Token test environment...");
  
  const [owner, user1, user2, user3] = await hre.ethers.getSigners();
  
  // Get the deployed SimpleToken contract
  const tokenDeployment = await hre.deployments.get("SimpleToken");
  const token = await hre.ethers.getContractAt("SimpleToken", tokenDeployment.address);
  
  // Log initial state
  const name = await token.name();
  const symbol = await token.symbol();
  const decimals = await token.decimals();
  const totalSupply = await token.totalSupply();
  
  console.log(`Token: ${name} (${symbol})`);
  console.log(`Decimals: ${decimals}`);
  console.log(`Total Supply: ${hre.ethers.formatUnits(totalSupply, decimals)}`);
  
  return {
    contracts: {
      SimpleToken: token
    },
    signers: {
      owner,
      user1,
      user2,
      user3
    },
    deploymentInfo: {
      SimpleToken: tokenDeployment
    },
    initialState: {
      name,
      symbol,
      decimals,
      totalSupply
    }
  };
};

const teardown = async (hre, setupData) => {
  console.log("Cleaning up ERC20 Token test environment...");
  
  // Log final balances
  const { contracts, signers } = setupData;
  const token = contracts.SimpleToken;
  
  console.log("Final token state:");
  const finalSupply = await token.totalSupply();
  console.log(`Final Total Supply: ${hre.ethers.formatUnits(finalSupply, 18)}`);
  
  for (const [name, signer] of Object.entries(signers)) {
    const balance = await token.balanceOf(signer.address);
    console.log(`${name} (${signer.address}): ${hre.ethers.formatUnits(balance, 18)} tokens`);
  }
};

module.exports = {
  metadata,
  scenarios,
  setup,
  teardown
};
