const metadata = {
  name: "Marketplace Contract Tests",
  description: "Comprehensive testing scenarios for the decentralized marketplace contract",
  tags: ["marketplace", "ecommerce", "integration", "security"],
  version: "1.0.0"
};

const scenarios = [
  {
    name: "Marketplace Initial State",
    description: "Verify marketplace deployment and initial configuration",
    steps: [
      {
        name: "Check Marketplace Fee",
        action: "call",
        contract: "Marketplace",
        function: "marketplaceFee",
        args: [],
        expect: {
          success: true,
          returnValue: "250" // 2.5% fee
        }
      },
      {
        name: "Check Owner",
        action: "call",
        contract: "Marketplace",
        function: "owner",
        args: [],
        expect: {
          success: true,
          returnValue: "{{owner}}"
        }
      },
      {
        name: "Check Initial Item Count",
        action: "call",
        contract: "Marketplace",
        function: "getItemCount",
        args: [],
        expect: {
          success: true,
          returnValue: "0"
        }
      },
      {
        name: "Check Not Paused Initially",
        action: "call",
        contract: "Marketplace",
        function: "paused",
        args: [],
        expect: {
          success: true,
          returnValue: false
        }
      },
      {
        name: "Check Next Item ID",
        action: "call",
        contract: "Marketplace",
        function: "nextItemId",
        args: [],
        expect: {
          success: true,
          returnValue: "1"
        }
      }
    ]
  },
  {
    name: "Item Listing Operations",
    description: "Test item listing functionality and validation",
    steps: [
      {
        name: "List First Item",
        action: "call",
        contract: "Marketplace",
        function: "listItem",
        args: ["Digital Art NFT", "Beautiful digital artwork", "1000000000000000000"], // 1 ETH
        from: "user1",
        expect: {
          success: true,
          returnValue: "1",
          events: [
            {
              name: "ItemListed",
              args: {
                itemId: "1",
                name: "Digital Art NFT",
                price: "1000000000000000000",
                seller: "{{user1}}"
              }
            }
          ]
        }
      },
      {
        name: "Verify First Item Details",
        action: "call",
        contract: "Marketplace",
        function: "items",
        args: ["1"],
        expect: {
          success: true,
          returnType: "tuple"
        }
      },
      {
        name: "List Second Item",
        action: "call",
        contract: "Marketplace",
        function: "listItem",
        args: ["Vintage Book", "Rare first edition book", "500000000000000000"], // 0.5 ETH
        from: "user2",
        expect: {
          success: true,
          returnValue: "2",
          events: ["ItemListed"]
        }
      },
      {
        name: "Check Updated Item Count",
        action: "call",
        contract: "Marketplace",
        function: "getItemCount",
        args: [],
        expect: {
          success: true,
          returnValue: "2"
        }
      },
      {
        name: "Check User1 Seller Items",
        action: "call",
        contract: "Marketplace",
        function: "getSellerItems",
        args: ["{{user1}}"],
        expect: {
          success: true,
          returnType: "array"
        }
      },
      {
        name: "Attempt Empty Name Listing",
        action: "call",
        contract: "Marketplace",
        function: "listItem",
        args: ["", "Description", "1000000000000000000"],
        from: "user1",
        expect: {
          success: false,
          revertReason: "Item name cannot be empty"
        }
      },
      {
        name: "Attempt Zero Price Listing",
        action: "call",
        contract: "Marketplace",
        function: "listItem",
        args: ["Valid Name", "Description", "0"],
        from: "user1",
        expect: {
          success: false,
          revertReason: "Price must be greater than 0"
        }
      }
    ]
  },
  {
    name: "Item Purchase Operations",
    description: "Test item purchasing with correct payment and fee distribution",
    steps: [
      {
        name: "Buy First Item",
        action: "call",
        contract: "Marketplace",
        function: "buyItem",
        args: ["1"],
        from: "user3",
        value: "1000000000000000000", // 1 ETH
        expect: {
          success: true,
          events: [
            {
              name: "ItemSold",
              args: {
                itemId: "1",
                name: "Digital Art NFT",
                price: "1000000000000000000",
                seller: "{{user1}}",
                buyer: "{{user3}}"
              }
            }
          ]
        }
      },
      {
        name: "Verify Item Marked as Sold",
        action: "call",
        contract: "Marketplace",
        function: "items",
        args: ["1"],
        expect: {
          success: true,
          returnType: "tuple"
        }
      },
      {
        name: "Check User1 Earnings",
        action: "call",
        contract: "Marketplace",
        function: "sellerEarnings",
        args: ["{{user1}}"],
        expect: {
          success: true,
          returnValue: "975000000000000000" // 1 ETH - 2.5% fee = 0.975 ETH
        }
      },
      {
        name: "Attempt to Buy Already Sold Item",
        action: "call",
        contract: "Marketplace",
        function: "buyItem",
        args: ["1"],
        from: "user2",
        value: "1000000000000000000",
        expect: {
          success: false,
          revertReason: "Item already sold"
        }
      },
      {
        name: "Attempt Seller Self-Purchase",
        action: "call",
        contract: "Marketplace",
        function: "buyItem",
        args: ["2"],
        from: "user2", // user2 is the seller of item 2
        value: "500000000000000000",
        expect: {
          success: false,
          revertReason: "Cannot buy your own item"
        }
      },
      {
        name: "Attempt Incorrect Payment Amount",
        action: "call",
        contract: "Marketplace",
        function: "buyItem",
        args: ["2"],
        from: "user3",
        value: "400000000000000000", // Wrong amount
        expect: {
          success: false,
          revertReason: "Incorrect payment amount"
        }
      },
      {
        name: "Buy Second Item with Correct Payment",
        action: "call",
        contract: "Marketplace",
        function: "buyItem",
        args: ["2"],
        from: "user3",
        value: "500000000000000000", // 0.5 ETH
        expect: {
          success: true,
          events: ["ItemSold"]
        }
      }
    ]
  },
  {
    name: "Item Management Operations",
    description: "Test item removal and management features",
    steps: [
      {
        name: "List Item for Removal Test",
        action: "call",
        contract: "Marketplace",
        function: "listItem",
        args: ["Test Item", "For removal testing", "2000000000000000000"], // 2 ETH
        from: "user1",
        expect: {
          success: true,
          returnValue: "3",
          events: ["ItemListed"]
        }
      },
      {
        name: "Owner Removes Own Item",
        action: "call",
        contract: "Marketplace",
        function: "removeItem",
        args: ["3"],
        from: "user1",
        expect: {
          success: true,
          events: [
            {
              name: "ItemRemoved",
              args: {
                itemId: "3",
                seller: "{{user1}}"
              }
            }
          ]
        }
      },
      {
        name: "Attempt Non-Owner Item Removal",
        action: "call",
        contract: "Marketplace",
        function: "listItem",
        args: ["Another Test Item", "For permission testing", "1500000000000000000"],
        from: "user2",
        expect: {
          success: true,
          returnValue: "4"
        }
      },
      {
        name: "Non-Owner Removal Attempt",
        action: "call",
        contract: "Marketplace",
        function: "removeItem",
        args: ["4"],
        from: "user1", // user1 trying to remove user2's item
        expect: {
          success: false,
          revertReason: "Only seller can remove item"
        }
      },
      {
        name: "Attempt to Remove Non-Existent Item",
        action: "call",
        contract: "Marketplace",
        function: "removeItem",
        args: ["999"],
        from: "user1",
        expect: {
          success: false,
          revertReason: "Item does not exist"
        }
      }
    ]
  },
  {
    name: "Earnings and Withdrawals",
    description: "Test earnings withdrawal functionality",
    steps: [
      {
        name: "User1 Withdraws Earnings",
        action: "call",
        contract: "Marketplace",
        function: "withdrawEarnings",
        args: [],
        from: "user1",
        expect: {
          success: true,
          events: [
            {
              name: "EarningsWithdrawn",
              args: {
                seller: "{{user1}}",
                amount: "975000000000000000"
              }
            }
          ]
        }
      },
      {
        name: "Verify User1 Earnings Cleared",
        action: "call",
        contract: "Marketplace",
        function: "sellerEarnings",
        args: ["{{user1}}"],
        expect: {
          success: true,
          returnValue: "0"
        }
      },
      {
        name: "User2 Withdraws Earnings",
        action: "call",
        contract: "Marketplace",
        function: "withdrawEarnings",
        args: [],
        from: "user2",
        expect: {
          success: true,
          events: ["EarningsWithdrawn"]
        }
      },
      {
        name: "Attempt Double Withdrawal",
        action: "call",
        contract: "Marketplace",
        function: "withdrawEarnings",
        args: [],
        from: "user1",
        expect: {
          success: false,
          revertReason: "No earnings to withdraw"
        }
      },
      {
        name: "User with No Sales Withdrawal Attempt",
        action: "call",
        contract: "Marketplace",
        function: "withdrawEarnings",
        args: [],
        from: "user3", // user3 only bought, never sold
        expect: {
          success: false,
          revertReason: "No earnings to withdraw"
        }
      }
    ]
  },
  {
    name: "Admin Functions and Security",
    description: "Test owner-only functions and access control",
    steps: [
      {
        name: "Owner Updates Marketplace Fee",
        action: "call",
        contract: "Marketplace",
        function: "setMarketplaceFee",
        args: ["500"], // 5%
        from: "owner",
        expect: {
          success: true,
          events: [
            {
              name: "FeeUpdated",
              args: {
                oldFee: "250",
                newFee: "500"
              }
            }
          ]
        }
      },
      {
        name: "Verify Fee Updated",
        action: "call",
        contract: "Marketplace",
        function: "marketplaceFee",
        args: [],
        expect: {
          success: true,
          returnValue: "500"
        }
      },
      {
        name: "Non-Owner Fee Update Attempt",
        action: "call",
        contract: "Marketplace",
        function: "setMarketplaceFee",
        args: ["100"],
        from: "user1",
        expect: {
          success: false,
          revertReason: "Only owner can call this function"
        }
      },
      {
        name: "Attempt Excessive Fee",
        action: "call",
        contract: "Marketplace",
        function: "setMarketplaceFee",
        args: ["1500"], // 15% - over 10% limit
        from: "owner",
        expect: {
          success: false,
          revertReason: "Fee cannot exceed 10%"
        }
      },
      {
        name: "Owner Pauses Marketplace",
        action: "call",
        contract: "Marketplace",
        function: "setPaused",
        args: [true],
        from: "owner",
        expect: {
          success: true,
          events: [
            {
              name: "MarketplacePaused",
              args: {
                paused: true
              }
            }
          ]
        }
      },
      {
        name: "Attempt Listing When Paused",
        action: "call",
        contract: "Marketplace",
        function: "listItem",
        args: ["Paused Test", "Should fail", "1000000000000000000"],
        from: "user1",
        expect: {
          success: false,
          revertReason: "Marketplace is paused"
        }
      },
      {
        name: "Attempt Purchase When Paused",
        action: "call",
        contract: "Marketplace",
        function: "buyItem",
        args: ["4"], // user2's item
        from: "user3",
        value: "1500000000000000000",
        expect: {
          success: false,
          revertReason: "Marketplace is paused"
        }
      },
      {
        name: "Owner Unpauses Marketplace",
        action: "call",
        contract: "Marketplace",
        function: "setPaused",
        args: [false],
        from: "owner",
        expect: {
          success: true,
          events: ["MarketplacePaused"]
        }
      }
    ]
  },
  {
    name: "Emergency Functions and Edge Cases",
    description: "Test emergency functions and edge case scenarios",
    steps: [
      {
        name: "List Item for Emergency Test",
        action: "call",
        contract: "Marketplace",
        function: "listItem",
        args: ["Emergency Item", "For emergency testing", "3000000000000000000"],
        from: "user1",
        expect: {
          success: true,
          returnValue: "5"
        }
      },
      {
        name: "Buy Emergency Item",
        action: "call",
        contract: "Marketplace",
        function: "buyItem",
        args: ["5"],
        from: "user2",
        value: "3000000000000000000",
        expect: {
          success: true,
          events: ["ItemSold"]
        }
      },
      {
        name: "Owner Emergency Withdraw",
        action: "call",
        contract: "Marketplace",
        function: "emergencyWithdraw",
        args: ["{{user1}}"],
        from: "owner",
        expect: {
          success: true,
          events: ["EarningsWithdrawn"]
        }
      },
      {
        name: "Non-Owner Emergency Withdraw Attempt",
        action: "call",
        contract: "Marketplace",
        function: "emergencyWithdraw",
        args: ["{{user2}}"],
        from: "user1",
        expect: {
          success: false,
          revertReason: "Only owner can call this function"
        }
      },
      {
        name: "Owner Withdraws Fees",
        action: "call",
        contract: "Marketplace",
        function: "withdrawFees",
        args: [],
        from: "owner",
        expect: {
          success: true
        }
      },
      {
        name: "Non-Owner Fee Withdrawal Attempt",
        action: "call",
        contract: "Marketplace",
        function: "withdrawFees",
        args: [],
        from: "user1",
        expect: {
          success: false,
          revertReason: "Only owner can call this function"
        }
      }
    ]
  }
];

