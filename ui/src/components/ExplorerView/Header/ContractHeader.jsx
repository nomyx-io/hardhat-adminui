import React from 'react';

const ContractHeader = ({ deployment }) => {
  // Get contract-specific icon based on contract name
  const getContractIcon = (contractName) => {
    const name = contractName.toLowerCase();
    
    if (name.includes('diamond')) {
      return "fas fa-gem text-yellow-500";
    }
    if (name.includes('token') || name.includes('erc20')) {
      return "fas fa-coins text-green-500";
    }
    if (name.includes('marketplace') || name.includes('market')) {
      return "fas fa-store text-purple-500";
    }
    if (name.includes('storage')) {
      return "fas fa-database text-blue-500";
    }
    if (name.includes('nft') || name.includes('erc721')) {
      return "fas fa-image text-indigo-500";
    }
    if (name.includes('registry')) {
      return "fas fa-address-book text-orange-500";
    }
    if (name.includes('factory')) {
      return "fas fa-industry text-gray-500";
    }
    
    // Default contract icon
    return "fas fa-file-contract text-primary";
  };

  return (
    <header className="bg-gradient-to-r from-gray-800 to-gray-900 p-6 border-b border-gray-700 shadow-lg">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl flex items-center justify-center border border-gray-600">
            <i className={getContractIcon(deployment.contractName)}></i>
          </div>
          <div>
            <h2 className="text-2xl font-bold highlight-text flex items-center">
              {deployment.contractName}
              {deployment.contractName.toLowerCase().includes('diamond') && (
                <span className="ml-3 text-xs bg-gradient-to-r from-yellow-500 to-amber-500 text-white px-2 py-1 rounded-full font-medium">
                  DIAMOND
                </span>
              )}
            </h2>
            <p className="text-gray-400 text-sm glow-text font-mono">{deployment.address}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button className="bg-primary hover:bg-indigo-700 px-4 py-2 rounded-lg text-sm flex items-center transition-all duration-300 hover:scale-105">
            <i className="fas fa-sync-alt mr-2"></i> Refresh
          </button>
          <button className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm flex items-center transition-all duration-300 hover:scale-105">
            <i className="fas fa-download mr-2"></i> Export
          </button>
        </div>
      </div>
    </header>
  );
};

export default ContractHeader;
