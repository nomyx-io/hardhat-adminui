import { Router } from "express";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { AppRequest } from "../types";

/**
 * Formats deployment data for frontend consumption
 */
async function formatDeploymentForUI(deployment: any, network: string, hre: any) {
  let recentTransactions = [];
  
  try {
    if (deployment.address) {
      recentTransactions = await hre.adminUI.getRecentTransactions(deployment.address, 5);
    }
  } catch (error) {
    console.error(`Error fetching recent transactions for ${deployment.contractName}:`, error);
  }

  return {
    ...deployment,
    network,
    // Ensure receipt fields are properly formatted for frontend BigNumber usage
    receipt: deployment.receipt ? {
      ...deployment.receipt,
      gasUsed: deployment.receipt.gasUsed.toString(), // Keep as string, frontend will handle BigNumber conversion
      effectiveGasPrice: deployment.receipt.effectiveGasPrice?.toString() || "0"
    } : null,
    // Add missing fields expected by UI
    solcVersion: deployment.metadata?.compiler?.version || "Unknown",
    optimizer: deployment.metadata?.settings?.optimizer || { enabled: false },
    // Add recent transactions
    recentTransactions
  };
}

export function createDeploymentsRoutes(hre: HardhatRuntimeEnvironment): Router {
  const router = Router();

  /**
   * GET /api/deployments/:network
   * Returns all deployments for a specific network
   */
  router.get("/api/deployments/:network", async (req: AppRequest, res) => {
    const { network } = req.params;
    
    try {
      hre.network.name = network;
      const deployments = await hre.adminUI.listDeployments();
      const formattedDeployments = await Promise.all(
        deployments.map(deployment => formatDeploymentForUI(deployment, network, hre))
      );
      res.json(formattedDeployments);
    } catch (error) {
      console.error(`Error getting deployments for network ${network}:`, error);
      res.status(500).json({ error: `Failed to get deployments for network ${network}` });
    }
  });

  /**
   * GET /api/deployments/:network/:contractName
   * Returns specific deployment information for a contract
   */
  router.get("/api/deployments/:network/:contractName", async (req: AppRequest, res) => {
    const { network, contractName } = req.params;
    
    try {
      hre.network.name = network;
      const deployment = await hre.adminUI.getDeployment(contractName);
      if (deployment) {
        const formattedDeployment = await formatDeploymentForUI(deployment, network, hre);
        res.json(formattedDeployment);
      } else {
        res.status(404).json({
          error: `Deployment not found for ${contractName} on network ${network}`
        });
      }
    } catch (error) {
      console.error(`Error getting deployment for ${contractName} on ${network}:`, error);
      res.status(500).json({
        error: `Failed to get deployment for ${contractName} on network ${network}`
      });
    }
  });

  return router;
}