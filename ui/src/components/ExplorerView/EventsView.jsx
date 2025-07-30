import React, { useState, useEffect } from 'react';

const EventsView = ({ deployments, network, onNavigateToDashboard, onSelectDeployment }) => {
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedContract, setSelectedContract] = useState('all');

  useEffect(() => {
    const fetchAllEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch events from all contracts
        const eventPromises = deployments.map(async (deployment) => {
          try {
            const response = await fetch(`/api/contracts/${network}/${deployment.contractName}/events?limit=20`);
            if (!response.ok) {
              throw new Error(`Failed to fetch events for ${deployment.contractName}`);
            }
            const data = await response.json();
            return {
              contractName: deployment.contractName,
              contractAddress: deployment.address,
              events: data.events || []
            };
          } catch (error) {
            console.warn(`Error fetching events for ${deployment.contractName}:`, error);
            return {
              contractName: deployment.contractName,
              contractAddress: deployment.address,
              events: []
            };
          }
        });

        const contractEvents = await Promise.all(eventPromises);
        
        // Flatten and sort all events by timestamp
        const flatEvents = contractEvents
          .flatMap(contract => 
            contract.events.map(event => ({
              ...event,
              contractName: contract.contractName,
              contractAddress: contract.contractAddress
            }))
          )
          .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

        setAllEvents(flatEvents);
      } catch (err) {
        console.error('Error fetching all events:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (deployments && deployments.length > 0) {
      fetchAllEvents();
    }
  }, [deployments, network]);

  const filteredEvents = selectedContract === 'all' 
    ? allEvents 
    : allEvents.filter(event => event.contractName === selectedContract);

  const contractsWithEvents = deployments.filter(deployment => 
    allEvents.some(event => event.contractName === deployment.contractName)
  );

  const renderEventLog = (event, index) => {
    return (
      <div key={event.id || index} className="artifact-card bg-gray-800 rounded-xl p-6 hover:bg-gray-750 transition-colors">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 rounded bg-green-500/20 flex items-center justify-center">
              <i className="fas fa-bolt text-green-400 text-xs"></i>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-green-400 font-mono">{event.eventName}</h4>
              <p className="text-sm text-gray-400">
                from <span 
                  className="text-blue-300 cursor-pointer hover:text-blue-200"
                  onClick={() => {
                    const deployment = deployments.find(d => d.contractName === event.contractName);
                    if (deployment) onSelectDeployment(deployment);
                  }}
                >
                  {event.contractName}
                </span>
              </p>
            </div>
          </div>
          <div className="text-right text-sm text-gray-400">
            {event.blockTimestamp && (
              <div>{new Date(event.blockTimestamp).toLocaleString()}</div>
            )}
            <div className="font-mono text-xs">Block #{event.blockNumber}</div>
          </div>
        </div>

        {event.args && Object.keys(event.args).length > 0 && (
          <div className="mb-4">
            <h5 className="text-sm font-medium text-gray-400 mb-3">Event Data</h5>
            <div className="bg-gray-900/50 rounded-lg p-4">
              <div className="space-y-2">
                {Object.entries(event.args).map(([key, value]) => (
                  <div key={key} className="flex items-center space-x-4 text-sm">
                    <span className="text-yellow-400 font-mono min-w-0 flex-1">{key}</span>
                    <span className="text-blue-400 font-mono break-all">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Transaction:</span>
              <div className="font-mono text-xs text-blue-400 break-all">{event.transactionHash}</div>
            </div>
            <div>
              <span className="text-gray-400">Contract:</span>
              <div className="font-mono text-xs text-purple-400 break-all">{event.contractAddress?.slice(0, 20)}...</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-auto p-4">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">
            <i className="fas fa-bell text-primary mr-3"></i>
            All Events ({filteredEvents.length})
          </h1>
          <button
            onClick={onNavigateToDashboard}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Back to Dashboard
          </button>
        </div>

        {/* Filter Controls */}
        <div className="artifact-card bg-gray-800 rounded-xl p-4">
          <div className="flex items-center space-x-4">
            <label className="text-gray-400">Filter by contract:</label>
            <select
              value={selectedContract}
              onChange={(e) => setSelectedContract(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
            >
              <option value="all">All Contracts ({allEvents.length} events)</option>
              {contractsWithEvents.map(deployment => {
                const eventCount = allEvents.filter(e => e.contractName === deployment.contractName).length;
                return (
                  <option key={deployment.contractName} value={deployment.contractName}>
                    {deployment.contractName} ({eventCount} events)
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Events Content */}
        {loading && (
          <div className="text-center py-16">
            <i className="fas fa-spinner fa-spin text-3xl text-primary mb-4"></i>
            <p className="text-gray-400">Loading event logs...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-16">
            <i className="fas fa-exclamation-triangle text-3xl text-red-500 mb-4"></i>
            <p className="text-red-400">Error loading event logs: {error}</p>
          </div>
        )}

        {!loading && !error && filteredEvents.length === 0 && (
          <div className="text-center py-16">
            <i className="fas fa-bell text-6xl text-gray-600 mb-4"></i>
            <h3 className="text-xl text-gray-400 mb-2">No Events Found</h3>
            <p className="text-gray-500">
              {selectedContract === 'all' 
                ? 'No events have been emitted by any contracts yet.'
                : `No events have been emitted by ${selectedContract} yet.`
              }
            </p>
          </div>
        )}

        {!loading && !error && filteredEvents.length > 0 && (
          <div className="space-y-4">
            {filteredEvents.map((event, index) => renderEventLog(event, index))}
          </div>
        )}

        {/* Summary */}
        {!loading && !error && (
          <div className="artifact-card bg-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <i className="fas fa-chart-bar text-primary mr-2"></i>
              Event Summary
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-900/50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Total Events</span>
                  <span className="text-2xl font-bold text-green-400">{allEvents.length}</span>
                </div>
              </div>
              
              <div className="bg-gray-900/50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Active Contracts</span>
                  <span className="text-2xl font-bold text-blue-400">{contractsWithEvents.length}</span>
                </div>
              </div>
              
              <div className="bg-gray-900/50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Event Types</span>
                  <span className="text-2xl font-bold text-purple-400">
                    {new Set(allEvents.map(e => e.eventName)).size}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsView;