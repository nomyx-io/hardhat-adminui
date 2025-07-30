import React, { useState, useEffect } from 'react';
import { useScenarios } from '../../contexts/ScenarioContext';

const ScenarioExplorer = () => {
  const [scenarios, setScenarios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { selectedScenario, setSelectedScenario } = useScenarios();

  useEffect(() => {
    loadScenarios();
  }, []);

  // Listen for scenarios tab state changes to refresh
  useEffect(() => {
    const handleFocus = () => {
      loadScenarios();
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const loadScenarios = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/scenarios');
      if (!response.ok) {
        throw new Error('Failed to load scenarios');
      }
      const data = await response.json();
      setScenarios(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error loading scenarios:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredScenarios = scenarios.filter(scenario =>
    scenario.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleScenarioSelect = (scenario) => {
    setSelectedScenario(scenario);
  };

  const getScenarioIcon = (scenarioName) => {
    if (scenarioName.toLowerCase().includes('security')) return 'fas fa-shield-alt';
    if (scenarioName.toLowerCase().includes('performance')) return 'fas fa-tachometer-alt';
    if (scenarioName.toLowerCase().includes('integration')) return 'fas fa-link';
    if (scenarioName.toLowerCase().includes('stress')) return 'fas fa-weight-hanging';
    return 'fas fa-play';
  };

  const getScenarioCategory = (scenarioName) => {
    if (scenarioName.toLowerCase().includes('security')) return { label: 'Security', color: 'red' };
    if (scenarioName.toLowerCase().includes('performance')) return { label: 'Performance', color: 'yellow' };
    if (scenarioName.toLowerCase().includes('integration')) return { label: 'Integration', color: 'blue' };
    if (scenarioName.toLowerCase().includes('stress')) return { label: 'Stress', color: 'purple' };
    return { label: 'Test', color: 'green' };
  };

  return (
    <div className="artifact-card bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 shadow-lg">
      <h3 className="text-xl font-bold mb-6 flex items-center text-white">
        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-3">
          <i className="fas fa-list text-white"></i>
        </div>
        Scenario Explorer
      </h3>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search scenarios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-900/50 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
        </div>
      </div>

      {/* Refresh button */}
      <div className="mb-4">
        <button
          onClick={loadScenarios}
          disabled={isLoading}
          className="w-full px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
        >
          <i className={`fas fa-sync-alt ${isLoading ? 'fa-spin' : ''}`}></i>
          {isLoading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-700 rounded-lg animate-pulse"></div>
          ))}
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="p-4 bg-red-900/30 border border-red-700 rounded-lg text-center">
          <i className="fas fa-exclamation-triangle text-red-400 text-lg mb-2"></i>
          <p className="text-red-300 text-sm">{error}</p>
          <button
            onClick={loadScenarios}
            className="mt-2 px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-xs transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* No scenarios */}
      {!isLoading && !error && scenarios.length === 0 && (
        <div className="text-center py-8">
          <i className="fas fa-folder-open text-gray-500 text-3xl mb-3"></i>
          <p className="text-gray-400 text-sm">No scenarios found</p>
          <p className="text-gray-500 text-xs mt-1">
            Create scenario files in the /scenarios directory
          </p>
        </div>
      )}

      {/* No filtered results */}
      {!isLoading && !error && scenarios.length > 0 && filteredScenarios.length === 0 && (
        <div className="text-center py-8">
          <i className="fas fa-search text-gray-500 text-3xl mb-3"></i>
          <p className="text-gray-400 text-sm">No scenarios match your search</p>
          <button
            onClick={() => setSearchTerm('')}
            className="mt-2 text-blue-400 hover:text-blue-300 text-xs"
          >
            Clear search
          </button>
        </div>
      )}

      {/* Scenarios list */}
      {!isLoading && !error && filteredScenarios.length > 0 && (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredScenarios.map((scenario) => {
            const category = getScenarioCategory(scenario);
            const isSelected = selectedScenario === scenario;
            
            return (
              <div
                key={scenario}
                onClick={() => handleScenarioSelect(scenario)}
                className={`p-3 rounded-lg border cursor-pointer transition-all hover:scale-[1.02] ${
                  isSelected
                    ? 'bg-blue-600/20 border-blue-500 shadow-lg'
                    : 'bg-gray-900/50 border-gray-700 hover:bg-gray-900/70 hover:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center flex-1 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${
                      isSelected ? 'bg-blue-500' : 'bg-gray-700'
                    }`}>
                      <i className={`${getScenarioIcon(scenario)} text-white text-sm`}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium text-sm truncate ${
                        isSelected ? 'text-blue-300' : 'text-white'
                      }`}>
                        {scenario}
                      </p>
                      <div className="flex items-center mt-1">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                          category.color === 'red' ? 'bg-red-600/20 text-red-300' :
                          category.color === 'yellow' ? 'bg-yellow-600/20 text-yellow-300' :
                          category.color === 'blue' ? 'bg-blue-600/20 text-blue-300' :
                          category.color === 'purple' ? 'bg-purple-600/20 text-purple-300' :
                          'bg-green-600/20 text-green-300'
                        }`}>
                          {category.label}
                        </span>
                      </div>
                    </div>
                  </div>
                  {isSelected && (
                    <i className="fas fa-check text-blue-400 ml-2"></i>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer info */}
      {!isLoading && !error && scenarios.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>{filteredScenarios.length} scenario{filteredScenarios.length !== 1 ? 's' : ''}</span>
            {selectedScenario && (
              <span className="text-blue-400">Selected: {selectedScenario}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ScenarioExplorer;
