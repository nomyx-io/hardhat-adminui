"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTransactionsRoutes = createTransactionsRoutes;
const express_1 = require("express");
function createTransactionsRoutes(hre) {
    const router = (0, express_1.Router)();
    /**
     * GET /api/transactions/:hash
     * Returns detailed information about a specific transaction
     */
    router.get("/api/transactions/:hash", async (req, res) => {
        const { hash } = req.params;
        try {
            const transactionDetails = await hre.adminUI.getTransactionDetails(hash);
            res.json(transactionDetails);
        }
        catch (error) {
            console.error(`Error getting transaction details for ${hash}:`, error);
            if (error instanceof Error && error.message.includes('not found')) {
                res.status(404).json({ error: `Transaction ${hash} not found` });
            }
            else {
                res.status(500).json({ error: `Failed to get transaction details for ${hash}` });
            }
        }
    });
    /**
     * GET /api/transactions
     * Returns a list of recent transactions with optional filtering
     */
    router.get("/api/transactions", async (req, res) => {
        const { limit = '50', address, contract, from, to } = req.query;
        try {
            const provider = hre.ethers.provider;
            const currentBlock = await provider.getBlockNumber();
            const fromBlock = Math.max(0, currentBlock - 1000); // Look back 1000 blocks
            let filter = {
                fromBlock,
                toBlock: currentBlock
            };
            // Apply filters
            if (address) {
                // Get transactions involving this address (as from or to)
                filter.address = address;
            }
            if (contract) {
                // Get transactions to this specific contract
                filter.address = contract;
            }
            const logs = await provider.getLogs(filter);
            const transactions = [];
            const txHashes = [...new Set(logs.map(log => log.transactionHash))];
            // Get transaction details for each unique hash
            const limitNum = parseInt(limit);
            for (const hash of txHashes.slice(0, limitNum)) {
                try {
                    const tx = await provider.getTransaction(hash);
                    const receipt = await provider.getTransactionReceipt(hash);
                    if (tx && receipt) {
                        // Apply additional filters
                        if (from && tx.from.toLowerCase() !== from.toLowerCase()) {
                            continue;
                        }
                        if (to && tx.to?.toLowerCase() !== to.toLowerCase()) {
                            continue;
                        }
                        transactions.push({
                            hash: tx.hash,
                            from: tx.from,
                            to: tx.to,
                            blockNumber: tx.blockNumber,
                            value: tx.value.toString(),
                            gasUsed: receipt.gasUsed.toString(),
                            status: receipt.status === 1 ? 'Success' : 'Failed',
                            timestamp: Date.now() // We could get actual timestamp from block if needed
                        });
                    }
                }
                catch (error) {
                    console.error(`Error fetching transaction ${hash}:`, error);
                }
            }
            // Sort by block number (most recent first)
            transactions.sort((a, b) => (b.blockNumber || 0) - (a.blockNumber || 0));
            res.json(transactions);
        }
        catch (error) {
            console.error('Error getting transactions:', error);
            res.status(500).json({ error: 'Failed to get transactions' });
        }
    });
    return router;
}
