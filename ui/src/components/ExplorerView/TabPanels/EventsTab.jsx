import React, { useState, useEffect } from 'react';
import CodeBlock from '../common/CodeBlock';
import CopyButton from '../common/CopyButton';

const EventsTab = ({ deployment }) => {
  const { abi, network = 'localhost' } = deployment;
  const [eventLogs, setEventLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState('logs'); // 'logs' or 'definitions'
  const [searchFilter, setSearchFilter] = useState('');
  
  // Extract events from ABI
  const events = abi?.filter(item => item.type === 'event') || [];

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

  // Filter events based on search
  const filteredEventLogs = eventLogs.filter(eventLog =>
    !searchFilter || eventLog.eventName?.toLowerCase().includes(searchFilter.toLowerCase()) ||
    eventLog.transactionHash?.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const filteredEvents = events.filter(event =>
    !searchFilter || event.name?.toLowerCase().includes(searchFilter.toLowerCase())
  );

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

  if (!deployment?.abi) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-file-contract text-gray-300 text-xl"></i>
          </div>
          <h3 className="text-xl font-semibold text-gray-300 mb-2">No ABI Available</h3>
          <p className="text-gray-500 mb-4 max-w-md">
            Contract ABI is required to view event information.
          </p>
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="artifact-card bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-8 border border-gray-700">
        <h3 className="text-xl font-bold mb-6 flex items-center text-white">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center mr-3">
            <i className="fas fa-bolt text-white"></i>
          </div>
          Contract Events
        </h3>
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <i className="fas fa-bolt text-gray-400 text-2xl"></i>
          </div>
          <h4 className="text-gray-300 text-lg font-semibold mb-2">No Events Defined</h4>
          <p className="text-gray-500 text-sm max-w-md mx-auto leading-relaxed mb-6">
            This contract doesn't define any events. Events are useful for logging important contract state changes.
          </p>
          <div className="flex justify-center">
            <div className="px-4 py-2 bg-gray-700/50 rounded-lg border border-gray-600">
              <p className="text-xs text-gray-400">
                <i className="fas fa-info-circle mr-1"></i>
                Consider adding events to track contract interactions
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderEventLog = (eventLog, index) => {
    const formatValue = (value) => {
      if (typeof value === 'string' && value.length > 42) {
        return `${value.slice(0, 10)}...${value.slice(-8)}`;
      }
      return String(value);
    };

    const isAddress = (value) => {
      return typeof value === 'string' && value.match(/^0x[a-fA-F0-9]{40}$/);
    };

    const isHash = (value) => {
      return typeof value === 'string' && value.match(/^0x[a-fA-F0-9]{64}$/);
    };

    return (
      <div key={eventLog.id || index} className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-all duration-200 shadow-lg">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <i className="fas fa-bolt text-white text-sm"></i>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-green-300 font-mono">{eventLog.eventName}</h4>
              <div className="flex items-center space-x-2 mt-1">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 border border-blue-500/30">
                  <i className="fas fa-cube mr-1"></i>
                  Block #{eventLog.blockNumber}
                </span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30">
                  <i className="fas fa-hashtag mr-1"></i>
                  Log #{eventLog.logIndex}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right text-sm">
            {eventLog.blockTimestamp && (
              <div className="text-gray-300 font-medium mb-1">
                {new Date(eventLog.blockTimestamp * 1000).toLocaleString()}
              </div>
            )}
            <div className="flex items-center space-x-2">
              <code className="text-xs text-blue-300">
                {eventLog.transactionHash?.slice(0, 10)}...
              </code>
              {eventLog.transactionHash && (
                <CopyButton text={eventLog.transactionHash} size="small" variant="ghost" />
              )}
            </div>
          </div>
        </div>

        {eventLog.args && Object.keys(eventLog.args).length > 0 && (
          <div className="mb-6">
            <h5 className="text-sm font-medium text-gray-400 mb-3 flex items-center">
              <i className="fas fa-database mr-2"></i>
              Event Data
            </h5>
            <div className="bg-gray-900/60 rounded-lg p-4 border border-gray-700">
              <div className="space-y-3">
                {Object.entries(eventLog.args).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-2 bg-gray-800/50 rounded border border-gray-700">
                    <div className="flex items-center space-x-3">
                      <span className="text-yellow-300 font-mono text-sm font-medium">{key}</span>
                      <span className="text-gray-500">:</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <code className="text-blue-300 text-sm break-all max-w-xs">
                        {formatValue(value)}
                      </code>
                      {(isAddress(value) || isHash(value)) && (
                        <CopyButton text={String(value)} size="small" variant="ghost" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {eventLog.parseError && (
          <div className="mb-4 p-4 bg-gradient-to-r from-red-900/30 to-red-800/30 border border-red-500/50 rounded-lg">
            <div className="flex items-center text-red-300">
              <i className="fas fa-exclamation-triangle mr-3 text-lg"></i>
              <div>
                <p className="font-medium">Parse Error</p>
                <p className="text-sm text-red-400 mt-1">{eventLog.parseError}</p>
              </div>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-gray-900/50 rounded border border-gray-700">
              <p className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-1">Transaction Hash</p>
              <div className="flex items-center space-x-2">
                <code className="text-blue-300 text-sm break-all flex-1">{eventLog.transactionHash}</code>
                {eventLog.transactionHash && (
                  <CopyButton text={eventLog.transactionHash} size="small" variant="ghost" />
                )}
              </div>
            </div>
            <div className="p-3 bg-gray-900/50 rounded border border-gray-700">
              <p className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-1">Gas Used</p>
              <div className="flex items-center space-x-2">
                <span className="text-orange-300 text-sm font-bold">
                  {eventLog.gasUsed ? parseInt(eventLog.gasUsed).toLocaleString() : 'N/A'}
                </span>
                <i className="fas fa-gas-pump text-orange-400"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Main Events Card */}
      <div className="artifact-card bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold flex items-center text-white">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center mr-3">
              <i className="fas fa-bolt text-white"></i>
            </div>
            Contract Events
          </h3>
          
          <div className="flex items-center space-x-3">
            {/* Search Filter */}
            <div className="relative">
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"></i>
              <input
                type="text"
                placeholder="Search events..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
            
            {/* Tab Navigation */}
            <div className="flex bg-gray-900/60 rounded-lg p-1 border border-gray-700">
              <button
                onClick={() => setActiveView('logs')}
                className={`px-4 py-2 rounded text-sm font-medium transition-all ${
                  activeView === 'logs'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <i className="fas fa-list mr-2"></i>
                Logs ({filteredEventLogs.length})
              </button>
              <button
                onClick={() => setActiveView('definitions')}
                className={`px-4 py-2 rounded text-sm font-medium transition-all ${
                  activeView === 'definitions'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <i className="fas fa-code mr-2"></i>
                Definitions ({filteredEvents.length})
              </button>
            </div>
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

            {!loading && !error && filteredEventLogs.length > 0 && (
              <div className="space-y-4">
                {filteredEventLogs.map((eventLog, index) => renderEventLog(eventLog, index))}
              </div>
            )}

            {!loading && !error && searchFilter && filteredEventLogs.length === 0 && eventLogs.length > 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-search text-gray-400 text-xl"></i>
                </div>
                <h4 className="text-gray-300 text-lg font-semibold mb-2">No Matching Events</h4>
                <p className="text-gray-500 text-sm">
                  No events found matching "{searchFilter}"
                </p>
                <button
                  onClick={() => setSearchFilter('')}
                  className="mt-3 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-colors text-sm"
                >
                  Clear Search
                </button>
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
                {filteredEvents.map((event, index) => (
                  <div key={index} className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-all duration-200 shadow-lg">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                          <i className="fas fa-bolt text-white text-sm"></i>
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-amber-300 font-mono">{event.name}</h4>
                          <div className="flex items-center space-x-2 mt-1">
                            {!event.anonymous ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 border border-blue-500/30">
                                <i className="fas fa-eye mr-1"></i>
                                Logged
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-gray-500/20 to-gray-600/20 text-gray-400 border border-gray-500/30">
                                <i className="fas fa-eye-slash mr-1"></i>
                                Anonymous
                              </span>
                            )}
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30">
                              <i className="fas fa-hashtag mr-1"></i>
                              {event.inputs?.length || 0} params
                            </span>
                          </div>
                        </div>
                      </div>
                      <CopyButton text={event.name} size="small" variant="ghost" />
                    </div>

                    <div className="mb-6">
                      <h5 className="text-sm font-medium text-gray-400 mb-3 flex items-center">
                        <i className="fas fa-signature mr-2"></i>
                        Event Signature
                      </h5>
                      <div className="relative">
                        <CodeBlock code={getEventSignature(event)} language="solidity" />
                        <div className="absolute top-2 right-2">
                          <CopyButton text={getEventSignature(event)} size="small" variant="ghost" />
                        </div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h5 className="text-sm font-medium text-gray-400 mb-3 flex items-center">
                        <i className="fas fa-list-ul mr-2"></i>
                        Parameters
                      </h5>
                      <div className="bg-gray-900/60 rounded-lg p-4 border border-gray-700">
                        {renderEventInputs(event.inputs)}
                      </div>
                    </div>

                    {event.inputs && event.inputs.some(input => input.indexed) && (
                      <div className="mb-6 p-4 bg-gradient-to-r from-purple-900/30 to-purple-800/30 border border-purple-500/50 rounded-lg">
                        <div className="flex items-center space-x-3 text-purple-300">
                          <i className="fas fa-info-circle text-lg"></i>
                          <div>
                            <p className="font-medium">Indexed Parameters</p>
                            <p className="text-sm text-purple-400 mt-1">
                              Indexed parameters can be used as filters when querying event logs for efficient searching.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="pt-4 border-t border-gray-700">
                      <h5 className="text-sm font-medium text-gray-400 mb-3 flex items-center">
                        <i className="fas fa-code mr-2"></i>
                        Raw ABI
                      </h5>
                      <div className="relative">
                        <CodeBlock code={JSON.stringify(event, null, 2)} language="json" />
                        <div className="absolute top-2 right-2">
                          <CopyButton text={JSON.stringify(event, null, 2)} size="small" variant="ghost" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && !error && searchFilter && filteredEvents.length === 0 && events.length > 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-search text-gray-400 text-xl"></i>
                </div>
                <h4 className="text-gray-300 text-lg font-semibold mb-2">No Matching Event Definitions</h4>
                <p className="text-gray-500 text-sm">
                  No event definitions found matching "{searchFilter}"
                </p>
                <button
                  onClick={() => setSearchFilter('')}
                  className="mt-3 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-colors text-sm"
                >
                  Clear Search
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Event Statistics */}
      <div className="artifact-card bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 shadow-lg">
        <h3 className="text-xl font-bold mb-6 flex items-center text-white">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center mr-3">
            <i className="fas fa-chart-line text-white"></i>
          </div>
          Event Statistics
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-gradient-to-br from-amber-900/30 to-amber-800/30 rounded-lg border border-amber-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-300 text-sm font-medium">Event Definitions</p>
                <p className="text-white text-2xl font-bold">{events.length}</p>
              </div>
              <i className="fas fa-code text-amber-400 text-xl"></i>
            </div>
          </div>
          
          <div className="p-4 bg-gradient-to-br from-green-900/30 to-green-800/30 rounded-lg border border-green-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-300 text-sm font-medium">Events Emitted</p>
                <p className="text-white text-2xl font-bold">{eventLogs.length}</p>
              </div>
              <i className="fas fa-broadcast-tower text-green-400 text-xl"></i>
            </div>
          </div>
          
          <div className="p-4 bg-gradient-to-br from-purple-900/30 to-purple-800/30 rounded-lg border border-purple-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-300 text-sm font-medium">Indexed Parameters</p>
                <p className="text-white text-2xl font-bold">
                  {events.reduce((acc, event) => acc + (event.inputs?.filter(input => input.indexed).length || 0), 0)}
                </p>
              </div>
              <i className="fas fa-search text-purple-400 text-xl"></i>
            </div>
          </div>
          
          <div className="p-4 bg-gradient-to-br from-gray-900/30 to-gray-800/30 rounded-lg border border-gray-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm font-medium">Anonymous Events</p>
                <p className="text-white text-2xl font-bold">
                  {events.filter(event => event.anonymous).length}
                </p>
              </div>
              <i className="fas fa-eye-slash text-gray-400 text-xl"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

};

export default EventsTab;