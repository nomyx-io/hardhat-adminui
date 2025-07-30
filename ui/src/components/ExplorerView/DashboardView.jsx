import React, { useState, useEffect } from 'react';

const DashboardView = ({ 
  deployments, 
  network, 
  onNavigateToContracts, 
  onNavigateToTransactions, 
  onNavigateToEvents,
  onSelectDeployment 
}) => {
  const [dashboardData, setDashboardData] = useState({
    totalContracts: 0,
    totalTransactions: 0,
    totalEvents: 0,
    totalEthSpent: '0',
    recentTransactions: [],
    contractTypes: {},
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setDashboardData(prev => ({ ...prev, loading: true, error: null }));
        
        // Fetch dashboard statistics
        const response = await fetch(`/api/dashboard/${network}`);
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        
        const data = await response.json();
        setDashboardData(prev => ({
          ...prev,
          ...data,
          loading: false
        }));
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        
        // Fallback to calculating from deployments
        const totalContracts = deployments.length;
        const contractTypes = deployments.reduce((acc, dep) => {
          acc[dep.contractName] = (acc[dep.contractName] || 0) + 1;
          return acc;
        }, {});

        setDashboardData(prev => ({
          ...prev,
          totalContracts,
          contractTypes,
          loading: false,
          error: 'Some dashboard data unavailable'
        }));
      }
    };

    fetchDashboardData();
  }, [network, deployments]);

  const handleVerifyAllContracts = async () => {
    if (network === 'localhost') {
      alert('Contract verification is not available for localhost network');
      return;
    }
    
    try {
      const response = await fetch(`/api/verify-contracts/${network}`, {
        method: 'POST'
      });
      
      if (response.ok) {
        alert('Contract verification initiated successfully');
      } else {
        throw new Error('Failed to initiate verification');
      }
    } catch (err) {
      alert(`Error verifying contracts: ${err.message}`);
    }
  };

  if (dashboardData.loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-3xl text-primary mb-4"></i>
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            <i className="fas fa-tachometer-alt text-primary mr-3"></i>
            Dashboard
          </h1>
          <p className="text-gray-400">Overview of your {network} deployment</p>
        </div>
        
        {network !== 'localhost' && (
          <button
            onClick={handleVerifyAllContracts}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
          >
            <i className="fas fa-shield-check mr-2"></i>
            Verify All Contracts
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Contracts Card */}
        <div 
          className="artifact-card bg-gradient-to-br from-blue-900 to-blue-800 rounded-xl p-6 cursor-pointer hover:from-blue-800 hover:to-blue-700 transition-all"
          onClick={() => onNavigateToContracts && onNavigateToContracts()}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-500 bg-opacity-20 p-3 rounded-lg">
              <i className="fas fa-file-contract text-2xl text-blue-300"></i>
            </div>
            <i className="fas fa-arrow-right text-gray-400"></i>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">{dashboardData.totalContracts}</h3>
          <p className="text-blue-300 text-sm font-medium">Deployed Contracts</p>
          <p className="text-gray-400 text-xs mt-2">Click to view all contracts</p>
        </div>

        {/* Transactions Card */}
        <div 
          className="artifact-card bg-gradient-to-br from-green-900 to-green-800 rounded-xl p-6 cursor-pointer hover:from-green-800 hover:to-green-700 transition-all"
          onClick={() => onNavigateToTransactions && onNavigateToTransactions()}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-500 bg-opacity-20 p-3 rounded-lg">
              <i className="fas fa-exchange-alt text-2xl text-green-300"></i>
            </div>
            <i className="fas fa-arrow-right text-gray-400"></i>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">{dashboardData.totalTransactions}</h3>
          <p className="text-green-300 text-sm font-medium">Total Transactions</p>
          <p className="text-gray-400 text-xs mt-2">Click to view transaction history</p>
        </div>

        {/* Events Card */}
        <div 
          className="artifact-card bg-gradient-to-br from-purple-900 to-purple-800 rounded-xl p-6 cursor-pointer hover:from-purple-800 hover:to-purple-700 transition-all"
          onClick={() => onNavigateToEvents && onNavigateToEvents()}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-500 bg-opacity-20 p-3 rounded-lg">
              <i className="fas fa-bell text-2xl text-purple-300"></i>
            </div>
            <i className="fas fa-arrow-right text-gray-400"></i>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">{dashboardData.totalEvents}</h3>
          <p className="text-purple-300 text-sm font-medium">Events Generated</p>
          <p className="text-gray-400 text-xs mt-2">Click to view event logs</p>
        </div>

        {/* ETH Spent Card */}
        <div className="artifact-card bg-gradient-to-br from-yellow-900 to-orange-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-yellow-500 bg-opacity-20 p-3 rounded-lg">
              <i className="fab fa-ethereum text-2xl text-yellow-300"></i>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">{dashboardData.totalEthSpent}</h3>
          <p className="text-yellow-300 text-sm font-medium">ETH Spent</p>
          <p className="text-gray-400 text-xs mt-2">Total gas costs</p>
        </div>
      </div>

      {/* Contract Types Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="artifact-card bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center">
            <i className="fas fa-chart-pie text-blue-400 mr-2"></i>
            Contract Types
          </h3>
          <div className="space-y-3">
            {Object.entries(dashboardData.contractTypes).map(([contractName, count]) => {
              const deployment = deployments.find(d => d.contractName === contractName);
              const isDiamond = deployment && isDiamondContract(deployment);
              
              return (
                <div 
                  key={contractName}
                  className="flex items-center justify-between p-3 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors"
                  onClick={() => onSelectDeployment && onSelectDeployment(deployment)}
                >
                  <div className="flex items-center">
                    <i className={`${isDiamond ? 'fas fa-gem text-yellow-500' : 'fas fa-file-contract text-blue-400'} mr-3`}></i>
                    <span className="text-white font-medium">{contractName}</span>
                    {isDiamond && (
                      <span className="ml-2 text-xs bg-yellow-600 px-2 py-1 rounded">DIAMOND</span>
                    )}
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-300 mr-2">{count}</span>
                    <i className="fas fa-arrow-right text-gray-500"></i>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="artifact-card bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center">
            <i className="fas fa-history text-green-400 mr-2"></i>
            Recent Activity
          </h3>
          {dashboardData.recentTransactions.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.recentTransactions.slice(0, 5).map((tx, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div className="flex items-center">
                    <i className="fas fa-exchange-alt text-green-400 mr-3"></i>
                    <div>
                      <p className="text-white font-medium text-sm">{tx.method || 'Transaction'}</p>
                      <p className="text-gray-400 text-xs">{tx.timestamp}</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-gray-300">
                    {tx.hash?.slice(0, 8)}...
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <i className="fas fa-clock text-gray-500 text-3xl mb-2"></i>
              <p className="text-gray-500">No recent activity</p>
            </div>
          )}
        </div>
      </div>

      {dashboardData.error && (
        <div className="bg-yellow-900 border border-yellow-700 rounded-lg p-4">
          <div className="flex items-center">
            <i className="fas fa-exclamation-triangle text-yellow-400 mr-2"></i>
            <span className="text-yellow-200">{dashboardData.error}</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to detect Diamond contracts consistently
const isDiamondContract = (deployment) => {
  if (!deployment) return false;
  return deployment.contractName === 'Diamond' ||
    deployment.abi.some(item =>
      item.name === 'diamondCut' ||
      item.name === 'facets' ||
      item.name === 'facetAddress' ||
      item.name === 'facetFunctionSelectors' ||
      (item.type === 'event' && item.name === 'DiamondCut') ||
      (item.type === 'fallback') ||
      (item.type === 'function' && item.name === 'diamondAddress')
    );
};

export default DashboardView;