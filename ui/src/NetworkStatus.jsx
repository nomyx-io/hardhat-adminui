import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ethers } from 'ethers';

const NetworkStatus = () => {
  // Memoize the provider to prevent re-renders
  const provider = useMemo(() => new ethers.providers.Web3Provider(window.ethereum || new ethers.providers.JsonRpcProvider("http://localhost:8545")), []);

  // State to hold network data
  const [networkData, setNetworkData] = useState({
    blockNumber: '...',
    gasPrice: '...',
    peerCount: '...',
  });
  const [error, setError] = useState('');

  // Function to fetch all network data
  const fetchNetworkData = useCallback(async () => {
    try {
      // Fetch data in parallel for efficiency
      const [blockNumber, feeData, peerCount] = await Promise.all([
        provider.getBlockNumber(),
        provider.getFeeData(),
        provider.getNetwork().then(net => net.chainId === 1337 ? provider.send('net_peerCount', []) : 'N/A') // net_peerCount is often restricted on public networks
      ]);

      const gasPrice = feeData.gasPrice ? ethers.utils.formatUnits(feeData.gasPrice, 'gwei') : 'N/A';
      
      setNetworkData({
        blockNumber: blockNumber.toString(),
        gasPrice: `${parseFloat(gasPrice).toFixed(2)} Gwei`,
        peerCount: peerCount !== 'N/A' ? parseInt(peerCount, 16) : 'N/A', // Convert hex to decimal
      });
      setError('');
    } catch (e) {
      console.error("Could not fetch network status:", e);
      setError("Failed to fetch network data.");
      // Set to default values on error
      setNetworkData({ blockNumber: 'N/A', gasPrice: 'N/A', peerCount: 'N/A' });
    }
  }, [provider]);

  // Fetch data on mount and then poll every 5 seconds
  useEffect(() => {
    fetchNetworkData();
    const interval = setInterval(fetchNetworkData, 5000); // Refresh every 5s
    return () => clearInterval(interval); // Cleanup on unmount
  }, [fetchNetworkData]);

  return (
    <div className="network-status-container">
      <div className="status-item">
        <span className="status-label">Block</span>
        <span className="status-value">{networkData.blockNumber}</span>
      </div>
      <div className="status-item">
        <span className="status-label">Gas</span>
        <span className="status-value">{networkData.gasPrice}</span>
      </div>
      <div className="status-item">
        <span className="status-label">Peers</span>
        <span className="status-value">{networkData.peerCount}</span>
      </div>
      {error && <div className="status-error-tooltip">{error}</div>}
    </div>
  );
};

export default NetworkStatus;
