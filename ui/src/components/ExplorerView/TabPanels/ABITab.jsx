/* eslint-disable no-mixed-operators */
import React, { useState, useMemo } from 'react';
import CodeBlock from '../common/CodeBlock';
import CopyButton from '../common/CopyButton';

const ABITab = ({ abi, isLoading = false, error = null }) => {
  const [activeView, setActiveView] = useState('overview'); // 'overview', 'functions', 'events', 'raw'
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Analyze ABI
  const abiAnalysis = useMemo(() => {
    if (!abi || !Array.isArray(abi)) {
      return {
        functions: [],
        events: [],
        constructor: null,
        fallback: null,
        receive: null,
        errors: [],
        total: 0
      };
    }

    const analysis = {
      functions: abi.filter(item => item.type === 'function'),
      events: abi.filter(item => item.type === 'event'),
      constructor: abi.find(item => item.type === 'constructor'),
      fallback: abi.find(item => item.type === 'fallback'),
      receive: abi.find(item => item.type === 'receive'),
      errors: abi.filter(item => item.type === 'error'),
      total: abi.length
    };

    return analysis;
  }, [abi]);

  const abiString = JSON.stringify(abi, null, 2);

  // Filter functions and events based on search and category
  const filteredItems = useMemo(() => {
    const items = activeView === 'functions' ? abiAnalysis.functions :
                  activeView === 'events' ? abiAnalysis.events : [];
    
    return items.filter(item => {
      const matchesSearch = !searchFilter ||
        item.name?.toLowerCase().includes(searchFilter.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' ||
        (activeView === 'functions' &&
         (selectedCategory === 'view' && (item.stateMutability === 'view' || item.stateMutability === 'pure')) ||
         (selectedCategory === 'write' && (item.stateMutability === 'nonpayable' || item.stateMutability === 'payable')) ||
         (selectedCategory === 'payable' && item.stateMutability === 'payable'));
      
      return matchesSearch && matchesCategory;
    });
  }, [abiAnalysis, activeView, searchFilter, selectedCategory]);

  const getInputsDisplay = (inputs) => {
    if (!inputs || inputs.length === 0) return 'No parameters';
    return inputs.map(input => `${input.type} ${input.name || ''}`).join(', ');
  };

  const getOutputsDisplay = (outputs) => {
    if (!outputs || outputs.length === 0) return 'void';
    return outputs.map(output => `${output.type} ${output.name || ''}`).join(', ');
  };

  const getStateMutabilityColor = (stateMutability) => {
    switch (stateMutability) {
      case 'view': case 'pure': return 'text-blue-300 bg-blue-500/20 border-blue-500/30';
      case 'nonpayable': return 'text-green-300 bg-green-500/20 border-green-500/30';
      case 'payable': return 'text-yellow-300 bg-yellow-500/20 border-yellow-500/30';
      default: return 'text-gray-300 bg-gray-500/20 border-gray-500/30';
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="artifact-card bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700">
        <div className="animate-pulse space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-700 rounded-lg"></div>
            <div className="h-6 bg-gray-700 rounded w-32"></div>
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
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
      <div className="artifact-card bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-exclamation-triangle text-white text-xl"></i>
          </div>
          <h3 className="text-xl font-semibold text-red-400 mb-2">Error Loading ABI</h3>
          <p className="text-gray-400">{error.message || 'Failed to load contract ABI'}</p>
        </div>
      </div>
    );
  }

  // No ABI state
  if (!abi || !Array.isArray(abi) || abi.length === 0) {
    return (
      <div className="artifact-card bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700">
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <i className="fas fa-file-code text-gray-400 text-2xl"></i>
          </div>
          <h4 className="text-gray-300 text-lg font-semibold mb-2">No ABI Available</h4>
          <p className="text-gray-500 text-sm max-w-md mx-auto leading-relaxed">
            The Application Binary Interface (ABI) is not available for this contract.
            The ABI is required to interact with smart contract functions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Main ABI Card */}
      <div className="artifact-card bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold flex items-center text-white">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
              <i className="fas fa-file-code text-white"></i>
            </div>
            Contract ABI
          </h3>
          
          <div className="flex items-center space-x-3">
            {/* Search Filter */}
            {(activeView === 'functions' || activeView === 'events') && (
              <div className="relative">
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"></i>
                <input
                  type="text"
                  placeholder={`Search ${activeView}...`}
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            )}
            
            {/* Category Filter for Functions */}
            {activeView === 'functions' && (
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="all">All Functions</option>
                <option value="view">View/Pure</option>
                <option value="write">Write</option>
                <option value="payable">Payable</option>
              </select>
            )}

            {/* Copy ABI Button */}
            <CopyButton text={abiString} size="default" variant="primary" showLabel={true} />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-gray-900/60 rounded-lg p-1 border border-gray-700 mb-6">
          <button
            onClick={() => setActiveView('overview')}
            className={`px-4 py-2 rounded text-sm font-medium transition-all flex items-center space-x-2 ${
              activeView === 'overview'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <i className="fas fa-chart-pie"></i>
            <span>Overview</span>
          </button>
          <button
            onClick={() => setActiveView('functions')}
            className={`px-4 py-2 rounded text-sm font-medium transition-all flex items-center space-x-2 ${
              activeView === 'functions'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <i className="fas fa-cogs"></i>
            <span>Functions ({abiAnalysis.functions.length})</span>
          </button>
          <button
            onClick={() => setActiveView('events')}
            className={`px-4 py-2 rounded text-sm font-medium transition-all flex items-center space-x-2 ${
              activeView === 'events'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <i className="fas fa-bolt"></i>
            <span>Events ({abiAnalysis.events.length})</span>
          </button>
          <button
            onClick={() => setActiveView('raw')}
            className={`px-4 py-2 rounded text-sm font-medium transition-all flex items-center space-x-2 ${
              activeView === 'raw'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <i className="fas fa-code"></i>
            <span>Raw JSON</span>
          </button>
        </div>

        {/* Overview Tab */}
        {activeView === 'overview' && (
          <div className="space-y-6">
            {/* Statistics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gradient-to-br from-blue-900/30 to-blue-800/30 rounded-lg border border-blue-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-300 text-sm font-medium">Functions</p>
                    <p className="text-white text-2xl font-bold">{abiAnalysis.functions.length}</p>
                  </div>
                  <i className="fas fa-cogs text-blue-400 text-xl"></i>
                </div>
              </div>
              
              <div className="p-4 bg-gradient-to-br from-amber-900/30 to-amber-800/30 rounded-lg border border-amber-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-amber-300 text-sm font-medium">Events</p>
                    <p className="text-white text-2xl font-bold">{abiAnalysis.events.length}</p>
                  </div>
                  <i className="fas fa-bolt text-amber-400 text-xl"></i>
                </div>
              </div>
              
              <div className="p-4 bg-gradient-to-br from-green-900/30 to-green-800/30 rounded-lg border border-green-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-300 text-sm font-medium">View Functions</p>
                    <p className="text-white text-2xl font-bold">
                      {abiAnalysis.functions.filter(f => f.stateMutability === 'view' || f.stateMutability === 'pure').length}
                    </p>
                  </div>
                  <i className="fas fa-eye text-green-400 text-xl"></i>
                </div>
              </div>
              
              <div className="p-4 bg-gradient-to-br from-purple-900/30 to-purple-800/30 rounded-lg border border-purple-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-300 text-sm font-medium">Write Functions</p>
                    <p className="text-white text-2xl font-bold">
                      {abiAnalysis.functions.filter(f => f.stateMutability === 'nonpayable' || f.stateMutability === 'payable').length}
                    </p>
                  </div>
                  <i className="fas fa-edit text-purple-400 text-xl"></i>
                </div>
              </div>
            </div>

            {/* Special Functions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {abiAnalysis.constructor && (
                <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                  <div className="flex items-center space-x-3 mb-2">
                    <i className="fas fa-hammer text-orange-400"></i>
                    <h4 className="font-semibold text-orange-300">Constructor</h4>
                  </div>
                  <p className="text-sm text-gray-400">
                    {abiAnalysis.constructor.inputs?.length || 0} parameters
                  </p>
                </div>
              )}
              
              {abiAnalysis.fallback && (
                <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                  <div className="flex items-center space-x-3 mb-2">
                    <i className="fas fa-parachute-box text-yellow-400"></i>
                    <h4 className="font-semibold text-yellow-300">Fallback</h4>
                  </div>
                  <p className="text-sm text-gray-400">
                    {abiAnalysis.fallback.stateMutability}
                  </p>
                </div>
              )}
              
              {abiAnalysis.receive && (
                <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                  <div className="flex items-center space-x-3 mb-2">
                    <i className="fas fa-inbox text-green-400"></i>
                    <h4 className="font-semibold text-green-300">Receive</h4>
                  </div>
                  <p className="text-sm text-gray-400">
                    Accepts ETH transfers
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Functions Tab */}
        {activeView === 'functions' && (
          <div className="space-y-4">
            {filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-search text-gray-400 text-xl"></i>
                </div>
                <h4 className="text-gray-300 text-lg font-semibold mb-2">
                  {searchFilter ? 'No Matching Functions' : 'No Functions Found'}
                </h4>
                <p className="text-gray-500 text-sm">
                  {searchFilter
                    ? `No functions found matching "${searchFilter}"`
                    : 'This contract has no functions defined'
                  }
                </p>
                {searchFilter && (
                  <button
                    onClick={() => setSearchFilter('')}
                    className="mt-3 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors text-sm"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            ) : (
              filteredItems.map((func, index) => (
                <div key={index} className="p-4 bg-gray-900/50 rounded-lg border border-gray-700 hover:border-gray-600 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <i className="fas fa-cog text-white text-sm"></i>
                      </div>
                      <div>
                        <h4 className="font-mono text-lg font-semibold text-blue-300">{func.name}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${getStateMutabilityColor(func.stateMutability)}`}>
                            {func.stateMutability}
                          </span>
                          {func.stateMutability === 'payable' && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                              <i className="fas fa-coins mr-1"></i>
                              Payable
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <CopyButton text={func.name} size="small" variant="ghost" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400 font-medium mb-1">Inputs:</p>
                      <code className="text-gray-300 bg-gray-800 p-2 rounded block">
                        {getInputsDisplay(func.inputs)}
                      </code>
                    </div>
                    <div>
                      <p className="text-gray-400 font-medium mb-1">Outputs:</p>
                      <code className="text-gray-300 bg-gray-800 p-2 rounded block">
                        {getOutputsDisplay(func.outputs)}
                      </code>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Events Tab */}
        {activeView === 'events' && (
          <div className="space-y-4">
            {filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-bolt text-gray-400 text-xl"></i>
                </div>
                <h4 className="text-gray-300 text-lg font-semibold mb-2">
                  {searchFilter ? 'No Matching Events' : 'No Events Found'}
                </h4>
                <p className="text-gray-500 text-sm">
                  {searchFilter
                    ? `No events found matching "${searchFilter}"`
                    : 'This contract has no events defined'
                  }
                </p>
                {searchFilter && (
                  <button
                    onClick={() => setSearchFilter('')}
                    className="mt-3 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-colors text-sm"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            ) : (
              filteredItems.map((event, index) => (
                <div key={index} className="p-4 bg-gray-900/50 rounded-lg border border-gray-700 hover:border-gray-600 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                        <i className="fas fa-bolt text-white text-sm"></i>
                      </div>
                      <div>
                        <h4 className="font-mono text-lg font-semibold text-amber-300">{event.name}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          {event.anonymous ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gray-500/20 text-gray-400 border border-gray-500/30">
                              <i className="fas fa-eye-slash mr-1"></i>
                              Anonymous
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                              <i className="fas fa-eye mr-1"></i>
                              Logged
                            </span>
                          )}
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                            <i className="fas fa-hashtag mr-1"></i>
                            {event.inputs?.length || 0} params
                          </span>
                        </div>
                      </div>
                    </div>
                    <CopyButton text={event.name} size="small" variant="ghost" />
                  </div>
                  
                  <div className="text-sm">
                    <p className="text-gray-400 font-medium mb-2">Parameters:</p>
                    <div className="bg-gray-800/50 p-3 rounded">
                      {event.inputs && event.inputs.length > 0 ? (
                        <div className="space-y-2">
                          {event.inputs.map((input, idx) => (
                            <div key={idx} className="flex items-center justify-between">
                              <code className="text-yellow-300">{input.name || `param${idx}`}</code>
                              <div className="flex items-center space-x-2">
                                <code className="text-blue-300">{input.type}</code>
                                {input.indexed && (
                                  <span className="inline-flex items-center px-1 py-0.5 rounded text-xs font-semibold bg-purple-500/20 text-purple-400">
                                    indexed
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-500 italic">No parameters</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Raw JSON Tab */}
        {activeView === 'raw' && (
          <div className="relative">
            <CodeBlock code={abiString} language="json" />
            <div className="absolute top-4 right-4">
              <CopyButton text={abiString} size="small" variant="ghost" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ABITab;
