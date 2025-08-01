import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar/Sidebar';
import ContractHeader from './Header/ContractHeader';
import TabNavigation from './Tabs/TabNavigation';
import TabContent from './Tabs/TabContent';
import DiamondView from './DiamondView';
import DashboardView from './DashboardView';
import ScenariosTab from './TabPanels/ScenariosTab';
import NewScenarioEditor from '../ScenarioRunner/NewScenarioEditor';
import ScenarioEditor from '../ScenarioRunner/ScenarioEditor';
import ScenarioRunnerPage from '../ScenarioRunner/ScenarioRunnerPage';
import TransactionDetailModal from '../Modal/TransactionDetailModal';
import './ExplorerView.css';

// Helper function to detect Diamond contracts consistently
const isDiamondContract = (deployment) => {
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

const ExplorerView = ({ initialDeployments, onNavigateToScenarioRunner }) => {
  const [allDeployments, setAllDeployments] = useState(initialDeployments || []);
  const [filteredDeployments, setFilteredDeployments] = useState(initialDeployments || []);
  const [selectedDeployment, setSelectedDeployment] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [version, setVersion] = useState(null);
  const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem('favorites')) || []);
  const [networks, setNetworks] = useState([]);
  const [currentNetwork, setCurrentNetwork] = useState('localhost');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // View state
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'contract', 'contracts', 'transactions', 'events', 'scenarios', 'new-scenario', 'edit-scenario', 'scenario-runner'
  
  // Transaction modal state
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [selectedTransactionHash, setSelectedTransactionHash] = useState(null);
  
  // Diamond-specific state
  const [selectedFacet, setSelectedFacet] = useState(null);
  const [isDiamondView, setIsDiamondView] = useState(false);
  
  // Scenario editor state
  const [selectedScenarioName, setSelectedScenarioName] = useState(null);

  useEffect(() => {
    if (initialDeployments && initialDeployments.length > 0) {
      setAllDeployments(initialDeployments);
      setFilteredDeployments(initialDeployments);
      // Don't auto-select deployment anymore - start with dashboard
    }
  }, [initialDeployments]);

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      setError(null);
      try {
        const projectInfoRes = await fetch('/api/project-info');
        const projectInfo = await projectInfoRes.json();
        setNetworks(projectInfo.networks);
        setVersion(projectInfo.hardhatVersion);

        const deploymentsRes = await fetch(`/api/deployments/${currentNetwork}`);
        const deploymentsData = await deploymentsRes.json();
        setAllDeployments(deploymentsData);
        // Stay on dashboard view when deployments change
      } catch (e) {
        console.error('Failed to fetch initial data:', e);
        setError('Failed to connect to the server. Is Hardhat running?');
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [currentNetwork]);

  useEffect(() => {
    const newFiltered = allDeployments.filter(d =>
      d.contractName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredDeployments(newFiltered);
  }, [searchTerm, allDeployments]);

  const handleToggleFavorite = (contractName) => {
    const newFavorites = favorites.includes(contractName)
      ? favorites.filter(fav => fav !== contractName)
      : [...favorites, contractName];
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
  };

  const handleSelectDeployment = (deployment) => {
    setSelectedDeployment(deployment);
    setSelectedFacet(null);
    setCurrentView('contract');
    
    // Check if this is a Diamond contract
    const isDiamond = isDiamondContract(deployment);
    setIsDiamondView(isDiamond);
    
    // Set appropriate initial tab
    setActiveTab(isDiamond ? 'diamond-overview' : 'overview');
  };

  const handleSelectFacet = (facetDeployment) => {
    if (facetDeployment && facetDeployment.selectedFacet) {
      // Keep the original diamond deployment but set the view state
      setCurrentView('contract');
      setSelectedDeployment(facetDeployment);
      setSelectedFacet(facetDeployment.selectedFacet);
      setIsDiamondView(true);
      // Set active tab to the specific facet
      setActiveTab(`facet-${facetDeployment.selectedFacet.address}`);
    } else {
      setSelectedFacet(null);
    }
  };

  // Transaction modal handlers
  const openTransactionModal = (transactionHash) => {
    setSelectedTransactionHash(transactionHash);
    setShowTransactionModal(true);
  };

  const closeTransactionModal = () => {
    setShowTransactionModal(false);
    setSelectedTransactionHash(null);
  };

  // Dashboard navigation handlers
  const handleNavigateToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedDeployment(null);
    setSelectedFacet(null);
    setIsDiamondView(false);
  };

  const handleNavigateToContracts = () => {
    setCurrentView('contracts');
    setSelectedDeployment(null);
    setSelectedFacet(null);
    setIsDiamondView(false);
  };

  const handleNavigateToTransactions = () => {
    setCurrentView('transactions');
    setSelectedDeployment(null);
    setSelectedFacet(null);
    setIsDiamondView(false);
  };

  const handleNavigateToEvents = () => {
    setCurrentView('events');
    setSelectedDeployment(null);
    setSelectedFacet(null);
    setIsDiamondView(false);
  };

  const handleNavigateToScenarios = () => {
    setCurrentView('scenarios');
    setSelectedDeployment(null);
    setSelectedFacet(null);
    setIsDiamondView(false);
  };

  const handleNavigateToScenarioRunner = () => {
    setCurrentView('scenario-runner');
    setSelectedDeployment(null);
    setSelectedFacet(null);
    setIsDiamondView(false);
  };

  // Scenario editor navigation handlers
  const handleNavigateToNewScenario = () => {
    setCurrentView('new-scenario');
    setSelectedDeployment(null);
    setSelectedFacet(null);
    setIsDiamondView(false);
    setSelectedScenarioName(null);
  };

  const handleNavigateToEditScenario = (scenarioName) => {
    setCurrentView('edit-scenario');
    setSelectedDeployment(null);
    setSelectedFacet(null);
    setIsDiamondView(false);
    setSelectedScenarioName(scenarioName);
  };

  const handleScenarioSaved = (scenarioName) => {
    // After saving, navigate back to scenarios view
    setCurrentView('scenarios');
    setSelectedScenarioName(null);
  };

  const handleScenarioCancel = () => {
    // Cancel editing, go back to dashboard
    setCurrentView('dashboard');
    setSelectedScenarioName(null);
  };

  const renderMainContent = () => {
    if (loading) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <i className="fas fa-spinner fa-spin text-3xl text-primary mb-4"></i>
            <p className="text-gray-400">Loading...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <i className="fas fa-exclamation-triangle text-3xl text-red-500 mb-4"></i>
            <p className="text-red-400">{error}</p>
          </div>
        </div>
      );
    }

    switch (currentView) {
      case 'dashboard':
        return (
          <div className="flex-1 overflow-auto p-4">
            <DashboardView
              deployments={allDeployments}
              network={currentNetwork}
              onNavigateToContracts={handleNavigateToContracts}
              onNavigateToTransactions={handleNavigateToTransactions}
              onNavigateToEvents={handleNavigateToEvents}
              onNavigateToScenarios={handleNavigateToScenarios}
              onNavigateToScenarioRunner={handleNavigateToScenarioRunner}
              onSelectDeployment={handleSelectDeployment}
            />
          </div>
        );

      case 'contract':
        if (!selectedDeployment) {
          return (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-400">No contract selected.</p>
            </div>
          );
        }
        return (
          <>
            <ContractHeader deployment={selectedDeployment} />
            {isDiamondView ? (
              <div className="flex-1 overflow-auto p-4">
                <DiamondView
                  deployment={selectedDeployment}
                  selectedFacet={selectedFacet}
                  onSelectFacet={handleSelectFacet}
                  network={currentNetwork}
                  activeTab={activeTab}
                  onTabClick={setActiveTab}
                  onTransactionClick={openTransactionModal}
                />
              </div>
            ) : (
              <>
                <TabNavigation activeTab={activeTab} onTabClick={setActiveTab} deployment={selectedDeployment} />
                <div className="flex-1 overflow-auto p-4">
                  <TabContent
                    activeTab={activeTab}
                    deployment={selectedDeployment}
                    onTransactionClick={openTransactionModal}
                  />
                </div>
              </>
            )}
          </>
        );

      case 'contracts':
        return (
          <div className="flex-1 overflow-auto p-4">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white">
                  <i className="fas fa-file-contract text-primary mr-3"></i>
                  All Contracts
                </h1>
                <button
                  onClick={handleNavigateToDashboard}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
                >
                  <i className="fas fa-arrow-left mr-2"></i>
                  Back to Dashboard
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allDeployments.map((deployment) => {
                  const isDiamond = isDiamondContract(deployment);
                  return (
                    <div
                      key={deployment.address}
                      className="artifact-card bg-gray-800 rounded-xl p-6 cursor-pointer hover:bg-gray-700 transition-colors"
                      onClick={() => handleSelectDeployment(deployment)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-blue-300 flex items-center">
                          <i className={`${isDiamond ? 'fas fa-gem text-yellow-500' : 'fas fa-file-contract text-blue-400'} mr-2`}></i>
                          {deployment.contractName}
                          {isDiamond && (
                            <span className="ml-2 text-xs bg-yellow-600 px-2 py-1 rounded">DIAMOND</span>
                          )}
                        </h4>
                        <i className="fas fa-arrow-right text-gray-500"></i>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Address:</span>
                          <span className="font-mono text-purple-300">
                            {deployment.address.slice(0, 10)}...
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Functions:</span>
                          <span className="text-green-300">{deployment.abi.filter(item => item.type === 'function').length}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case 'transactions':
        return (
          <div className="flex-1 overflow-auto p-4">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white">
                  <i className="fas fa-exchange-alt text-primary mr-3"></i>
                  All Transactions
                </h1>
                <button
                  onClick={handleNavigateToDashboard}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
                >
                  <i className="fas fa-arrow-left mr-2"></i>
                  Back to Dashboard
                </button>
              </div>
              
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className="fas fa-exchange-alt text-white text-2xl"></i>
                </div>
                <h3 className="text-2xl font-semibold text-white mb-4">Transaction History</h3>
                <p className="text-gray-400 text-lg mb-4">View transactions from individual contract pages</p>
                <p className="text-gray-500 max-w-md mx-auto">
                  Transaction details are available when viewing specific contracts. Select a contract from the sidebar to see its transaction history.
                </p>
                <div className="mt-8">
                  <button
                    onClick={handleNavigateToContracts}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center mx-auto transition-colors"
                  >
                    <i className="fas fa-file-contract mr-2"></i>
                    View Contracts
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'events':
        return (
          <div className="flex-1 overflow-auto p-4">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white">
                  <i className="fas fa-bell text-primary mr-3"></i>
                  All Events
                </h1>
                <button
                  onClick={handleNavigateToDashboard}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
                >
                  <i className="fas fa-arrow-left mr-2"></i>
                  Back to Dashboard
                </button>
              </div>
              
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className="fas fa-bell text-white text-2xl"></i>
                </div>
                <h3 className="text-2xl font-semibold text-white mb-4">Event Logs</h3>
                <p className="text-gray-400 text-lg mb-4">Monitor events from individual contracts</p>
                <p className="text-gray-500 max-w-md mx-auto">
                  Event monitoring and filtering are available when viewing specific contracts. Select a contract to monitor its events in real-time.
                </p>
                <div className="mt-8">
                  <button
                    onClick={handleNavigateToContracts}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center mx-auto transition-colors"
                  >
                    <i className="fas fa-file-contract mr-2"></i>
                    View Contracts
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'scenarios':
        return (
          <div className="flex-1 overflow-auto p-4">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white">
                  <i className="fas fa-play-circle text-primary mr-3"></i>
                  Scenarios
                </h1>
                <div>
                  <button
                    onClick={handleNavigateToScenarioRunner}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors mr-2"
                  >
                    <i className="fas fa-rocket mr-2"></i>
                    Go to Scenario Runner
                  </button>
                  <button
                    onClick={handleNavigateToDashboard}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
                  >
                    <i className="fas fa-arrow-left mr-2"></i>
                    Back to Dashboard
                  </button>
                </div>
              </div>
              
              <ScenariosTab />
            </div>
          </div>
        );

      case 'new-scenario':
        return (
          <div className="flex-1 overflow-auto p-4">
            <NewScenarioEditor
              onSave={handleScenarioSaved}
              onCancel={handleScenarioCancel}
            />
          </div>
        );

      case 'edit-scenario':
        return (
          <div className="flex-1 overflow-auto p-4">
            <ScenarioEditor
              scenarioName={selectedScenarioName}
              onSave={handleScenarioSaved}
              onCancel={handleScenarioCancel}
            />
          </div>
        );

      case 'scenario-runner':
        return (
          <div className="flex-1 overflow-auto p-4">
            <ScenarioRunnerPage />
          </div>
        );

      default:
        return (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-400">Unknown view: {currentView}</p>
          </div>
        );
    }
  };

  return (
    <div className="bg-gray-900 text-gray-100 min-h-screen flex flex-col md:flex-row">
      <Sidebar
        deployments={filteredDeployments}
        selectedDeployment={selectedDeployment}
        onSelectDeployment={handleSelectDeployment}
        title="Hardhat Explorer"
        version={version}
        favorites={favorites}
        onToggleFavorite={handleToggleFavorite}
        onSearch={setSearchTerm}
        onNetworkChange={setCurrentNetwork}
        networks={networks}
        currentNetwork={currentNetwork}
        onSelectFacet={handleSelectFacet}
        selectedFacet={selectedFacet}
        currentView={currentView}
        onNavigateToDashboard={handleNavigateToDashboard}
        onNavigateToNewScenario={handleNavigateToNewScenario}
        onNavigateToEditScenario={handleNavigateToEditScenario}
        onNavigateToScenarioRunner={handleNavigateToScenarioRunner}
      />
      <div className="flex-1 flex flex-col">
        {renderMainContent()}
      </div>
      
      {/* Transaction Detail Modal */}
      <TransactionDetailModal
        isOpen={showTransactionModal}
        onClose={closeTransactionModal}
        transactionHash={selectedTransactionHash}
        network={currentNetwork}
      />
    </div>
  );
};

export default ExplorerView;
