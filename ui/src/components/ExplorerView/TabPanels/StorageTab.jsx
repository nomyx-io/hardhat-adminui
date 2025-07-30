import React, { useState, useEffect } from 'react';

const StorageTab = ({ deployment }) => {
  const [slot, setSlot] = useState('');
  const [slotValue, setSlotValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [storageLayout, setStorageLayout] = useState(null);
  const [layoutLoading, setLayoutLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load storage layout with auto-populated values
  useEffect(() => {
    const loadStorageLayout = async () => {
      if (!deployment?.contractName || !deployment?.network) return;
      
      setLayoutLoading(true);
      try {
        const response = await fetch(`/api/storage/${deployment.network}/${deployment.contractName}/layout`);
        const data = await response.json();
        if (response.ok && data.layout) {
          setStorageLayout(data.layout);
        } else {
          console.warn('No storage layout available:', data.message);
          setStorageLayout(null);
        }
      } catch (error) {
        console.error('Error loading storage layout:', error);
        setStorageLayout(null);
      } finally {
        setLayoutLoading(false);
      }
    };

    loadStorageLayout();
  }, [deployment]);

  const handleQuerySlot = async () => {
    if (!slot || !deployment?.network || !deployment?.address) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/storage/${deployment.network}/${deployment.address}/${slot}`);
      const data = await response.json();
      if (response.ok) {
        setSlotValue(data.value);
      } else {
        throw new Error(data.error || 'Failed to fetch storage slot.');
      }
    } catch (error) {
      console.error('Error fetching storage slot:', error);
      setSlotValue('Error fetching value.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshLayout = async () => {
    if (!deployment?.contractName || !deployment?.network) return;
    
    setRefreshing(true);
    try {
      const response = await fetch(`/api/storage/${deployment.network}/${deployment.contractName}/layout`);
      const data = await response.json();
      if (response.ok && data.layout) {
        setStorageLayout(data.layout);
      }
    } catch (error) {
      console.error('Error refreshing storage layout:', error);
    } finally {
      setRefreshing(false);
    }
  };

  if (layoutLoading) {
    return (
      <div className="glass-card p-8 text-center">
        <div className="spinner mx-auto mb-4"></div>
        <h3 className="text-lg font-semibold text-white mb-2">Loading Storage Layout</h3>
        <p className="text-slate-400">Fetching contract storage information...</p>
      </div>
    );
  }

  if (!storageLayout || !storageLayout.storage || storageLayout.storage.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <div className="text-6xl mb-4">🗄️</div>
        <h3 className="text-lg font-semibold text-white mb-2">No Storage Layout Available</h3>
        <p className="text-slate-400 mb-4">
          Storage layout information is not available for this contract.
          Ensure the contract was compiled with storage layout generation enabled.
        </p>
        <div className="glass-card p-4 border border-yellow-500/20">
          <p className="text-yellow-400 text-sm">
            💡 To enable storage layout, add this to your hardhat.config.js:
          </p>
          <pre className="text-yellow-300 text-xs mt-2 bg-black/20 p-2 rounded overflow-x-auto">
{`solidity: {
  version: "0.8.19",
  settings: {
    outputSelection: {
      "*": {
        "*": ["storageLayout"]
      }
    }
  }
}`}
          </pre>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Refresh Button */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white flex items-center">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mr-3">
            🗄️
          </div>
          Storage Layout
        </h3>
        <button
          onClick={handleRefreshLayout}
          disabled={refreshing}
          className="glass-button px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105"
        >
          {refreshing ? '🔄' : '↻'} Refresh
        </button>
      </div>

      {/* Manual Slot Query */}
      <div className="glass-card p-6">
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
          <span className="text-blue-400 mr-2">🔍</span>
          Manual Slot Query
        </h4>
        <div className="flex items-center space-x-3 mb-4">
          <input
            type="text"
            value={slot}
            onChange={(e) => setSlot(e.target.value)}
            placeholder="Enter storage slot (0, 1, 2...)"
            className="flex-1 bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
          />
          <button
            onClick={handleQuerySlot}
            disabled={loading || !slot}
            className="glass-button px-6 py-2 rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '🔄 Querying...' : 'Query'}
          </button>
        </div>
        {slotValue && (
          <div className="glass-card p-4 border border-green-500/20">
            <p className="text-slate-400 text-sm mb-1">Value at slot {slot}:</p>
            <p className="font-mono text-green-400 break-all">{slotValue}</p>
          </div>
        )}
      </div>

      {/* Storage Layout Table */}
      <div className="glass-card p-6">
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
          <span className="text-purple-400 mr-2">📊</span>
          Contract Storage Variables
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-600/50">
                <th className="text-left text-slate-400 text-sm font-medium pb-3 px-2">Slot</th>
                <th className="text-left text-slate-400 text-sm font-medium pb-3 px-2">Variable</th>
                <th className="text-left text-slate-400 text-sm font-medium pb-3 px-2">Type</th>
                <th className="text-left text-slate-400 text-sm font-medium pb-3 px-2">Current Value</th>
                <th className="text-left text-slate-400 text-sm font-medium pb-3 px-2">Formatted</th>
              </tr>
            </thead>
            <tbody>
              {storageLayout.storage.map((item, index) => (
                <tr key={index} className="border-b border-slate-700/30 hover:bg-slate-800/20 transition-colors">
                  <td className="py-3 px-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-500/20 text-blue-400">
                      {item.slot}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <span className="font-mono text-white font-medium">{item.label}</span>
                  </td>
                  <td className="py-3 px-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-500/20 text-purple-400">
                      {item.type}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    {item.currentValue ? (
                      <span className="font-mono text-xs text-slate-300 break-all max-w-32 block">
                        {item.currentValue.length > 20 ?
                          `${item.currentValue.slice(0, 10)}...${item.currentValue.slice(-6)}` :
                          item.currentValue
                        }
                      </span>
                    ) : item.error ? (
                      <span className="text-red-400 text-xs">Error</span>
                    ) : (
                      <span className="text-slate-500 text-xs">No value</span>
                    )}
                  </td>
                  <td className="py-3 px-2">
                    {item.formattedValue && item.formattedValue !== item.currentValue ? (
                      <span className="font-mono text-green-400 text-sm font-medium">
                        {item.formattedValue}
                      </span>
                    ) : (
                      <span className="text-slate-500 text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Storage Layout Info */}
      <div className="glass-card p-6">
        <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
          <span className="text-amber-400 mr-2">ℹ️</span>
          Storage Layout Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-slate-400">Total Storage Slots:</span>
            <span className="text-white ml-2 font-mono">{storageLayout.storage.length}</span>
          </div>
          <div>
            <span className="text-slate-400">Contract:</span>
            <span className="text-white ml-2 font-mono">{deployment.contractName}</span>
          </div>
          <div className="md:col-span-2">
            <span className="text-slate-400">Network:</span>
            <span className="text-white ml-2 font-mono">{deployment.network}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StorageTab;
