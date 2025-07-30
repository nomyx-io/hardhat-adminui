import "hardhat/types/runtime";
import { extendEnvironment } from "hardhat/config";
import { ethers } from "ethers";
import { Deployment } from "hardhat-deploy/types";
import { WebSocketServer, WebSocket } from 'ws';
import chokidar from 'chokidar';
import fs from 'fs/promises';
import path from 'path';
import open from 'open';
import { FunctionSignatureDecoder } from "./services/functionSignatureDecoder";
import { findAvailablePort } from "./utils/port-utils";

// Export the type so it can be imported in other files
export interface AdminUIDeployment extends Deployment {
  contractName: string;
}

// We are extending the Hardhat Runtime Environment (HRE) here.
// This allows other tasks and plugins to access our plugin's functionality.
declare module "hardhat/types/runtime" {
  export interface HardhatRuntimeEnvironment {
    adminUI: {
      getProjectInfo: () => {
        name: string;
        hardhatVersion: string;
        networks: string[];
      };
      // Gets a specific deployment by contract name for the current network
      getDeployment: (contractName: string) => Promise<AdminUIDeployment | null>;
      // Lists all deployments for the current network
      listDeployments: () => Promise<AdminUIDeployment[]>;
      // Gets an ethers.Contract instance for a deployed contract
      getContract: (contractName: string, signer?: ethers.Signer) => Promise<ethers.Contract | null>;
      getStorageAt: (address: string, slot: string) => Promise<string>;
      verifyContract: (contractName: string) => Promise<void>;
      simulateTransaction: (from: string, to: string, data: string, value?: string) => Promise<any>;
      getRecentTransactions: (contractAddress: string, limit?: number) => Promise<any[]>;
      getTransactionDetails: (txHash: string) => Promise<any>;
    };
  }
}

