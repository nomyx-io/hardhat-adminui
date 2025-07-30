import React, { useState, useEffect } from 'react';
import TabNavigation from './Tabs/TabNavigation';
import TabContent from './Tabs/TabContent';
import CopyButton from './common/CopyButton';

const DiamondView = ({ deployment, selectedFacet, onSelectFacet, network, activeTab, onTabClick, onTransactionClick }) => {
  const [facets, setFacets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [facetActiveTab, setFacetActiveTab] = useState('overview'); // Separate tab state for facets
  const [contractActiveTab, setContractActiveTab] = useState('overview'); // Separate tab state for contract view

  // Helper function to create mock deployment for facets
  const createFacetDeployment = (facet) => {
    return {
      ...deployment,
      contractName: facet.name,
      address: facet.address,
      abi: facet.abi || [],
      functions: facet.functions || []
    };
  };

  // Get current facet from active tab
  const getCurrentFacet = () => {
    if (activeTab?.startsWith('facet-')) {
      const facetAddress = activeTab.replace('facet-', '');
      return facets.find(f => f.address === facetAddress);
    }
    return null;
  };

  useEffect(() => {
    const fetchFacets = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/diamonds/${network}/${deployment.address}/facets`);
        if (!response.ok) {
          throw new Error('Failed to fetch facets');
        }
        const data = await response.json();
        setFacets(data.facets || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (deployment?.address) {
      fetchFacets();
    }
  }, [deployment?.address, network]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-3xl text-primary mb-4"></i>
          <p className="text-gray-400">Loading Diamond facets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <i className="fas fa-exclamation-triangle text-3xl text-red-500 mb-4"></i>
          <p className="text-red-400">Error loading facets: {error}</p>
        </div>
      </div>
    );
  }

  const currentFacet = getCurrentFacet();

  function renderTabContent() {
    if (activeTab === 'diamond-overview') {
      return renderDiamondOverview();
    } else if (activeTab === 'diamond-contract') {
      return renderDiamondAsContract();
    } else if (activeTab === 'diamond-methods') {
      return renderDiamondMethods();
    } else if (currentFacet) {
      // Render standard contract view for selected facet with proper tab navigation
      const facetDeployment = createFacetDeployment(currentFacet);
      return (
        <div className="space-y-4">
          {/* Facet-specific tab navigation */}
          <div className="border-b border-gray-700">
            <div className="flex px-4">
              {['overview', 'abi', 'methods', 'storage', 'transactions', 'events'].map(tabId => (
                <button
                  key={tabId}
                  className={`tab-button px-4 py-3 font-medium capitalize ${
                    facetActiveTab === tabId
                      ? 'border-b-2 border-primary text-primary highlight-text'
                      : 'text-gray-400 hover:text-blue-300'
                  }`}
                  onClick={() => setFacetActiveTab(tabId)}
                >
                  {tabId}
                </button>
              ))}
            </div>
          </div>
          
          {/* Facet content */}
          <TabContent
            activeTab={facetActiveTab}
            deployment={facetDeployment}
            onTransactionClick={onTransactionClick}
          />
        </div>
      );
    }
    return null;
  }

  function renderDiamondOverview() {
    return (
      <div className="space-y-6">
        {/* Diamond Info Card */}
        <div className="artifact-card bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 shadow-lg">
          <h3 className="text-xl font-bold mb-6 flex items-center text-white">
            <i className="fas fa-gem text-purple-400 mr-3 text-lg"></i>
            Diamond Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <p className="text-gray-400 text-sm font-medium uppercase tracking-wide">Diamond Address</p>
              <div className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                <code className="font-mono text-purple-300 text-sm flex-1 break-all">{deployment.address}</code>
                <CopyButton text={deployment.address} />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-gray-400 text-sm font-medium uppercase tracking-wide">Network</p>
              <div className="flex items-center gap-2 p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                <i className="fas fa-network-wired text-green-400"></i>
                <span className="text-green-300 capitalize font-medium">{network}</span>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-gray-400 text-sm font-medium uppercase tracking-wide">Total Facets</p>
              <div className="flex items-center gap-2 p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                <i className="fas fa-cubes text-yellow-400"></i>
                <span className="text-yellow-300 font-bold text-lg">{facets.length}</span>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-gray-400 text-sm font-medium uppercase tracking-wide">Total Functions</p>
              <div className="flex items-center gap-2 p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                <i className="fas fa-code text-blue-400"></i>
                <span className="text-blue-300 font-bold text-lg">
                  {facets.reduce((sum, facet) => sum + (facet.selectorCount || 0), 0)}
                </span>
              </div>
            </div>
          </div>
          
          {/* Additional Diamond Stats */}
          <div className="mt-6 pt-6 border-t border-gray-700">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-400">
                  {deployment.receipt?.gasUsed ? Number(deployment.receipt.gasUsed).toLocaleString() : 'N/A'}
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Gas Used</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-400">
                  {deployment.receipt?.blockNumber ? Number(deployment.receipt.blockNumber).toLocaleString() : 'N/A'}
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Block</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-400">
                  {deployment.receipt?.confirmations || 0}
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Confirmations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-400">
                  {deployment.abi ? deployment.abi.length : 0}
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">ABI Items</div>
              </div>
            </div>
          </div>
        </div>

        {/* Facets Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white flex items-center">
              <i className="fas fa-cubes text-pink-400 mr-3"></i>
              Diamond Facets ({facets.length})
            </h3>
            <div className="text-sm text-gray-400">
              Click any facet to explore its interface
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {facets.map((facet, index) => (
              <div
                key={facet.address}
                className="group artifact-card bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 cursor-pointer
                         border border-gray-700 hover:border-pink-500/50 transition-all duration-300
                         hover:shadow-lg hover:shadow-pink-500/10 hover:scale-[1.02]"
                onClick={() => onTabClick(`facet-${facet.address}`)}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg
                                  flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                      <i className="fas fa-cube text-white text-sm"></i>
                    </div>
                    <div>
                      <h4 className="font-bold text-pink-300 group-hover:text-pink-200 transition-colors">
                        {facet.name}
                      </h4>
                      <div className="text-xs text-gray-500">
                        Facet #{index + 1}
                      </div>
                    </div>
                  </div>
                  <i className="fas fa-arrow-right text-gray-500 group-hover:text-pink-400 group-hover:translate-x-1 transition-all"></i>
                </div>
                
                {/* Address with Copy */}
                <div className="space-y-3 mb-4">
                  <div>
                    <span className="text-gray-400 text-xs font-medium uppercase tracking-wide block mb-1">Address</span>
                    <div className="flex items-center gap-2 p-2 bg-gray-900/50 rounded-lg border border-gray-700">
                      <code className="font-mono text-purple-300 text-xs flex-1 break-all">
                        {facet.address}
                      </code>
                      <CopyButton text={facet.address} size="small" />
                    </div>
                  </div>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-2 bg-gray-900/30 rounded-lg">
                      <div className="text-lg font-bold text-green-400">{facet.selectorCount || 0}</div>
                      <div className="text-xs text-gray-500">Functions</div>
                    </div>
                    <div className="text-center p-2 bg-gray-900/30 rounded-lg">
                      <div className="text-lg font-bold text-blue-400">
                        {facet.functions ? facet.functions.filter(f => f.stateMutability === 'view' || f.stateMutability === 'pure').length : 0}
                      </div>
                      <div className="text-xs text-gray-500">Read-Only</div>
                    </div>
                  </div>
                </div>

                {/* Function Preview */}
                {facet.functions && facet.functions.length > 0 && (
                  <div className="border-t border-gray-700 pt-3">
                    <p className="text-xs text-gray-400 mb-2 font-medium">Recent Functions:</p>
                    <div className="space-y-1">
                      {facet.functions.slice(0, 3).map((func, funcIndex) => (
                        <div key={funcIndex} className="flex items-center justify-between text-xs">
                          <code className="font-mono text-blue-300 truncate mr-2">
                            {func.name}()
                          </code>
                          <span className={`px-1.5 py-0.5 rounded text-xs ${
                            func.stateMutability === 'view' || func.stateMutability === 'pure'
                              ? 'bg-blue-900/50 text-blue-300'
                              : 'bg-orange-900/50 text-orange-300'
                          }`}>
                            {func.stateMutability || 'nonpayable'}
                          </span>
                        </div>
                      ))}
                      {facet.functions.length > 3 && (
                        <div className="text-xs text-gray-500 italic text-center pt-1">
                          +{facet.functions.length - 3} more functions...
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Empty State */}
                {(!facet.functions || facet.functions.length === 0) && (
                  <div className="border-t border-gray-700 pt-3 text-center">
                    <i className="fas fa-info-circle text-gray-500 mb-1"></i>
                    <p className="text-xs text-gray-500">No functions available</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function renderDiamondMethods() {
    // Aggregate all methods from all facets
    const allMethods = facets.reduce((acc, facet) => {
      if (facet.functions && facet.functions.length > 0) {
        const facetMethods = facet.functions.map(func => ({
          ...func,
          facetName: facet.name,
          facetAddress: facet.address
        }));
        return [...acc, ...facetMethods];
      }
      return acc;
    }, []);

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold flex items-center">
            <i className="fas fa-code text-green-400 mr-2"></i>
            All Diamond Methods ({allMethods.length})
          </h3>
        </div>

        {allMethods.length > 0 ? (
          <div className="space-y-4">
            {allMethods.map((method, index) => (
              <div key={index} className="artifact-card bg-gray-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-mono text-blue-300 font-bold">{method.name}</h4>
                  <div className="flex items-center text-sm">
                    <span className="text-gray-400 mr-2">from</span>
                    <span
                      className="text-pink-300 cursor-pointer hover:text-pink-200"
                      onClick={() => onTabClick(`facet-${method.facetAddress}`)}
                    >
                      {method.facetName}
                    </span>
                  </div>
                </div>
                
                <div className="text-sm">
                  <div className="flex items-center mb-2">
                    <span className="text-gray-400 mr-2">Type:</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      method.stateMutability === 'view' || method.stateMutability === 'pure'
                        ? 'bg-blue-900 text-blue-300'
                        : 'bg-orange-900 text-orange-300'
                    }`}>
                      {method.stateMutability || 'nonpayable'}
                    </span>
                  </div>
                  
                  {method.inputs && method.inputs.length > 0 && (
                    <div className="mb-2">
                      <span className="text-gray-400 mr-2">Inputs:</span>
                      <div className="font-mono text-xs text-green-300">
                        {method.inputs.map(input => `${input.type} ${input.name}`).join(', ')}
                      </div>
                    </div>
                  )}
                  
                  {method.outputs && method.outputs.length > 0 && (
                    <div>
                      <span className="text-gray-400 mr-2">Outputs:</span>
                      <div className="font-mono text-xs text-purple-300">
                        {method.outputs.map(output => `${output.type} ${output.name || ''}`).join(', ')}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <i className="fas fa-code text-6xl text-gray-600 mb-4"></i>
            <h3 className="text-xl text-gray-400 mb-2">No Methods Found</h3>
            <p className="text-gray-500">No methods found in any facets.</p>
          </div>
        )}
      </div>
    );
  }

  function renderDiamondAsContract() {
    return (
      <div className="space-y-4">
        {/* Contract-specific tab navigation */}
        <div className="border-b border-gray-700">
          <div className="flex px-4">
            {['overview', 'abi', 'bytecode', 'methods', 'storage', 'transactions', 'events'].map(tabId => (
              <button
                key={tabId}
                className={`tab-button px-4 py-3 font-medium capitalize ${
                  contractActiveTab === tabId
                    ? 'border-b-2 border-primary text-primary highlight-text'
                    : 'text-gray-400 hover:text-blue-300'
                }`}
                onClick={() => setContractActiveTab(tabId)}
              >
                {tabId}
              </button>
            ))}
          </div>
        </div>
        
        {/* Contract content */}
        <TabContent
          activeTab={contractActiveTab}
          deployment={deployment}
          onTransactionClick={onTransactionClick}
        />
      </div>
    );
  }

  // Render tab navigation and content
  return (
    <>
      <TabNavigation
        activeTab={activeTab}
        onTabClick={onTabClick}
        deployment={deployment}
        isDiamondView={true}
        facets={facets}
      />
      {renderTabContent()}
    </>
  );
};

export default DiamondView;