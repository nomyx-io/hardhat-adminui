import { Router } from 'express';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

export function createDiamondsRoutes(hre: HardhatRuntimeEnvironment) {
  const router = Router();

  // Make HRE available globally for the route handlers
  (global as any).hre = hre;

// Helper function to detect if a contract is a diamond
function isDiamond(abi: any[]): boolean {
  return abi.some(item => 
    item.name === 'diamondCut' || 
    item.name === 'facets' || 
    item.name === 'facetAddress' ||
    item.name === 'facetFunctionSelectors'
  );
}

// Helper function to get function selector from signature
function getFunctionSelector(signature: string): string {
  const ethers = require('ethers');
  return ethers.utils.id(signature).slice(0, 10);
}

// Get diamond facets information
router.get('/api/diamonds/:network/:address/facets', async (req, res) => {
  try {
    const { network, address } = req.params;
    const hre: HardhatRuntimeEnvironment = (global as any).hre;
    
    if (!hre) {
      return res.status(500).json({ error: 'Hardhat Runtime Environment not available' });
    }

    // Get the contract instance
    const contract = await hre.ethers.getContractAt('DiamondLoupeFacet', address);
    
    // Get all facets from the diamond
    const facets = await contract.facets();
    
    // Map facets to a more usable format
    const facetInfo = facets.map((facet: any) => ({
      address: facet.facetAddress,
      functionSelectors: facet.functionSelectors,
      selectorCount: facet.functionSelectors.length
    }));

    // Try to get facet names from known deployments
    const deployments = await hre.deployments.all();
    const facetDetails = await Promise.all(
      facetInfo.map(async (facet: any) => {
        // Find deployment that matches this facet address
        const deployment = Object.entries(deployments).find(
          ([name, deploy]) => deploy.address.toLowerCase() === facet.address.toLowerCase()
        );

        let facetName = deployment ? deployment[0] : 'Unknown Facet';
        let abi = deployment ? deployment[1].abi : [];

        // If we found a deployment, get more details
        if (deployment) {
          try {
            // Get function signatures for this facet
            const facetContract = await hre.ethers.getContractAt(deployment[1].abi, facet.address);
            const functions = Object.keys(facetContract.interface.functions).map(signature => {
              const selector = facetContract.interface.getSighash(signature);
              return {
                signature,
                selector,
                name: signature.split('(')[0]
              };
            });

            return {
              name: facetName,
              address: facet.address,
              functionSelectors: facet.functionSelectors,
              selectorCount: facet.selectorCount,
              functions: functions,
              abi: abi
            };
          } catch (error: any) {
            console.warn(`Could not get function details for facet ${facetName}:`, error?.message || error);
          }
        }

        return {
          name: facetName,
          address: facet.address,
          functionSelectors: facet.functionSelectors,
          selectorCount: facet.selectorCount,
          functions: [] as any[],
          abi: []
        };
      })
    );

    res.json({
      diamond: address,
      network,
      facetCount: facetDetails.length,
      facets: facetDetails
    });

  } catch (error: any) {
    console.error('Error fetching diamond facets:', error);
    res.status(500).json({
      error: 'Failed to fetch diamond facets',
      message: error?.message || error
    });
  }
});

// Get specific facet information
router.get('/api/diamonds/:network/:address/facets/:facetAddress', async (req, res) => {
  try {
    const { network, address, facetAddress } = req.params;
    const hre: HardhatRuntimeEnvironment = (global as any).hre;
    
    if (!hre) {
      return res.status(500).json({ error: 'Hardhat Runtime Environment not available' });
    }

    // Get the diamond contract
    const diamond = await hre.ethers.getContractAt('DiamondLoupeFacet', address);
    
    // Get function selectors for this facet
    const selectors = await diamond.facetFunctionSelectors(facetAddress);
    
    // Find deployment info for this facet
    const deployments = await hre.deployments.all();
    const deployment = Object.entries(deployments).find(
      ([name, deploy]) => deploy.address.toLowerCase() === facetAddress.toLowerCase()
    );

    let facetDetails: any = {
      address: facetAddress,
      functionSelectors: selectors,
      selectorCount: selectors.length,
      name: deployment ? deployment[0] : 'Unknown Facet',
      abi: deployment ? deployment[1].abi : [],
      functions: []
    };

    if (deployment) {
      try {
        const facetContract = await hre.ethers.getContractAt(deployment[1].abi, facetAddress);
        facetDetails.functions = Object.keys(facetContract.interface.functions).map(signature => {
          const selector = facetContract.interface.getSighash(signature);
          return {
            signature,
            selector,
            name: signature.split('(')[0],
            inputs: facetContract.interface.functions[signature].inputs,
            outputs: facetContract.interface.functions[signature].outputs
          };
        });
      } catch (error: any) {
        console.warn(`Could not get function details for facet:`, error?.message || error);
      }
    }

    res.json({
      diamond: address,
      network,
      facet: facetDetails
    });

  } catch (error: any) {
    console.error('Error fetching facet information:', error);
    res.status(500).json({
      error: 'Failed to fetch facet information',
      message: error?.message || error
    });
  }
});

  return router;
}