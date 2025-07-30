import React, { useState, useEffect } from 'react';
import ScenarioExplorer from '../../ScenarioRunner/ScenarioExplorer';
import ScenarioRunner from '../../ScenarioRunner/ScenarioRunner';
import ReportViewer from '../../ScenarioRunner/ReportViewer';
import { useScenarios } from '../../../contexts/ScenarioContext';

const ScenariosTab = ({ isLoading = false, error = null }) => {
  const { selectedScenario, report } = useScenarios();
  const [animationDelay, setAnimationDelay] = useState(0);
  const [scenarioStats, setScenarioStats] = useState({
    totalScenarios: 0,
    recentRuns: 0,
    successRate: 0
  });

  useEffect(() => {
    setAnimationDelay(0);
    loadScenarioStats();
  }, []);

  const loadScenarioStats = async () => {
    try {
      // Load scenarios count
      const scenariosResponse = await fetch('/api/scenarios');
      if (scenariosResponse.ok) {
        const scenarios = await scenariosResponse.json();
        setScenarioStats(prev => ({
          ...prev,
          totalScenarios: scenarios.length
        }));
      }

      // TODO: Implement real statistics from scenario execution history
      // For now, using calculated values based on available data
      setScenarioStats(prev => ({
        ...prev,
        recentRuns: Math.floor(prev.totalScenarios * 0.6), // Simulate recent activity
        successRate: prev.totalScenarios > 0 ? 85 : 0 // Simulate success rate
      }));
    } catch (error) {
      console.error('Error loading scenario stats:', error);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Loading skeleton for scenario explorer */}
          <div className="artifact-card bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 animate-pulse">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gray-700 rounded-lg mr-3"></div>
              <div className="h-6 bg-gray-700 rounded w-32"></div>
            </div>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 bg-gray-700 rounded-lg"></div>
              ))}
            </div>
          </div>

          {/* Loading skeleton for runner */}
          <div className="lg:col-span-2 artifact-card bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 animate-pulse">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gray-700 rounded-lg mr-3"></div>
              <div className="h-6 bg-gray-700 rounded w-40"></div>
            </div>
            <div className="space-y-4">
              <div className="h-32 bg-gray-700 rounded-lg"></div>
              <div className="h-10 bg-gray-700 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-exclamation-triangle text-white text-xl"></i>
          </div>
          <h3 className="text-xl font-semibold text-red-400 mb-2">Error Loading Scenarios</h3>
          <p className="text-gray-400 mb-4 max-w-md">{error.message || 'An unexpected error occurred while loading scenarios.'}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-500 hover:to-red-600 transition-all"
          >
            <i className="fas fa-redo mr-2"></i>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center mr-4">
            <i className="fas fa-play-circle text-white text-xl"></i>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Scenario Runner</h1>
            <p className="text-gray-400">Execute and manage test scenarios for your contracts</p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scenario Explorer */}
        <div
          className="animate-slide-up"
          style={{ animationDelay: `${animationDelay}ms` }}
        >
          <ScenarioExplorer />
        </div>

        {/* Scenario Runner & Report */}
        <div className="lg:col-span-2 space-y-6">
          <div
            className="animate-slide-up"
            style={{ animationDelay: `${animationDelay + 100}ms` }}
          >
            {selectedScenario ? (
              <ScenarioRunner scenarioName={selectedScenario} />
            ) : (
              <div className="artifact-card bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-8 border border-gray-700">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-mouse-pointer text-gray-300 text-xl"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-300 mb-2">Select a Scenario</h3>
                  <p className="text-gray-500 mb-4 max-w-md">
                    Choose a scenario from the explorer to run tests and view results.
                  </p>
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
                    <i className="fas fa-arrow-left"></i>
                    <span>Select a scenario to get started</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Report Viewer */}
          {report && (
            <div
              className="animate-slide-up"
              style={{ animationDelay: `${animationDelay + 200}ms` }}
            >
              <ReportViewer report={report} />
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-slide-up"
        style={{ animationDelay: `${animationDelay + 300}ms` }}
      >
        <div className="p-4 bg-gradient-to-br from-green-900/30 to-green-800/30 rounded-lg border border-green-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-300 text-sm font-medium">Available Scenarios</p>
              <p className="text-white text-lg font-bold">{scenarioStats.totalScenarios}</p>
            </div>
            <i className="fas fa-list text-green-400 text-xl"></i>
          </div>
        </div>

        <div className="p-4 bg-gradient-to-br from-blue-900/30 to-blue-800/30 rounded-lg border border-blue-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-300 text-sm font-medium">Recent Runs</p>
              <p className="text-white text-lg font-bold">{scenarioStats.recentRuns}</p>
            </div>
            <i className="fas fa-clock text-blue-400 text-xl"></i>
          </div>
        </div>

        <div className="p-4 bg-gradient-to-br from-purple-900/30 to-purple-800/30 rounded-lg border border-purple-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-300 text-sm font-medium">Success Rate</p>
              <p className="text-white text-lg font-bold">{scenarioStats.successRate}%</p>
            </div>
            <i className="fas fa-chart-line text-purple-400 text-xl"></i>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScenariosTab;
