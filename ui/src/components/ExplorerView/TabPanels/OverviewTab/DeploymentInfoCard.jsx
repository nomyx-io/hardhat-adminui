import React from 'react';
import { ethers } from 'ethers';

const DeploymentInfoCard = ({ deployment }) => {
  return (
    <div className="glass-card p-6 animate-fade-in">
      <h3 className="text-xl font-bold mb-6 flex items-center">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mr-3">
          <i className="fas fa-cogs text-white text-sm"></i>
        </div>
        <span className="gradient-text">Deployment Information</span>
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Network</p>
          <div className="flex items-center space-x-2">
            <div className="pulse-dot bg-emerald-400"></div>
            <p className="text-emerald-400 font-semibold capitalize">{deployment.network}</p>
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Solidity Version</p>
          <p className="text-purple-400 font-mono text-lg">{deployment.solcVersion}</p>
        </div>
        <div className="space-y-1">
          <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Optimizer</p>
          <div className="flex items-center space-x-2">
            {deployment.optimizer?.enabled ? (
              <>
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-green-400 font-semibold">
                  Enabled ({deployment.optimizer.runs} runs)
                </span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                <span className="text-orange-400 font-semibold">Disabled</span>
              </>
            )}
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Gas Used</p>
          <p className="text-amber-400 font-mono text-lg">
            {deployment.receipt?.gasUsed
              ? parseInt(deployment.receipt.gasUsed).toLocaleString()
              : 'Unknown'
            }
          </p>
        </div>
        <div className="space-y-1 md:col-span-2">
          <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Deployment Cost</p>
          <div className="flex items-center space-x-2">
            <i className="fas fa-ethereum text-blue-400"></i>
            <p className="text-blue-400 font-bold text-xl">
              {deployment.receipt?.gasUsed && deployment.receipt?.effectiveGasPrice
                ? ethers.utils.formatEther(
                    ethers.BigNumber.from(deployment.receipt.gasUsed)
                      .mul(ethers.BigNumber.from(deployment.receipt.effectiveGasPrice))
                  ) + ' ETH'
                : 'Unknown'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeploymentInfoCard;
