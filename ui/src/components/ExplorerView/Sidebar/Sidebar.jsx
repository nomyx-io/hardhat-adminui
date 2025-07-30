import React from 'react';
import DeploymentList from './DeploymentList';

const Sidebar = ({
  deployments,
  selectedDeployment,
  onSelectDeployment,
  title,
  version,
  favorites,
  onToggleFavorite,
  onSearch,
  onNetworkChange,
  networks,
  currentNetwork,
  onSelectFacet,
  selectedFacet,
  currentView,
  onNavigateToDashboard
}) => {
  return (
    <div className="w-full md:w-64 bg-gray-800 p-4 flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <i className="fas fa-hard-hat text-primary mr-2 pulse"></i>
          <span className="highlight-text">{title}</span>
        </h1>
        <p className="text-gray-400 text-sm mt-1 glow-text">Deployment Artifact Explorer</p>
      </div>

      {/* Navigation Menu */}
      <div className="mb-6">
        <button
          onClick={onNavigateToDashboard}
          className={`w-full text-left p-3 rounded-lg flex items-center transition-colors ${
            currentView === 'dashboard'
              ? 'bg-primary text-white'
              : 'text-gray-300 hover:bg-gray-700 hover:text-white'
          }`}
        >
          <i className="fas fa-tachometer-alt mr-3"></i>
          Dashboard
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search contracts..."
          className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>

      <DeploymentList
        deployments={deployments}
        selectedDeployment={selectedDeployment}
        onSelectDeployment={onSelectDeployment}
        favorites={favorites}
        onToggleFavorite={onToggleFavorite}
        onSelectFacet={onSelectFacet}
        selectedFacet={selectedFacet}
        currentView={currentView}
      />

      <div className="mt-auto pt-4 border-t border-gray-700">
        <div className="flex items-center text-sm text-gray-400">
          <i className="fas fa-network-wired mr-2"></i>
          <select
            value={currentNetwork}
            onChange={(e) => onNetworkChange(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
          >
            {networks.map(network => (
              <option key={network} value={network}>{network}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center text-sm text-gray-400 mt-1">
          <i className="fas fa-code-branch mr-2"></i>
          <span>Version: {version || 'N/A'}</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
