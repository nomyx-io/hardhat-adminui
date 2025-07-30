import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ethers } from 'ethers';

const BlockchainExplorer = () => {
  // Ethers provider, memoized for performance
  const provider = useMemo(() => new ethers.providers.Web3Provider(window.ethereum || new ethers.providers.JsonRpcProvider("http://localhost:8545")), []);

  // State for blocks, selected items, and loading/error status
  const [latestBlocks, setLatestBlocks] = useState([]);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [selectedTx, setSelectedTx] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch the latest 10 blocks from the blockchain
  const fetchLatestBlocks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const latestBlockNumber = await provider.getBlockNumber();
      const blockPromises = [];
      // Fetch last 10 blocks, or fewer if the chain is new
      for (let i = 0; i < 10 && latestBlockNumber - i >= 0; i++) {
        blockPromises.push(provider.getBlock(latestBlockNumber - i));
      }
      const blocks = await Promise.all(blockPromises);
      setLatestBlocks(blocks.filter(b => b)); // Filter out any null blocks
    } catch (e) {
      console.error("Failed to fetch blocks:", e);
      setError("Could not fetch block data. Ensure you are connected to a network.");
    } finally {
      setLoading(false);
    }
  }, [provider]);

  // Initial fetch and set up a poller to refresh blocks every 10 seconds
  useEffect(() => {
    fetchLatestBlocks();
    const interval = setInterval(fetchLatestBlocks, 10000); // Refresh every 10s
    return () => clearInterval(interval); // Cleanup on unmount
  }, [fetchLatestBlocks]);

  // Handlers for selecting a block or transaction to view details
  const handleBlockSelect = (block) => {
    setSelectedBlock(block);
    setSelectedTx(null); // Clear selected transaction when a new block is chosen
  };

  const handleTxSelect = async (txHash) => {
    setLoading(true);
    try {
      const tx = await provider.getTransaction(txHash);
      const receipt = await provider.getTransactionReceipt(txHash);
      setSelectedTx({ ...tx, receipt }); // Combine tx and receipt info
    } catch (e) {
      console.error("Failed to fetch transaction details:", e);
      setError("Could not fetch transaction details.");
    } finally {
      setLoading(false);
    }
  };

  // Render a single block item in the list
  const renderBlockItem = (block) => (
    <li key={block.hash} onClick={() => handleBlockSelect(block)} className={selectedBlock?.hash === block.hash ? 'active' : ''}>
      <div className="block-item-header">
        <strong>Block #{block.number}</strong>
        <span>{block.transactions.length} Txs</span>
      </div>
      <div className="block-item-footer">
        <small>Mined {new Date(block.timestamp * 1000).toLocaleString()}</small>
      </div>
    </li>
  );
  
  return (
    <div className="explorer-container">
      <div className="explorer-sidebar">
        <h3>Latest Blocks</h3>
        {loading && !latestBlocks.length ? <p>Loading...</p> : <ul>{latestBlocks.map(renderBlockItem)}</ul>}
        <button onClick={fetchLatestBlocks} disabled={loading} className="refresh-btn">Refresh</button>
      </div>
      <div className="explorer-main">
        {error && <div className="message error-message">{error}</div>}
        
        {!selectedBlock && !error && <div className="message">Select a block to see its details.</div>}

        {selectedBlock && (
          <div className="details-view">
            <h3>Block #{selectedBlock.number}</h3>
            <div className="details-grid">
              <div><strong>Hash:</strong> {selectedBlock.hash}</div>
              <div><strong>Parent Hash:</strong> {selectedBlock.parentHash}</div>
              <div><strong>Timestamp:</strong> {new Date(selectedBlock.timestamp * 1000).toLocaleString()}</div>
              <div><strong>Gas Used:</strong> {selectedBlock.gasUsed.toString()}</div>
              <div><strong>Gas Limit:</strong> {selectedBlock.gasLimit.toString()}</div>
              <div><strong>Miner:</strong> {selectedBlock.miner}</div>
            </div>

            <h4 className="tx-list-header">Transactions ({selectedBlock.transactions.length})</h4>
            <ul className="tx-list">
              {selectedBlock.transactions.map(txHash => (
                <li key={txHash} onClick={() => handleTxSelect(txHash)} className={selectedTx?.hash === txHash ? 'active' : ''}>
                  {txHash.substring(0, 20)}...
                </li>
              ))}
            </ul>
          </div>
        )}

        {selectedTx && (
            <div className="details-view tx-details">
                <h3>Transaction Details</h3>
                <div className="details-grid">
                    <div><strong>Hash:</strong> {selectedTx.hash}</div>
                    <div><strong>From:</strong> {selectedTx.from}</div>
                    <div><strong>To:</strong> {selectedTx.to || 'Contract Creation'}</div>
                    <div><strong>Value:</strong> {ethers.utils.formatEther(selectedTx.value)} ETH</div>
                    <div><strong>Gas Price:</strong> {ethers.utils.formatUnits(selectedTx.gasPrice, 'gwei')} Gwei</div>
                    {selectedTx.receipt && <>
                        <div><strong>Block Number:</strong> {selectedTx.receipt.blockNumber}</div>
                        <div><strong>Gas Used:</strong> {selectedTx.receipt.gasUsed.toString()}</div>
                        <div><strong>Status:</strong> {selectedTx.receipt.status === 1 ? 'Success' : 'Failed'}</div>
                    </>}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default BlockchainExplorer;
