import React from 'react';
import { ethers } from 'ethers';
import CopyButton from '../../common/CopyButton';

const DeploymentInfoCard = ({ deployment }) => {
  const formatGasUsed = (gasUsed) => {
    if (!gasUsed) return 'Unknown';
    return parseInt(gasUsed).toLocaleString();
  };

  const formatDeploymentCost = () => {
    if (!deployment?.receipt?.gasUsed || !deployment?.receipt?.effectiveGasPrice) {
      return 'Unknown';
    }
    
    try {
      const cost = ethers.BigNumber.from(deployment.receipt.gasUsed)
        .mul(ethers.BigNumber.from(deployment.receipt.effectiveGasPrice));
      return ethers.utils.formatEther(cost);
    } catch (error) {
      return 'Unknown';
    }
  };

  const getNetworkColor = (network) => {
    switch (network?.toLowerCase()) {
      case 'mainnet': return 'text-green-400';
      case 'goerli': case 'sepolia': return 'text-blue-400';
      case 'polygon': return 'text-purple-400';
      case 'localhost': case 'hardhat': return 'text-gray-400';
      default: return 'text-emerald-400';
    }
  };

  const getNetworkIcon = (network) => {
    switch (network?.toLowerCase()) {
      case 'mainnet': return 'fas fa-globe';
      case 'goerli': case 'sepolia': return 'fas fa-flask';
      case 'polygon': return 'fas fa-hexagon';
      case 'localhost': case 'hardhat': return 'fas fa-home';
      default: return 'fas fa-network-wired';
    }
  };

  if (!deployment) {
    return (
      <div className="artifact-card bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700">
        <div className="text-center py-8">
          <i className="fas fa-exclamation-triangle text-gray-500 text-3xl mb-3"></i>
          <p className="text-gray-400">No deployment information available</p>
        </div>
      </div>
    );
  }

  const deploymentCost = formatDeploymentCost();

  return (
    <div className="artifact-card bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 shadow-lg">
      <h3 className="text-xl font-bold mb-6 flex items-center text-white">
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
          <i className="fas fa-cogs text-white"></i>
        </div>
        Deployment Information
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Network */}
        <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
          <p className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-2">Network</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <i className={`${getNetworkIcon(deployment.network)} ${getNetworkColor(deployment.network)}`}></i>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  deployment.network?.toLowerCase() === 'localhost' || deployment.network?.toLowerCase() === 'hardhat'
                    ? 'bg-gray-400'
                    : 'bg-emerald-400 animate-pulse'
                }`}></div>
                <span className={`font-semibold capitalize ${getNetworkColor(deployment.network)}`}>
                  {deployment.network || 'Unknown'}
                </span>
              </div>
            </div>
            {deployment.network && (
              <CopyButton text={deployment.network} size="small" variant="ghost" />
            )}
          </div>
        </div>

        {/* Solidity Version */}
        <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
          <p className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-2">Solidity Version</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <i className="fab fa-ethereum text-purple-400"></i>
              <code className="text-purple-300 font-bold text-lg">
                {deployment.solcVersion || 'Unknown'}
              </code>
            </div>
            {deployment.solcVersion && (
              <CopyButton text={deployment.solcVersion} size="small" variant="ghost" />
            )}
          </div>
        </div>

        {/* Optimizer */}
        <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
          <p className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-2">Optimizer</p>
          <div className="flex items-center space-x-3">
            <i className={`fas ${deployment.optimizer?.enabled ? 'fa-check-circle text-green-400' : 'fa-times-circle text-orange-400'}`}></i>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${deployment.optimizer?.enabled ? 'bg-green-400' : 'bg-orange-400'}`}></div>
              <span className={`font-semibold ${deployment.optimizer?.enabled ? 'text-green-400' : 'text-orange-400'}`}>
                {deployment.optimizer?.enabled
                  ? `Enabled (${deployment.optimizer.runs || 0} runs)`
                  : 'Disabled'
                }
              </span>
            </div>
          </div>
        </div>

        {/* Gas Used */}
        <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
          <p className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-2">Gas Used</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <i className="fas fa-gas-pump text-amber-400"></i>
              <span className="text-amber-300 font-bold text-lg">
                {formatGasUsed(deployment.receipt?.gasUsed)}
              </span>
            </div>
            {deployment.receipt?.gasUsed && (
              <CopyButton text={deployment.receipt.gasUsed.toString()} size="small" variant="ghost" />
            )}
          </div>
        </div>

        {/* Deployment Cost */}
        <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700 md:col-span-2">
          <p className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-2">Deployment Cost</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <i className="fab fa-ethereum text-white text-sm"></i>
              </div>
              <div>
                <p className="text-blue-300 font-bold text-2xl">
                  {deploymentCost !== 'Unknown' ? `${parseFloat(deploymentCost).toFixed(6)} ETH` : 'Unknown'}
                </p>
                {deploymentCost !== 'Unknown' && (
                  <p className="text-gray-400 text-sm">
                    ~${(parseFloat(deploymentCost) * 2000).toFixed(2)} USD
                  </p>
                )}
              </div>
            </div>
            {deploymentCost !== 'Unknown' && (
              <CopyButton text={deploymentCost} size="small" variant="ghost" />
            )}
          </div>
        </div>

        {/* Additional Info */}
        {(deployment.receipt?.confirmations !== undefined || deployment.timestamp) && (
          <div className="md:col-span-2 grid grid-cols-2 gap-4">
            {deployment.receipt?.confirmations !== undefined && (
              <div className="p-3 bg-gray-900/30 rounded-lg border border-gray-700 text-center">
                <p className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-1">Confirmations</p>
                <p className="text-blue-300 font-bold text-lg">{deployment.receipt.confirmations}</p>
              </div>
            )}
            {deployment.timestamp && (
              <div className="p-3 bg-gray-900/30 rounded-lg border border-gray-700 text-center">
                <p className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-1">Deployed At</p>
                <p className="text-green-300 font-semibold text-sm">
                  {new Date(deployment.timestamp * 1000).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeploymentInfoCard;