extendEnvironment((hre) => {
  // Initialize WebSocket server asynchronously to avoid blocking environment setup
  let wss: WebSocketServer;
  const initWebSocketServer = async () => {
    try {
      const wsPort = await findAvailablePort(8080);
      if (wsPort !== 8080) {
        console.log(`🔄 WebSocket port 8080 in use, using port ${wsPort} instead`);
      }
      wss = new WebSocketServer({ port: wsPort });
    } catch (error) {
      console.warn(`⚠️  Could not find available WebSocket port, using default 8080`);
      wss = new WebSocketServer({ port: 8080 });
    }
    
    setupWebSocketHandlers();
  };

  const setupWebSocketHandlers = () => {
    if (!wss) return;

    wss.on('connection', ws => {
      console.log('Admin UI client connected');

      ws.on('message', async (message) => {
        try {
          const { type, data } = JSON.parse(message.toString());
          if (type === 'verifyContract') {
            await hre.adminUI.verifyContract(data.contractName);
          } else if (type === 'simulateTransaction') {
            const result = await hre.adminUI.simulateTransaction(data.from, data.to, data.data, data.value);
            ws.send(JSON.stringify({ type: 'simulationResult', data: result }));
          }
        } catch (e) {
          console.error('Error processing message from client:', e);
        }
      });

      ws.on('close', () => console.log('Admin UI client disconnected'));
    });
  };

  const broadcast = (message: object) => {
    if (wss && wss.clients) {
      wss.clients.forEach((client: WebSocket) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(message));
        }
      });
    }
  };

  // Initialize WebSocket server asynchronously
  initWebSocketServer().catch(error => {
    console.error('Failed to initialize WebSocket server:', error);
  });

  const deploymentsPath = hre.config.paths.deployments;
  let deploymentTimeout: NodeJS.Timeout;
  const watcher = chokidar.watch(deploymentsPath, {
    persistent: true,
    ignoreInitial: true,
  });

  console.log(`Watching for deployments in: ${deploymentsPath}`);

  watcher.on('add', async (filePath) => {
    clearTimeout(deploymentTimeout);
    if (path.extname(filePath) === '.json' && !filePath.includes('.dbg.json')) {
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        const artifact = JSON.parse(content);
        
        // Extract contract name from file path if not present in artifact
        const fileName = path.basename(filePath, '.json');
        const contractName = artifact.contractName || fileName;
        
        // Ensure artifact has contract name for frontend processing
        const enrichedArtifact = {
          ...artifact,
          contractName,
          deployedAt: new Date().toISOString()
        };
        
        console.log(`📦 New deployment detected: ${contractName} at ${enrichedArtifact.address || 'unknown'}`);
        broadcast({
          type: 'artifact',
          data: enrichedArtifact
        });
      } catch (error) {
        console.error(`❌ Error processing artifact ${filePath}:`, error);
      }
    }

    deploymentTimeout = setTimeout(async () => {
      console.log('🎉 Deployment sequence complete. Broadcasting final state...');
      try {
        const deployments = await hre.adminUI.listDeployments();
        console.log(`📊 Broadcasting ${deployments.length} deployments to UI`);
        broadcast({ type: 'deploymentComplete', data: deployments });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('❌ Error getting final deployments:', error);
        broadcast({ type: 'deploymentError', data: { error: errorMessage } });
      }
    }, 2000);
  });

  hre.adminUI = {
    getProjectInfo: () => ({
      name: hre.config.solidity.compilers[0].version,
      hardhatVersion: hre.version,
      networks: Object.keys(hre.config.networks),
    }),
    getDeployment: async (contractName: string): Promise<AdminUIDeployment | null> => {
      try {
        const deployment = await hre.deployments.get(contractName);
        return { ...deployment, contractName };
      } catch (error) {
        return null;
      }
    },
    listDeployments: async (network?: string): Promise<AdminUIDeployment[]> => {
      const all = await hre.deployments.all();
      return Object.entries(all).map(([contractName, deployment]) => ({
        ...deployment,
        contractName,
      }));
    },
    getContract: async (contractName: string, signer?: ethers.Signer): Promise<ethers.Contract | null> => {
      const deployment = await hre.deployments.get(contractName);
      if (!deployment) return null;
      return new ethers.Contract(deployment.address, deployment.abi, signer);
    },
    getStorageAt: async (address: string, slot: string): Promise<string> => {
      return hre.ethers.provider.getStorageAt(address, slot);
    },
    verifyContract: async (contractName: string): Promise<void> => {
      const deployment = await hre.deployments.get(contractName);
      if (!deployment) {
        throw new Error(`Deployment not found for ${contractName}`);
      }

      broadcast({ type: 'verificationStatus', data: { contractName, status: 'Verifying...' } });

      try {
        await hre.run("verify:verify", {
          address: deployment.address,
          constructorArguments: deployment.args,
        });
        broadcast({ type: 'verificationStatus', data: { contractName, status: 'Successfully verified' } });
      } catch (e: any) {
        broadcast({ type: 'verificationStatus', data: { contractName, status: 'Verification failed', error: e.message } });
        throw e;
      }
    },
    simulateTransaction: async (from: string, to: string, data: string, value?: string): Promise<any> => {
      await hre.network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [from],
      });
      const signer = await hre.ethers.getSigner(from);
      try {
        const result = await signer.call({
          to: to,
          data: data,
          value: value,
        });
        return { success: true, result };
      } catch (error: any) {
        return { success: false, error: error.message };
      } finally {
        await hre.network.provider.request({
          method: "hardhat_stopImpersonatingAccount",
          params: [from],
        });
      }
    },
    getRecentTransactions: async (contractAddress: string, limit: number = 10): Promise<any[]> => {
      try {
        const provider = hre.ethers.provider;
        const currentBlock = await provider.getBlockNumber();
        const fromBlock = Math.max(0, currentBlock - 1000); // Look back 1000 blocks
        
        // Get recent transactions by filtering for transactions to this contract
        const filter = {
          address: contractAddress,
          fromBlock,
          toBlock: currentBlock
        };
        
        const logs = await provider.getLogs(filter);
        const transactions = [];
        
        // Get unique transaction hashes from logs
        const txHashes = [...new Set(logs.map(log => log.transactionHash))];
        
        // Fetch transaction details for each unique hash
        for (const hash of txHashes.slice(0, limit)) {
          try {
            const tx = await provider.getTransaction(hash);
            const receipt = await provider.getTransactionReceipt(hash);
            
            if (tx && receipt) {
              transactions.push({
                hash: tx.hash,
                from: tx.from,
                to: tx.to,
                blockNumber: tx.blockNumber,
                method: 'Unknown', // We could decode this from tx.data if needed
                status: receipt.status === 1 ? 'Success' : 'Failed',
                gasUsed: receipt.gasUsed.toString(),
                timestamp: Date.now() // We could get actual timestamp from block if needed
              });
            }
          } catch (error) {
            console.error(`Error fetching transaction ${hash}:`, error);
          }
        }
        
        return transactions.sort((a, b) => (b.blockNumber || 0) - (a.blockNumber || 0));
      } catch (error) {
        console.error('Error fetching recent transactions:', error);
        return [];
      }
    },
    getTransactionDetails: async (txHash: string): Promise<any> => {
      try {
        const provider = hre.ethers.provider;
        
        // Get transaction and receipt
        const [transaction, receipt] = await Promise.all([
          provider.getTransaction(txHash),
          provider.getTransactionReceipt(txHash)
        ]);

        if (!transaction) {
          throw new Error(`Transaction ${txHash} not found`);
        }

        // Get block information for timestamp
        const block = await provider.getBlock(transaction.blockNumber!);
        
        // Calculate transaction fee
        const gasPrice = transaction.gasPrice || receipt.effectiveGasPrice || ethers.BigNumber.from(0);
        const transactionFee = receipt.gasUsed.mul(gasPrice);

        // Decode function call if it's a contract interaction
        let decodedFunction = null;
        if (transaction.data && transaction.data !== '0x' && transaction.to) {
          try {
            // Try to find the contract ABI to decode the function call
            const deployments = await hre.deployments.all();
            const contractDeployment = Object.values(deployments).find(
              dep => dep.address.toLowerCase() === transaction.to!.toLowerCase()
            );
            
            let contractInterface = null;
            if (contractDeployment && contractDeployment.abi) {
              contractInterface = new ethers.utils.Interface(contractDeployment.abi);
              try {
                const functionFragment = contractInterface.parseTransaction({ data: transaction.data });
                decodedFunction = {
                  name: functionFragment.name,
                  signature: functionFragment.signature,
                  args: functionFragment.args,
                  functionFragment: functionFragment.functionFragment
                };
              } catch (decodeError) {
                // Function signature not found in ABI, fall through to signature decoder
              }
            }
            
            // Fallback to signature decoder if ABI decoding failed
            if (!decodedFunction) {
              const decoder = new FunctionSignatureDecoder(hre.ethers.provider);
              const decoded = await decoder.decodeFunction(transaction.data, contractInterface || undefined);
              if (decoded && decoded.name !== 'Unknown Function') {
                decodedFunction = {
                  name: decoded.name,
                  signature: decoded.signature,
                  args: decoded.inputs?.map((input: any) => input.value) || [],
                  inputs: decoded.inputs
                };
              }
            }
          } catch (error) {
            console.error('Error decoding function call:', error);
          }
        }

        // Decode events from logs
        const decodedEvents = [];
        if (receipt.logs && receipt.logs.length > 0) {
          const decoder = new FunctionSignatureDecoder(hre.ethers.provider);
          
          for (const log of receipt.logs) {
            try {
              // Try to find the contract ABI to decode events
              const deployments = await hre.deployments.all();
              const contractDeployment = Object.values(deployments).find(
                dep => dep.address.toLowerCase() === log.address.toLowerCase()
              );
              
              let contractInterface = null;
              let decoded = null;
              
              if (contractDeployment && contractDeployment.abi) {
                contractInterface = new ethers.utils.Interface(contractDeployment.abi);
                try {
                  const decodedLog = contractInterface.parseLog(log);
                  decoded = {
                    name: decodedLog.name,
                    signature: decodedLog.signature,
                    args: decodedLog.args,
                    eventFragment: decodedLog.eventFragment
                  };
                } catch (decodeError) {
                  // Event not found in ABI, fall through to signature decoder
                }
              }
              
              // Fallback to signature decoder if ABI decoding failed
              if (!decoded) {
                const decodedEvent = await decoder.decodeEvent(log, contractInterface || undefined);
                if (decodedEvent && decodedEvent.name !== 'Unknown Event') {
                  decoded = {
                    name: decodedEvent.name,
                    signature: decodedEvent.signature,
                    args: decodedEvent.inputs?.map((input: any) => input.value) || [],
                    inputs: decodedEvent.inputs
                  };
                }
              }
              
              decodedEvents.push({
                ...log,
                decoded
              });
            } catch (error) {
              console.error('Error decoding event:', error);
              decodedEvents.push(log);
            }
          }
        }

        // Get current block number for confirmations
        const currentBlock = await provider.getBlockNumber();
        const confirmations = transaction.blockNumber ? currentBlock - transaction.blockNumber + 1 : 0;

        return {
          // Basic transaction info
          hash: transaction.hash,
          blockNumber: transaction.blockNumber,
          blockHash: transaction.blockHash,
          transactionIndex: receipt.transactionIndex,
          confirmations,
          
          // Addresses and value
          from: transaction.from,
          to: transaction.to,
          value: transaction.value.toString(),
          
          // Gas information
          gasLimit: transaction.gasLimit.toString(),
          gasUsed: receipt.gasUsed.toString(),
          gasPrice: gasPrice.toString(),
          transactionFee: transactionFee.toString(),
          
          // Transaction data
          data: transaction.data,
          nonce: transaction.nonce,
          
          // Status and result
          status: receipt.status,
          
          // Block and timing info
          timestamp: block.timestamp,
          
          // Decoded information
          decodedFunction,
          decodedEvents,
          
          // Raw objects for advanced use
          transaction,
          receipt,
          block
        };
      } catch (error) {
        console.error(`Error fetching transaction details for ${txHash}:`, error);
        throw error;
      }
    }
  };
});
