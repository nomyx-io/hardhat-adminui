import React, { useState, useEffect } from 'react';
import ContractDetailsCard from './ContractDetailsCard';
import DeploymentInfoCard from './DeploymentInfoCard';
import RecentTransactionsCard from './RecentTransactionsCard';

const OverviewTab = ({ deployment, onTransactionClick, isLoading = false, error = null }) => {
  const [animationDelay, setAnimationDelay] = useState(0);

  useEffect(() => {
    // Stagger the animation of cards
    setAnimationDelay(0);
  }, [deployment]);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Loading skeleton for contract details */}
          <div className="artifact-card bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 animate-pulse">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gray-700 rounded-lg mr-3"></div>
              <div className="h-6 bg-gray-700 rounded w-32"></div>
            </div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-3 bg-gray-700 rounded w-24"></div>
                  <div className="h-4 bg-gray-600 rounded w-full"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Loading skeleton for deployment info */}
          <div className="artifact-card bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 animate-pulse">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gray-700 rounded-lg mr-3"></div>
              <div className="h-6 bg-gray-700 rounded w-40"></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-3 bg-gray-700 rounded w-20"></div>
                  <div className="h-4 bg-gray-600 rounded w-full"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Loading skeleton for transactions */}
        <div className="artifact-card bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 animate-pulse">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-gray-700 rounded-lg mr-3"></div>
            <div className="h-6 bg-gray-700 rounded w-36"></div>
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-exclamation-triangle text-white text-xl"></i>
          </div>
          <h3 className="text-xl font-semibold text-red-400 mb-2">Error Loading Overview</h3>
          <p className="text-gray-400 mb-4 max-w-md">{error.message || 'An unexpected error occurred while loading the contract overview.'}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-500 hover:to-red-600 transition-all"
          >
            <i className="fas fa-redo mr-2"></i>
            Retry
          </button>
        </div>
      </div>
    );
  }

  // No deployment data
  if (!deployment) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-file-contract text-gray-300 text-xl"></i>
          </div>
          <h3 className="text-xl font-semibold text-gray-300 mb-2">No Contract Selected</h3>
          <p className="text-gray-500 mb-4 max-w-md">
            Select a contract from the sidebar to view its overview information.
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
            <i className="fas fa-arrow-left"></i>
            <span>Choose a contract to get started</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Main content cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          className="animate-slide-up"
          style={{ animationDelay: `${animationDelay}ms` }}
        >
          <ContractDetailsCard deployment={deployment} />
        </div>
        
        <div
          className="animate-slide-up"
          style={{ animationDelay: `${animationDelay + 100}ms` }}
        >
          <DeploymentInfoCard deployment={deployment} />
        </div>
      </div>

      {/* Recent transactions - full width */}
      <div
        className="animate-slide-up"
        style={{ animationDelay: `${animationDelay + 200}ms` }}
      >
        <RecentTransactionsCard
          recentTransactions={deployment?.recentTransactions || []}
          onTransactionClick={onTransactionClick}
          isLoading={false}
        />
      </div>

      {/* Summary statistics */}
      {deployment && (
        <div
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-slide-up"
          style={{ animationDelay: `${animationDelay + 300}ms` }}
        >
          <div className="p-4 bg-gradient-to-br from-blue-900/30 to-blue-800/30 rounded-lg border border-blue-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-300 text-sm font-medium">Contract Size</p>
                <p className="text-white text-lg font-bold">
                  {deployment.bytecode ? `${Math.round(deployment.bytecode.length / 2)} bytes` : 'Unknown'}
                </p>
              </div>
              <i className="fas fa-file-code text-blue-400 text-xl"></i>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-green-900/30 to-green-800/30 rounded-lg border border-green-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-300 text-sm font-medium">Functions</p>
                <p className="text-white text-lg font-bold">
                  {deployment.abi ? deployment.abi.filter(item => item.type === 'function').length : 0}
                </p>
              </div>
              <i className="fas fa-cogs text-green-400 text-xl"></i>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-purple-900/30 to-purple-800/30 rounded-lg border border-purple-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-300 text-sm font-medium">Events</p>
                <p className="text-white text-lg font-bold">
                  {deployment.abi ? deployment.abi.filter(item => item.type === 'event').length : 0}
                </p>
              </div>
              <i className="fas fa-broadcast-tower text-purple-400 text-xl"></i>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OverviewTab;
