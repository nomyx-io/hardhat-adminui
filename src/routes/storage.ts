import { Router } from "express";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { AppRequest } from "../types";
import * as fs from "fs";
import * as path from "path";

/**
 * Format storage value based on type information
 */
/**
 * Generate fallback storage layout for known contracts
 */
function generateFallbackStorageLayout(contractName: string): any {
  const layouts: Record<string, any> = {
    SimpleStorage: {
      storage: [
        {
          slot: "0",
          label: "value",
          type: "t_uint256",
          astId: 1,
          contract: "contracts/SimpleStorage.sol:SimpleStorage",
          offset: 0
        },
        {
          slot: "1",
          label: "owner",
          type: "t_address",
          astId: 2,
          contract: "contracts/SimpleStorage.sol:SimpleStorage",
          offset: 0
        }
      ],
      types: {
        "t_uint256": {
          label: "uint256",
          numberOfBytes: "32"
        },
        "t_address": {
          label: "address",
          numberOfBytes: "20"
        }
      }
    },
    SimpleToken: {
      storage: [
        {
          slot: "0",
          label: "_balances",
          type: "t_mapping(t_address,t_uint256)",
          astId: 3,
          contract: "contracts/SimpleToken.sol:SimpleToken",
          offset: 0
        },
        {
          slot: "1",
          label: "_allowances",
          type: "t_mapping(t_address,t_mapping(t_address,t_uint256))",
          astId: 4,
          contract: "contracts/SimpleToken.sol:SimpleToken",
          offset: 0
        },
        {
          slot: "2",
          label: "_totalSupply",
          type: "t_uint256",
          astId: 5,
          contract: "contracts/SimpleToken.sol:SimpleToken",
          offset: 0
        },
        {
          slot: "3",
          label: "_name",
          type: "t_string_storage",
          astId: 6,
          contract: "contracts/SimpleToken.sol:SimpleToken",
          offset: 0
        },
        {
          slot: "4",
          label: "_symbol",
          type: "t_string_storage",
          astId: 7,
          contract: "contracts/SimpleToken.sol:SimpleToken",
          offset: 0
        }
      ],
      types: {
        "t_uint256": {
          label: "uint256",
          numberOfBytes: "32"
        },
        "t_address": {
          label: "address",
          numberOfBytes: "20"
        },
        "t_mapping(t_address,t_uint256)": {
          label: "mapping(address => uint256)",
          numberOfBytes: "32"
        },
        "t_mapping(t_address,t_mapping(t_address,t_uint256))": {
          label: "mapping(address => mapping(address => uint256))",
          numberOfBytes: "32"
        },
        "t_string_storage": {
          label: "string",
          numberOfBytes: "32"
        }
      }
    },
    Marketplace: {
      storage: [
        {
          slot: "0",
          label: "nextItemId",
          type: "t_uint256",
          astId: 8,
          contract: "contracts/Marketplace.sol:Marketplace",
          offset: 0
        },
        {
          slot: "1",
          label: "items",
          type: "t_mapping(t_uint256,t_struct(Item)storage)",
          astId: 9,
          contract: "contracts/Marketplace.sol:Marketplace",
          offset: 0
        }
      ],
      types: {
        "t_uint256": {
          label: "uint256",
          numberOfBytes: "32"
        },
        "t_mapping(t_uint256,t_struct(Item)storage)": {
          label: "mapping(uint256 => struct Marketplace.Item)",
          numberOfBytes: "32"
        }
      }
    }
  };

  return layouts[contractName] || null;
}

function formatStorageValue(value: string, type: string): string {
  if (!value || value === "0x0000000000000000000000000000000000000000000000000000000000000000") {
    return "0";
  }
  
  // Convert hex to decimal for common types
  if (type.includes("uint") || type.includes("int")) {
    try {
      const decimal = BigInt(value).toString();
      return decimal;
    } catch {
      return value;
    }
  }
  
  // Handle address types
  if (type === "address") {
    return value.length === 66 ? value : value.slice(0, 42);
  }
  
  // Handle bool types
  if (type === "bool") {
    return value === "0x0000000000000000000000000000000000000000000000000000000000000000" ? "false" : "true";
  }
  
  // Handle bytes types
  if (type.startsWith("bytes")) {
    return value;
  }
  
  return value;
}

