import React, { useState, useEffect } from 'react';
import ReportViewer from './ReportViewer';

const ScenarioRunnerPage = () => {
  const [scenarios, setScenarios] = useState([]);
  const [selectedScenarios, setSelectedScenarios] = useState([]);
  const [executionHistory, setExecutionHistory] = useState([]);
  const [currentExecution, setCurrentExecution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [scenariosRes, historyRes] = await Promise.all([
          fetch('/api/scenarios'),
          fetch('/api/scenarios/history')
        ]);
        
        if (scenariosRes.ok) {
          const data = await scenariosRes.json();
          setScenarios(data);
        } else {
          throw new Error('Failed to fetch scenarios');
        }
        
        if (historyRes.ok) {
          const data = await historyRes.json();
          setExecutionHistory(data);
        } else {
          console.warn('Failed to fetch execution history');
        }
      } catch (err) {
        console.error("Failed to fetch initial data:", err);
        setError(err.message || 'Failed to load scenario data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSelectScenario = (scenarioName) => {
    setSelectedScenarios(prev => 
      prev.includes(scenarioName)
        ? prev.filter(name => name !== scenarioName)
        : [...prev, scenarioName]
    );
  };

  const handleRunSelected = async () => {
    if (selectedScenarios.length === 0) return;
    
    try {
      setIsRunning(true);
      setError(null);
      
      const response = await fetch('/api/scenarios/run-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarios: selectedScenarios })
      });
      
      if (!response.ok) {
        throw new Error('Failed to start scenario execution');
      }
      
      const data = await response.json();
      pollForExecutionResult(data.executionId);
    } catch (err) {
      console.error("Failed to run scenarios:", err);
      setError(err.message || 'Failed to start scenario execution');
      setIsRunning(false);
    }
  };

  const pollForExecutionResult = async (executionId) => {
    let pollCount = 0;
    const maxPolls = 150; // 5 minutes max polling
    
    const interval = setInterval(async () => {
      try {
        pollCount++;
        if (pollCount > maxPolls) {
          clearInterval(interval);
          setIsRunning(false);
          setError('Execution timed out. Check the execution history for details.');
          return;
        }
        
        const res = await fetch(`/api/scenarios/history/${executionId}`);
        if (res.ok) {
          const execution = await res.json();
          setCurrentExecution(execution);
          
          if (execution.status === 'completed' || execution.status === 'failed') {
            clearInterval(interval);
            setIsRunning(false);
            
            // Refresh history
            try {
              const historyRes = await fetch('/api/scenarios/history');
              if (historyRes.ok) {
                setExecutionHistory(await historyRes.json());
              }
            } catch (historyErr) {
              console.warn('Failed to refresh execution history:', historyErr);
            }
          }
        } else {
          console.warn('Failed to poll execution status');
        }
      } catch (pollErr) {
        console.error('Error polling execution result:', pollErr);
      }
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">
          <i className="fas fa-rocket text-primary mr-3"></i>
          Scenario Runner
        </h1>
        <button
          onClick={() => window.location.hash = '#dashboard'}
          className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
        >
          <i className="fas fa-arrow-left mr-2"></i>
          Back to Dashboard
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel: Scenario Selection */}
        <div className="lg:col-span-1 artifact-card bg-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <i className="fas fa-list-ul text-blue-400 mr-2"></i>
            Available Scenarios
          </h2>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <i className="fas fa-spinner fa-spin text-2xl text-blue-400 mb-2"></i>
                <p className="text-gray-400">Loading scenarios...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-exclamation-triangle text-red-400 text-xl"></i>
              </div>
              <p className="text-red-400 mb-2">Failed to Load Scenarios</p>
              <p className="text-gray-500 text-sm">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-3 text-blue-400 hover:text-blue-300 text-sm"
              >
                <i className="fas fa-refresh mr-1"></i>
                Retry
              </button>
            </div>
          ) : scenarios.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-play-circle text-gray-500 text-xl"></i>
              </div>
              <p className="text-gray-400 mb-2">No Scenarios Available</p>
              <p className="text-gray-500 text-sm">Create scenarios in your project's scenarios/ directory</p>
            </div>
          ) : (
            <div className="space-y-2">
              {scenarios.map(scenario => (
                <div key={scenario} className="flex items-center bg-gray-700 p-3 rounded-lg hover:bg-gray-600 transition-colors">
                  <input
                    type="checkbox"
                    id={`scenario-${scenario}`}
                    checked={selectedScenarios.includes(scenario)}
                    onChange={() => handleSelectScenario(scenario)}
                    disabled={isRunning}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50"
                  />
                  <label htmlFor={`scenario-${scenario}`} className="ml-3 block text-sm font-medium text-gray-300 cursor-pointer flex-1">
                    {scenario}
                  </label>
                </div>
              ))}
            </div>
          )}
          <button
            onClick={handleRunSelected}
            disabled={selectedScenarios.length === 0 || isRunning || loading}
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
          >
            {isRunning ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Running...
              </>
            ) : (
              <>
                <i className="fas fa-play mr-2"></i>
                Run Selected ({selectedScenarios.length})
              </>
            )}
          </button>
        </div>

        {/* Right Panel: Execution Results */}
        <div className="lg:col-span-2 artifact-card bg-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <i className="fas fa-chart-line text-green-400 mr-2"></i>
            Execution Results
          </h2>
          {currentExecution ? (
            <ReportViewer report={currentExecution} />
          ) : isRunning ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-rocket text-blue-400 text-xl animate-pulse"></i>
              </div>
              <p className="text-blue-400 font-medium mb-2">Execution in Progress</p>
              <p className="text-gray-400">Running {selectedScenarios.length} scenario(s)...</p>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-chart-line text-gray-500 text-xl"></i>
              </div>
              <p className="text-gray-400 mb-2">Ready to Run Scenarios</p>
              <p className="text-gray-500">Select scenarios and click "Run Selected" to see the results.</p>
            </div>
          )}
        </div>
      </div>

      {/* Historical Runs */}
      <div className="artifact-card bg-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <i className="fas fa-history text-indigo-400 mr-2"></i>
          Execution History
        </h2>
        {executionHistory.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-history text-gray-500 text-xl"></i>
            </div>
            <p className="text-gray-400 mb-2">No Execution History</p>
            <p className="text-gray-500 text-sm">Run scenarios to see execution history here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {executionHistory.map(exec => (
              <div key={exec.id} className="flex justify-between items-center bg-gray-700 p-4 rounded-lg hover:bg-gray-600 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white truncate">{exec.id}</p>
                  <p className="text-sm text-gray-400">{new Date(exec.timestamp).toLocaleString()}</p>
                  {exec.duration && (
                    <p className="text-xs text-gray-500">Duration: {Math.round(exec.duration / 1000)}s</p>
                  )}
                </div>
                <div className="text-right mx-4">
                  <p className={`font-bold ${exec.status === 'completed' ? 'text-green-400' : exec.status === 'failed' ? 'text-red-400' : 'text-yellow-400'}`}>
                    {exec.status.toUpperCase()}
                  </p>
                  <p className="text-sm text-gray-400">
                    {exec.summary.passed}/{exec.summary.total} passed
                  </p>
                </div>
                <button
                  onClick={() => setCurrentExecution(exec)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-lg flex items-center transition-colors flex-shrink-0"
                >
                  <i className="fas fa-eye mr-1"></i>
                  View
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScenarioRunnerPage;
