import React, { useState, useEffect } from 'react';
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
  onNavigateToDashboard,
  onNavigateToNewScenario,
  onNavigateToEditScenario,
  onNavigateToScenarioRunner
}) => {
  const [scenarios, setScenarios] = useState([]);
  const [scenariosExpanded, setScenariosExpanded] = useState(false);
  const [contractsExpanded, setContractsExpanded] = useState(true);
  const [loadingScenarios, setLoadingScenarios] = useState(false);

  useEffect(() => {
    loadScenarios();
  }, []);

  const loadScenarios = async () => {
    try {
      setLoadingScenarios(true);
      const response = await fetch('/api/scenarios');
      if (response.ok) {
        const data = await response.json();
        setScenarios(data);
      }
    } catch (err) {
      console.error('Error loading scenarios:', err);
    } finally {
      setLoadingScenarios(false);
    }
  };

  const getScenarioIcon = (scenarioName) => {
    if (scenarioName.toLowerCase().includes('security')) return 'fas fa-shield-alt';
    if (scenarioName.toLowerCase().includes('performance')) return 'fas fa-tachometer-alt';
    if (scenarioName.toLowerCase().includes('integration')) return 'fas fa-link';
    if (scenarioName.toLowerCase().includes('stress')) return 'fas fa-weight-hanging';
    return 'fas fa-play';
  };
  return (
    <div className="w-full md:w-[296px] bg-gray-800 p-4 flex flex-col">
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

      {/* Contracts Section */}
      <div className="mb-6">
        <button
          onClick={() => setContractsExpanded(!contractsExpanded)}
          className="w-full text-left p-2 rounded-lg flex items-center justify-between text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
        >
          <div className="flex items-center">
            <i className="fas fa-file-contract mr-3"></i>
            <span className="font-medium">Contracts</span>
            <span className="ml-2 text-xs bg-gray-600 px-2 py-1 rounded-full">{deployments.length}</span>
          </div>
          <i className={`fas fa-chevron-${contractsExpanded ? 'down' : 'right'} text-xs`}></i>
        </button>
        
        {contractsExpanded && (
          <div className="mt-2">
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
          </div>
        )}
      </div>

      {/* Scenarios Section */}
      <div className="mb-6">
        <button
          onClick={() => setScenariosExpanded(!scenariosExpanded)}
          className="w-full text-left p-2 rounded-lg flex items-center justify-between text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
        >
          <div className="flex items-center">
            <i className="fas fa-play-circle mr-3"></i>
            <span className="font-medium">Scenarios</span>
            <span className="ml-2 text-xs bg-gray-600 px-2 py-1 rounded-full">
              {loadingScenarios ? '...' : scenarios.length}
            </span>
          </div>
          <i className={`fas fa-chevron-${scenariosExpanded ? 'down' : 'right'} text-xs`}></i>
        </button>
        
        {scenariosExpanded && (
          <div className="mt-2 space-y-1">
            {/* Scenario Runner */}
            <button
              onClick={() => onNavigateToScenarioRunner && onNavigateToScenarioRunner()}
              className="w-full text-left p-2 rounded-lg flex items-center text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
            >
              <i className="fas fa-rocket mr-3 text-blue-400"></i>
              <span className="text-sm">Scenario Runner</span>
            </button>

            {/* Add New Scenario */}
            <button
              onClick={() => onNavigateToNewScenario && onNavigateToNewScenario()}
              className="w-full text-left p-2 rounded-lg flex items-center text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
            >
              <i className="fas fa-plus mr-3 text-green-400"></i>
              <span className="text-sm">Add New...</span>
            </button>
            
            {/* Existing Scenarios */}
            {loadingScenarios ? (
              <div className="flex items-center justify-center py-4">
                <i className="fas fa-spinner fa-spin text-gray-400"></i>
              </div>
            ) : (
              scenarios.map((scenario) => (
                <button
                  key={scenario}
                  onClick={() => onNavigateToEditScenario && onNavigateToEditScenario(scenario)}
                  className="w-full text-left p-2 rounded-lg flex items-center text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                >
                  <i className={`${getScenarioIcon(scenario)} mr-3 text-blue-400 text-xs`}></i>
                  <span className="text-sm truncate">{scenario}</span>
                </button>
              ))
            )}
            
            {!loadingScenarios && scenarios.length === 0 && (
              <div className="text-center py-4">
                <i className="fas fa-folder-open text-gray-500 text-lg mb-2"></i>
                <p className="text-gray-500 text-xs">No scenarios found</p>
              </div>
            )}
          </div>
        )}
      </div>

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