export function createStorageRoutes(hre: HardhatRuntimeEnvironment): Router {
  const router = Router();

  /**
   * GET /api/storage/:network/:contractName/layout
   * Returns storage layout information for a specific contract
   */
  router.get("/api/storage/:network/:contractName/layout", async (req: AppRequest, res) => {
    const { network, contractName } = req.params;
    
    try {
      hre.network.name = network;
      const deployment = await hre.adminUI.getDeployment(contractName);
      
      if (!deployment) {
        return res.status(404).json({
          error: `Deployment not found for ${contractName} on network ${network}`
        });
      }

      // Get storage layout from deployment or try to read from build artifacts
      let storageLayout = deployment.storageLayout;
      
      if (!storageLayout) {
        try {
          // Try to read from build artifacts directory
          const artifactPath = path.join(process.cwd(), "artifacts", "contracts", `${contractName}.sol`, `${contractName}.json`);
          
          if (fs.existsSync(artifactPath)) {
            const artifactContent = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
            storageLayout = artifactContent.storageLayout;
          }
        } catch (error) {
          console.warn(`Could not read storage layout from artifacts: ${error}`);
        }
      }

      // Fallback: Generate manual storage layout for known contracts
      if (!storageLayout) {
        storageLayout = generateFallbackStorageLayout(contractName);
      }
      
      if (!storageLayout) {
        return res.json({
          contractAddress: deployment.address,
          contractName,
          network,
          message: "No storage layout available. Ensure contract was compiled with storage layout enabled.",
          layout: null
        });
      }

      // Get current values for storage slots
      const populatedStorage = await Promise.all(
        storageLayout.storage.map(async (item: any) => {
          try {
            const value = await hre.adminUI.getStorageAt(deployment.address, item.slot);
            return {
              ...item,
              currentValue: value,
              hexValue: value,
              formattedValue: formatStorageValue(value, item.type)
            };
          } catch (error) {
            return {
              ...item,
              currentValue: null,
              error: `Failed to read slot ${item.slot}`
            };
          }
        })
      );

      res.json({
        contractAddress: deployment.address,
        contractName,
        network,
        layout: {
          ...storageLayout,
          storage: populatedStorage
        }
      });
    } catch (error) {
      console.error(`Error getting storage layout for ${contractName} on ${network}:`, error);
      res.status(500).json({
        error: `Failed to get storage layout for ${contractName} on network ${network}`
      });
    }
  });

  /**
   * GET /api/storage/:network/:contractAddress
   * Returns basic storage information for a specific contract
   * Note: For detailed storage layout, use the query endpoint with specific slots
   */
  router.get("/api/storage/:network/:contractAddress", async (req: AppRequest, res) => {
    const { network, contractAddress } = req.params;
    
    try {
      hre.network.name = network;
      // Return basic contract info and suggest using specific slot queries
      res.json({
        contractAddress,
        network,
        message: "Use /api/storage/:network/:contractAddress/:slot for specific slot queries",
        endpoints: {
          singleSlot: `/api/storage/${network}/${contractAddress}/:slot`,
          multipleSlots: `/api/storage/${network}/${contractAddress}/query`,
          layout: `/api/storage/${network}/contractName/layout`
        }
      });
    } catch (error) {
      console.error(`Error processing storage request for ${contractAddress} on ${network}:`, error);
      res.status(500).json({
        error: `Failed to process storage request for ${contractAddress} on network ${network}`
      });
    }
  });

  /**
   * GET /api/storage/:network/:contractAddress/:slot
   * Returns storage value at a specific slot
   */
  router.get("/api/storage/:network/:contractAddress/:slot", async (req: AppRequest, res) => {
    const { network, contractAddress, slot } = req.params;
    
    try {
      hre.network.name = network;
      const value = await hre.adminUI.getStorageAt(contractAddress, slot);
      res.json({ 
        slot, 
        value,
        hexValue: value,
        contractAddress 
      });
    } catch (error) {
      console.error(`Error getting storage at slot ${slot} for ${contractAddress}:`, error);
      res.status(500).json({ 
        error: `Failed to get storage at slot ${slot} for ${contractAddress}` 
      });
    }
  });

  /**
   * POST /api/storage/:network/:contractAddress/query
   * Queries multiple storage slots at once
   */
  router.post("/api/storage/:network/:contractAddress/query", async (req: AppRequest, res) => {
    const { network, contractAddress } = req.params;
    const { slots } = req.body;
    
    if (!Array.isArray(slots)) {
      return res.status(400).json({ error: "Slots must be an array" });
    }
    
    try {
      hre.network.name = network;
      
      const results = await Promise.all(
        slots.map(async (slot) => {
          try {
            const value = await hre.adminUI.getStorageAt(contractAddress, slot);
            return { slot, value, hexValue: value, success: true };
          } catch (error) {
            return {
              slot,
              error: error instanceof Error ? error.message : 'Unknown error',
              success: false
            };
          }
        })
      );
      
      res.json({
        contractAddress,
        network,
        results
      });
    } catch (error) {
      console.error(`Error querying storage for ${contractAddress} on ${network}:`, error);
      res.status(500).json({ 
        error: `Failed to query storage for ${contractAddress} on network ${network}` 
      });
    }
  });

  return router;
}