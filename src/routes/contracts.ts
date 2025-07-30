import { Router } from "express";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { AppRequest, ContractCallRequest, ContractCallResponse } from "../types";

export function createContractsRoutes(hre: HardhatRuntimeEnvironment): Router {
  const router = Router();

  /**
   * GET /api/contracts
   * Returns list of all contract artifacts with their ABIs
   */
  router.get("/api/contracts", async (req: AppRequest, res) => {
    try {
      const contractNames = await hre.artifacts.getAllFullyQualifiedNames();
      const contracts = await Promise.all(contractNames.map(async (name) => {
        const artifact = await hre.artifacts.readArtifact(name);
        if (artifact.sourceName.endsWith('.dbg.json')) return null;
        return {
          contractName: artifact.contractName,
          sourceName: artifact.sourceName,
          abi: artifact.abi,
        };
      }));
      res.json(contracts.filter(c => c !== null));
    } catch (error) {
      console.error("Error getting contracts:", error);
      res.status(500).json({ error: "Failed to read contract artifacts." });
    }
  });

  /**
   * GET /api/contracts/:network/:contractName/functions
   * Returns available functions for a specific contract
   */
  router.get("/api/contracts/:network/:contractName/functions", async (req: AppRequest, res) => {
    const { network, contractName } = req.params;
    
    try {
      hre.network.name = network;
      const deployment = await hre.adminUI.getDeployment(contractName);
      if (!deployment) {
        return res.status(404).json({ error: `Contract ${contractName} not found` });
      }

      const contract = new hre.ethers.Contract(deployment.address, deployment.abi);
      const functions = contract.interface.fragments
        .filter((f: any) => f.type === 'function')
        .map((f: any) => ({
          name: f.name,
          inputs: f.inputs.map((input: any) => ({
            name: input.name,
            type: input.type,
            internalType: input.internalType || input.type
          })),
          outputs: f.outputs?.map((output: any) => ({
            name: output.name,
            type: output.type,
            internalType: output.internalType || output.type
          })) || [],
          stateMutability: f.stateMutability || 'nonpayable',
          payable: f.payable || false
        }));
      
      res.json(functions);
    } catch (error) {
      console.error("Error getting contract functions:", error);
      res.status(500).json({ error: "Failed to get contract functions." });
    }
  });

  /**
   * POST /api/contracts/:network/:contractName/call
   * Calls a contract method with specified parameters
   */
  router.post("/api/contracts/:network/:contractName/call", async (req: AppRequest, res) => {
    const { network, contractName } = req.params;
    const { method, args = [], value = "0" }: ContractCallRequest = req.body;
    
    try {
      hre.network.name = network;
      const deployment = await hre.adminUI.getDeployment(contractName);
      if (!deployment) {
        return res.status(404).json({ error: `Contract ${contractName} not found` });
      }

      const signers = await hre.ethers.getSigners();
      const signer = signers[0]; // Use first available signer
      const contract = new hre.ethers.Contract(deployment.address, deployment.abi, signer);

      console.log(`📞 Calling ${contractName}.${method}(${args.join(', ')}) with value: ${value}`);
      
      const callOptions = value !== "0" ? { value: hre.ethers.utils.parseEther(value) } : {};
      const result = await contract[method](...args, callOptions);
      
      // Handle different return types
      let response: ContractCallResponse;
      if (result && typeof result.wait === 'function') {
        // It's a transaction
        const receipt = await result.wait();
        response = {
          type: 'transaction',
          hash: result.hash,
          gasUsed: receipt.gasUsed.toString(),
          blockNumber: receipt.blockNumber,
          status: receipt.status,
          logs: receipt.logs.map((log: any) => ({
            address: log.address,
            topics: log.topics,
            data: log.data
          }))
        };
      } else {
        // It's a view function result
        response = {
          type: 'view',
          result: Array.isArray(result) ? result.map(r => r.toString()) : result.toString()
        };
      }
      
      res.json(response);
    } catch (error: any) {
      console.error(`❌ Contract call failed:`, error);
      const errorMessage = error?.reason || error?.message || 'Unknown error';
      res.status(500).json({
        error: errorMessage,
        code: error?.code || 'UNKNOWN'
      });
    }
  });

  /**
   * GET /api/contracts/:network/:contractName/events
   * Returns event logs for a specific contract
   */
  router.get("/api/contracts/:network/:contractName/events", async (req: AppRequest, res) => {
    const { network, contractName } = req.params;
    const { fromBlock = 0, toBlock = 'latest', limit = 100 } = req.query;
    
    try {
      hre.network.name = network;
      const deployment = await hre.adminUI.getDeployment(contractName);
      if (!deployment) {
        return res.status(404).json({ error: `Contract ${contractName} not found` });
      }

      const provider = hre.ethers.provider;
      const contract = new hre.ethers.Contract(deployment.address, deployment.abi, provider);
      
      // Get deployment block to optimize query range
      const deploymentBlock = deployment.receipt?.blockNumber || 0;
      const actualFromBlock = Math.max(Number(fromBlock), deploymentBlock);

      // Query all events for the contract
      const filter = {
        address: deployment.address,
        fromBlock: actualFromBlock,
        toBlock: toBlock === 'latest' ? 'latest' : Number(toBlock)
      };

      const logs = await provider.getLogs(filter);
      
      // Parse and format the logs
      const parsedEvents = logs.slice(0, Number(limit)).map((log, index) => {
        try {
          // Try to parse the log using the contract interface
          const parsedLog = contract.interface.parseLog(log);
          
          return {
            id: `${log.transactionHash}-${log.logIndex}`,
            eventName: parsedLog.name,
            signature: parsedLog.signature,
            args: Object.keys(parsedLog.args).reduce((acc, key) => {
              if (isNaN(Number(key))) { // Skip numeric indices
                const value = parsedLog.args[key];
                acc[key] = typeof value === 'object' && value._isBigNumber ? value.toString() : value;
              }
              return acc;
            }, {} as any),
            blockNumber: log.blockNumber,
            blockHash: log.blockHash,
            transactionHash: log.transactionHash,
            transactionIndex: log.transactionIndex,
            logIndex: log.logIndex,
            removed: log.removed || false,
            address: log.address,
            topics: log.topics,
            data: log.data
          };
        } catch (parseError) {
          // If parsing fails, return raw log data
          return {
            id: `${log.transactionHash}-${log.logIndex}`,
            eventName: 'Unknown',
            signature: null,
            args: {},
            blockNumber: log.blockNumber,
            blockHash: log.blockHash,
            transactionHash: log.transactionHash,
            transactionIndex: log.transactionIndex,
            logIndex: log.logIndex,
            removed: log.removed || false,
            address: log.address,
            topics: log.topics,
            data: log.data,
            parseError: 'Failed to parse event'
          };
        }
      });

      // Get timestamps for blocks if needed
      const eventLogsWithTimestamps = await Promise.all(
        parsedEvents.map(async (event) => {
          try {
            const block = await provider.getBlock(event.blockNumber);
            return {
              ...event,
              timestamp: block.timestamp,
              blockTimestamp: new Date(block.timestamp * 1000).toISOString()
            };
          } catch (error) {
            return {
              ...event,
              timestamp: null,
              blockTimestamp: null
            };
          }
        })
      );

      res.json({
        contractAddress: deployment.address,
        contractName,
        network,
        fromBlock: actualFromBlock,
        toBlock,
        totalEvents: eventLogsWithTimestamps.length,
        events: eventLogsWithTimestamps
      });
    } catch (error) {
      console.error("Error getting contract events:", error);
      res.status(500).json({
        error: "Failed to get contract events.",
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  return router;
}