const setup = async (hre) => {
  console.log("Setting up Marketplace test environment...");
  
  const [owner, user1, user2, user3] = await hre.ethers.getSigners();
  
  // Get the deployed Marketplace contract
  const marketplaceDeployment = await hre.deployments.get("Marketplace");
  const marketplace = await hre.ethers.getContractAt("Marketplace", marketplaceDeployment.address);
  
  // Log initial state
  const marketplaceFee = await marketplace.marketplaceFee();
  const contractOwner = await marketplace.owner();
  const isPaused = await marketplace.paused();
  const itemCount = await marketplace.getItemCount();
  
  console.log(`Marketplace Address: ${marketplaceDeployment.address}`);
  console.log(`Owner: ${contractOwner}`);
  console.log(`Marketplace Fee: ${marketplaceFee} basis points (${marketplaceFee / 100}%)`);
  console.log(`Paused: ${isPaused}`);
  console.log(`Initial Item Count: ${itemCount}`);
  
  // Log user balances
  for (const [name, signer] of Object.entries({ owner, user1, user2, user3 })) {
    const balance = await hre.ethers.provider.getBalance(signer.address);
    console.log(`${name} (${signer.address}): ${hre.ethers.formatEther(balance)} ETH`);
  }
  
  return {
    contracts: {
      Marketplace: marketplace
    },
    signers: {
      owner,
      user1,
      user2,
      user3
    },
    deploymentInfo: {
      Marketplace: marketplaceDeployment
    },
    initialState: {
      marketplaceFee,
      owner: contractOwner,
      isPaused,
      itemCount
    }
  };
};

