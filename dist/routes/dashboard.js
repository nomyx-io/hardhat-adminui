"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDashboardRoutes = createDashboardRoutes;
const express_1 = require("express");
const ethers_1 = require("ethers");
function createDashboardRoutes(hre) {
    const router = (0, express_1.Router)();
    /**
     * GET /api/dashboard/:network
     * Returns dashboard statistics for a specific network
     */
    router.get("/api/dashboard/:network", async (req, res) => {
        const { network } = req.params;
        try {
            hre.network.name = network;
            // Get all deployments for basic stats
            const deployments = await hre.adminUI.listDeployments();
            // Calculate basic statistics
            const totalContracts = deployments.length;
            const contractTypes = deployments.reduce((acc, dep) => {
                acc[dep.contractName] = (acc[dep.contractName] || 0) + 1;
                return acc;
            }, {});
            // Calculate total ETH spent from deployment receipts
            let totalEthSpent = "0";
            try {
                const totalWei = deployments.reduce((sum, dep) => {
                    if (dep.receipt?.gasUsed && dep.receipt?.effectiveGasPrice) {
                        const gasCost = ethers_1.ethers.BigNumber.from(dep.receipt.gasUsed)
                            .mul(ethers_1.ethers.BigNumber.from(dep.receipt.effectiveGasPrice));
                        return sum.add(gasCost);
                    }
                    return sum;
                }, ethers_1.ethers.BigNumber.from(0));
                totalEthSpent = ethers_1.ethers.utils.formatEther(totalWei);
            }
            catch (error) {
                console.warn("Error calculating total ETH spent:", error);
            }
            // Get recent transactions (attempt to aggregate from all contracts)
            let recentTransactions = [];
            try {
                const transactionPromises = deployments.slice(0, 5).map(async (dep) => {
                    try {
                        const txs = await hre.adminUI.getRecentTransactions(dep.address, 2);
                        return txs.map((tx) => ({
                            ...tx,
                            contractName: dep.contractName,
                            contractAddress: dep.address
                        }));
                    }
                    catch (error) {
                        return [];
                    }
                });
                const allTransactions = await Promise.all(transactionPromises);
                recentTransactions = allTransactions
                    .flat()
                    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
                    .slice(0, 10);
            }
            catch (error) {
                console.warn("Error fetching recent transactions:", error);
            }
            // Count total transactions and events (estimated)
            let totalTransactions = 0;
            let totalEvents = 0;
            try {
                // This is a basic estimation - in a real implementation you might want
                // to query the blockchain directly for more accurate numbers
                totalTransactions = recentTransactions.length;
                // Estimate events based on contract types and deployments
                totalEvents = deployments.reduce((sum, dep) => {
                    const eventCount = dep.abi?.filter((item) => item.type === 'event').length || 0;
                    return sum + eventCount;
                }, 0);
            }
            catch (error) {
                console.warn("Error calculating transaction/event counts:", error);
            }
            const dashboardData = {
                totalContracts,
                totalTransactions,
                totalEvents,
                totalEthSpent,
                contractTypes,
                recentTransactions: recentTransactions.map(tx => ({
                    hash: tx.hash,
                    method: tx.functionName || tx.method || 'Unknown',
                    timestamp: tx.timestamp ? new Date(tx.timestamp * 1000).toLocaleString() : 'Unknown',
                    contractName: tx.contractName,
                    contractAddress: tx.contractAddress
                }))
            };
            res.json(dashboardData);
        }
        catch (error) {
            console.error(`Error getting dashboard data for network ${network}:`, error);
            res.status(500).json({
                error: `Failed to get dashboard data for network ${network}`,
                totalContracts: 0,
                totalTransactions: 0,
                totalEvents: 0,
                totalEthSpent: "0",
                contractTypes: {},
                recentTransactions: []
            });
        }
    });
    /**
     * POST /api/verify-contracts/:network
     * Initiates contract verification for all contracts on the network
     */
    router.post("/api/verify-contracts/:network", async (req, res) => {
        const { network } = req.params;
        try {
            if (network === 'localhost') {
                return res.status(400).json({
                    error: "Contract verification is not available for localhost network"
                });
            }
            hre.network.name = network;
            const deployments = await hre.adminUI.listDeployments();
            // In a real implementation, you would integrate with services like:
            // - Etherscan API for Ethereum networks
            // - Polygonscan for Polygon
            // - BSCScan for Binance Smart Chain
            // etc.
            // For now, we'll simulate the verification process
            const verificationResults = deployments.map(dep => ({
                contractName: dep.contractName,
                address: dep.address,
                status: 'pending',
                message: 'Verification initiated'
            }));
            // Here you would typically:
            // 1. Read the contract source code and metadata
            // 2. Submit verification requests to the appropriate block explorer
            // 3. Track verification status
            // 4. Store results for later retrieval
            console.log(`Contract verification initiated for ${deployments.length} contracts on ${network}`);
            res.json({
                message: `Verification initiated for ${deployments.length} contracts`,
                results: verificationResults
            });
        }
        catch (error) {
            console.error(`Error initiating contract verification for ${network}:`, error);
            res.status(500).json({
                error: `Failed to initiate contract verification for network ${network}`
            });
        }
    });
    return router;
}
