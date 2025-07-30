import React, { useState, useEffect } from 'react';
import CodeBlock from '../common/CodeBlock';

const EventsTab = ({ deployment }) => {
  const { abi, network = 'localhost' } = deployment;
  const [eventLogs, setEventLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState('logs'); // 'logs' or 'definitions'
  
  // Extract events from ABI
  const events = abi.filter(item => item.type === 'event');

  useEffect(() => {
    const fetchEventLogs = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/contracts/${network}/${deployment.contractName}/events?limit=50`);
        if (!response.ok) {
          throw new Error('Failed to fetch event logs');
        }
        const data = await response.json();
        setEventLogs(data.events || []);
      } catch (err) {
        console.error('Error fetching event logs:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (deployment?.contractName) {
      fetchEventLogs();
    }
  }, [deployment?.contractName, network]);

  const renderEventInputs = (inputs) => {
    if (!inputs || inputs.length === 0) {
      return <span className="text-gray-500 italic">No parameters</span>;
    }

    return (
      <div className="space-y-2">
        {inputs.map((input, index) => (
          <div key={index} className="flex items-center space-x-4 text-sm">
            <span className="text-yellow-400 font-mono min-w-0 flex-1">{input.name || `param${index}`}</span>
            <span className="text-blue-400 font-mono">{input.type}</span>
            {input.indexed && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                indexed
              </span>
            )}
          </div>
        ))}
      </div>
    );
  };

  const getEventSignature = (event) => {
    const inputs = event.inputs || [];
    const params = inputs.map(input => `${input.type} ${input.indexed ? 'indexed ' : ''}${input.name || ''}`).join(', ');
    return `${event.name}(${params})`;
  };

  if (events.length === 0) {
    return (
      <div className="glass-card p-6">
        <h3 className="text-xl font-bold mb-6 flex items-center">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 flex items-center justify-center mr-3">
            <i className="fas fa-bolt text-white text-sm"></i>
          </div>
          <span className="gradient-text">Contract Events</span>
        </h3>
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-bolt text-slate-500 text-xl"></i>
          </div>
          <p className="text-slate-400 text-lg">No events defined</p>
          <p className="text-slate-500 text-sm mt-2">
            This contract doesn't emit any events
          </p>
        </div>
      </div>
    );
  }

  const renderEventLog = (eventLog, index) => {
    return (
      <div key={eventLog.id || index} className="bg-slate-800/50 rounded-lg p-6 border border-slate-600/30 hover:border-slate-500/50 transition-colors">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 rounded bg-green-500/20 flex items-center justify-center">
              <i className="fas fa-bolt text-green-400 text-xs"></i>
            </div>
            <h4 className="text-lg font-semibold text-green-400 font-mono">{eventLog.eventName}</h4>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
              Block #{eventLog.blockNumber}
            </span>
          </div>
          <div className="text-right text-sm text-gray-400">
            {eventLog.blockTimestamp && (
              <div>{new Date(eventLog.blockTimestamp).toLocaleString()}</div>
            )}
            <div className="font-mono text-xs">{eventLog.transactionHash?.slice(0, 10)}...</div>
          </div>
        </div>

        {eventLog.args && Object.keys(eventLog.args).length > 0 && (
          <div className="mb-4">
            <h5 className="text-sm font-medium text-gray-400 mb-3">Event Data</h5>
            <div className="bg-slate-900/50 rounded-lg p-4">
              <div className="space-y-2">
                {Object.entries(eventLog.args).map(([key, value]) => (
                  <div key={key} className="flex items-center space-x-4 text-sm">
                    <span className="text-yellow-400 font-mono min-w-0 flex-1">{key}</span>
                    <span className="text-blue-400 font-mono break-all">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {eventLog.parseError && (
          <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
            <div className="flex items-center text-red-400 text-sm">
              <i className="fas fa-exclamation-triangle mr-2"></i>
              <span>Parse Error: {eventLog.parseError}</span>
            </div>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-slate-600/30">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Transaction:</span>
              <div className="font-mono text-xs text-blue-400 break-all">{eventLog.transactionHash}</div>
            </div>
            <div>
              <span className="text-gray-400">Log Index:</span>
              <div className="font-mono text-xs text-purple-400">{eventLog.logIndex}</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold flex items-center">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 flex items-center justify-center mr-3">
              <i className="fas fa-bolt text-white text-sm"></i>
            </div>
            <span className="gradient-text">Contract Events</span>
          </h3>
          
          <div className="flex bg-slate-800/50 rounded-lg p-1">
            <button
              onClick={() => setActiveView('logs')}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                activeView === 'logs'
                  ? 'bg-amber-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Event Logs ({eventLogs.length})
            </button>
            <button
              onClick={() => setActiveView('definitions')}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                activeView === 'definitions'
                  ? 'bg-amber-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Definitions ({events.length})
            </button>
          </div>
        </div>

        {/* Event Logs View */}
        {activeView === 'logs' && (
          <div>
            {loading && (
              <div className="text-center py-12">
                <i className="fas fa-spinner fa-spin text-3xl text-amber-400 mb-4"></i>
                <p className="text-gray-400">Loading event logs...</p>
              </div>
            )}

            {error && (
              <div className="text-center py-12">
                <i className="fas fa-exclamation-triangle text-3xl text-red-500 mb-4"></i>
                <p className="text-red-400">Error loading event logs: {error}</p>
              </div>
            )}

            {!loading && !error && eventLogs.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-bolt text-slate-500 text-xl"></i>
                </div>
                <p className="text-slate-400 text-lg">No events emitted</p>
                <p className="text-slate-500 text-sm mt-2">
                  This contract hasn't emitted any events yet
                </p>
              </div>
            )}

            {!loading && !error && eventLogs.length > 0 && (
              <div className="space-y-4">
                {eventLogs.map((eventLog, index) => renderEventLog(eventLog, index))}
              </div>
            )}
          </div>
        )}

        {/* Event Definitions View */}
        {activeView === 'definitions' && (
          <div>
            {events.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-bolt text-slate-500 text-xl"></i>
                </div>
                <p className="text-slate-400 text-lg">No events defined</p>
                <p className="text-slate-500 text-sm mt-2">
                  This contract doesn't define any events
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {events.map((event, index) => (
                  <div key={index} className="bg-slate-800/50 rounded-lg p-6 border border-slate-600/30 hover:border-slate-500/50 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 rounded bg-amber-500/20 flex items-center justify-center">
                          <i className="fas fa-bolt text-amber-400 text-xs"></i>
                        </div>
                        <h4 className="text-lg font-semibold text-amber-400 font-mono">{event.name}</h4>
                        {!event.anonymous && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                            logged
                          </span>
                        )}
                        {event.anonymous && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gray-500/20 text-gray-400 border border-gray-500/30">
                            anonymous
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mb-4">
                      <h5 className="text-sm font-medium text-gray-400 mb-2">Event Signature</h5>
                      <CodeBlock code={getEventSignature(event)} language="solidity" />
                    </div>

                    <div className="mb-4">
                      <h5 className="text-sm font-medium text-gray-400 mb-3">Parameters</h5>
                      <div className="bg-slate-900/50 rounded-lg p-4">
                        {renderEventInputs(event.inputs)}
                      </div>
                    </div>

                    {event.inputs && event.inputs.some(input => input.indexed) && (
                      <div className="mb-4">
                        <div className="flex items-center space-x-2 text-sm text-purple-400">
                          <i className="fas fa-info-circle"></i>
                          <span>Indexed parameters can be used as filters when querying logs</span>
                        </div>
                      </div>
                    )}

                    <div className="mt-4 pt-4 border-t border-slate-600/30">
                      <h5 className="text-sm font-medium text-gray-400 mb-2">Raw ABI</h5>
                      <CodeBlock code={JSON.stringify(event, null, 2)} language="json" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="glass-card p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-green-500 to-teal-600 flex items-center justify-center mr-3">
            <i className="fas fa-list text-white text-sm"></i>
          </div>
          <span className="gradient-text">Event Summary</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600/30">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Event Definitions</span>
              <span className="text-2xl font-bold text-amber-400">{events.length}</span>
            </div>
          </div>
          
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600/30">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Events Emitted</span>
              <span className="text-2xl font-bold text-green-400">{eventLogs.length}</span>
            </div>
          </div>
          
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600/30">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Indexed Parameters</span>
              <span className="text-2xl font-bold text-purple-400">
                {events.reduce((acc, event) => acc + (event.inputs?.filter(input => input.indexed).length || 0), 0)}
              </span>
            </div>
          </div>
          
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600/30">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Anonymous Events</span>
              <span className="text-2xl font-bold text-gray-400">
                {events.filter(event => event.anonymous).length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

};

export default EventsTab;