const teardown = async (hre, setupData) => {
  console.log("Cleaning up Marketplace test environment...");
  
  const { contracts, signers } = setupData;
  const marketplace = contracts.Marketplace;
  
  console.log("Final marketplace state:");
  
  try {
    const finalFee = await marketplace.marketplaceFee();
    const finalPaused = await marketplace.paused();
    const finalItemCount = await marketplace.getItemCount();
    const contractBalance = await hre.ethers.provider.getBalance(marketplace.target);
    
    console.log(`Final Marketplace Fee: ${finalFee} basis points`);
    console.log(`Final Paused State: ${finalPaused}`);
    console.log(`Final Item Count: ${finalItemCount}`);
    console.log(`Contract Balance: ${hre.ethers.formatEther(contractBalance)} ETH`);
    
    // Log final earnings for each user
    for (const [name, signer] of Object.entries(signers)) {
      try {
        const earnings = await marketplace.sellerEarnings(signer.address);
        const balance = await hre.ethers.provider.getBalance(signer.address);
        if (earnings > 0) {
          console.log(`${name} pending earnings: ${hre.ethers.formatEther(earnings)} ETH`);
        }
        console.log(`${name} final balance: ${hre.ethers.formatEther(balance)} ETH`);
      } catch (error) {
        console.log(`Could not get final state for ${name}:`, error.message);
      }
    }
    
    // Log some items if they exist
    const itemCount = await marketplace.getItemCount();
    if (itemCount > 0) {
      console.log("Sample items:");
      for (let i = 1; i <= Math.min(itemCount, 3); i++) {
        try {
          const item = await marketplace.items(i);
          console.log(`  Item ${i}: ${item.name} - ${hre.ethers.formatEther(item.price)} ETH (Sold: ${item.sold})`);
        } catch (error) {
          console.log(`  Item ${i}: Removed or inaccessible`);
        }
      }
    }
  } catch (error) {
    console.log("Error getting final marketplace state:", error.message);
  }
};

module.exports = {
  metadata,
  scenarios,
  setup,
  teardown
};
