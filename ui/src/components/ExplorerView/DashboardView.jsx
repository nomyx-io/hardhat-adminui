import React, { useState, useEffect } from 'react';
import CopyButton from './common/CopyButton';

const DashboardView = ({ 
  deployments, 
  network, 
  onNavigateToContracts, 
  onNavigateToTransactions, 
  onNavigateToEvents,
  onNavigateToScenarios,
  onSelectDeployment,
  onNavigateToScenarioRunner
}) => {
  const [dashboardData, setDashboardData] = useState({
    totalContracts: 0,
    totalTransactions: 0,
    totalEvents: 0,
    totalEthSpent: '0',
    recentTransactions: [],
    contractTypes: {},
    loading: true,
    error: null,
    recentScenarioRuns: [],
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setDashboardData(prev => ({ ...prev, loading: true, error: null }));
        
        // Fetch scenarios count
        let totalScenarios = 0;
        try {
          const scenariosResponse = await fetch('/api/scenarios');
          if (scenariosResponse.ok) {
            const scenarios = await scenariosResponse.json();
            totalScenarios = scenarios.length;
          }
        } catch (scenarioErr) {
          console.warn('Failed to fetch scenarios count:', scenarioErr);
        }
        
        // Fetch dashboard statistics
        const response = await fetch(`/api/dashboard/${network}`);
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        
        const data = await response.json();

        // Fetch scenario history
        let recentScenarioRuns = [];
        try {
          const historyRes = await fetch('/api/scenarios/history');
          if (historyRes.ok) {
            recentScenarioRuns = await historyRes.json();
          }
        } catch (historyErr) {
          console.warn('Failed to fetch scenario history:', historyErr);
        }

        setDashboardData(prev => ({
          ...prev,
          ...data,
          totalScenarios,
          recentScenarioRuns,
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

        // Try to get scenarios count even in fallback
        let totalScenarios = 0;
        try {
          const scenariosResponse = await fetch('/api/scenarios');
          if (scenariosResponse.ok) {
            const scenarios = await scenariosResponse.json();
            totalScenarios = scenarios.length;
          }
        } catch (scenarioErr) {
          console.warn('Failed to fetch scenarios count in fallback:', scenarioErr);
        }

        setDashboardData(prev => ({
          ...prev,
          totalContracts,
          contractTypes,
          totalScenarios,
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
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-ping opacity-20"></div>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">Loading Dashboard</h3>
            <p className="text-gray-400">Fetching deployment statistics...</p>
          </div>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
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

        {/* Scenarios Card */}
        <div 
          className="artifact-card bg-gradient-to-br from-indigo-900 to-purple-800 rounded-xl p-6 cursor-pointer hover:from-indigo-800 hover:to-purple-700 transition-all"
          onClick={() => onNavigateToScenarioRunner && onNavigateToScenarioRunner()}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-indigo-500 bg-opacity-20 p-3 rounded-lg">
              <i className="fas fa-play-circle text-2xl text-indigo-300"></i>
            </div>
            <i className="fas fa-arrow-right text-gray-400"></i>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">{dashboardData.totalScenarios || 0}</h3>
          <p className="text-indigo-300 text-sm font-medium">Test Scenarios</p>
          <p className="text-gray-400 text-xs mt-2">Click to run test scenarios</p>
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 artifact-card bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center">
            <i className="fas fa-chart-pie text-blue-400 mr-2"></i>
            Contract Types
          </h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {Object.entries(dashboardData.contractTypes).map(([contractName, count]) => {
              const deployment = deployments.find(d => d.contractName === contractName);
              const isDiamond = deployment && isDiamondContract(deployment);
              
              return (
                <div
                  key={contractName}
                  className="group flex items-center justify-between p-4 bg-gradient-to-r from-gray-700 to-gray-800 rounded-lg cursor-pointer hover:from-blue-900/50 hover:to-purple-900/50 transition-all border border-gray-600 hover:border-blue-500/50"
                  onClick={() => onSelectDeployment && onSelectDeployment(deployment)}
                >
                  <div className="flex items-center flex-1 min-w-0">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
                      isDiamond ? 'bg-yellow-500/20' : 'bg-blue-500/20'
                    }`}>
                      <i className={`${isDiamond ? 'fas fa-gem text-yellow-400' : 'fas fa-file-contract text-blue-400'}`}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium group-hover:text-blue-300 transition-colors truncate">
                          {contractName}
                        </span>
                        {isDiamond && (
                          <span className="flex-shrink-0 text-xs bg-gradient-to-r from-yellow-500 to-amber-500 text-white px-2 py-1 rounded-full font-medium">
                            DIAMOND
                          </span>
                        )}
                      </div>
                      {deployment?.address && (
                        <div className="flex items-center gap-2 mt-1">
                          <code className="text-xs font-mono text-gray-400 truncate">
                            {deployment.address}
                          </code>
                          <CopyButton text={deployment.address} size="small" variant="ghost" showLabel={false} />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-300">{count}</div>
                      <div className="text-xs text-gray-500">instances</div>
                    </div>
                    <i className="fas fa-arrow-right text-gray-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all"></i>
                  </div>
                </div>
              );
            })}
            
            {Object.keys(dashboardData.contractTypes).length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-file-contract text-gray-500 text-2xl"></i>
                </div>
                <h4 className="text-white font-medium mb-2">No Contracts Deployed</h4>
                <p className="text-gray-500 text-sm">Deploy your first contract to see it here</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Scenario Runs */}
        <div className="artifact-card bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center">
            <i className="fas fa-history text-indigo-400 mr-2"></i>
            Recent Scenario Runs
          </h3>
          {dashboardData.recentScenarioRuns.length > 0 ? (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {dashboardData.recentScenarioRuns.slice(0, 5).map((run) => (
                <div key={run.id} className="group flex items-center justify-between p-4 bg-gradient-to-r from-gray-700 to-gray-800 rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all border border-gray-600 hover:border-indigo-500/50">
                  <div className="flex items-center flex-1 min-w-0">
                    <div className="flex-shrink-0 w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center mr-3">
                      <i className={`fas ${run.status === 'completed' ? 'fa-check-circle text-green-400' : 'fa-times-circle text-red-400'}`}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm group-hover:text-indigo-300 transition-colors truncate">
                        {run.id}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-gray-400 text-xs">
                          {new Date(run.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${run.status === 'completed' ? 'text-green-400' : 'text-red-400'}`}>
                      {run.summary.passed}/{run.summary.total} passed
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-history text-gray-500 text-2xl"></i>
              </div>
              <h4 className="text-white font-medium mb-2">No Scenario Runs</h4>
              <p className="text-gray-500 text-sm">Run scenarios to see history here</p>
            </div>
          )}
          <button
            onClick={() => onNavigateToScenarioRunner && onNavigateToScenarioRunner()}
            className="mt-4 w-full bg-indigo-600 text-white px-4 py-2 rounded-lg"
          >
            Run All Scenarios
          </button>
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
