import React from 'react';

const ContractHeader = ({ deployment }) => {
  return (
    <header className="bg-gray-800 p-4 border-b border-gray-700">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold highlight-text">{deployment.contractName}</h2>
          <p className="text-gray-400 text-sm glow-text">{deployment.address}</p>
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
