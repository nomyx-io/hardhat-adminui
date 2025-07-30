import React, { useState } from 'react';
import CopyButton from '../ExplorerView/common/CopyButton';

const ReportViewer = ({ report }) => {
  const [activeTab, setActiveTab] = useState('summary');

  if (!report) {
    return null;
  }

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString();
  };


  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'success':
      case 'passed':
      case 'completed':
        return 'text-green-400';
      case 'failed':
      case 'error':
        return 'text-red-400';
      case 'running':
      case 'pending':
        return 'text-blue-400';
      case 'warning':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'success':
      case 'passed':
      case 'completed':
        return 'fas fa-check-circle';
      case 'failed':
      case 'error':
        return 'fas fa-times-circle';
      case 'running':
      case 'pending':
        return 'fas fa-clock';
      case 'warning':
        return 'fas fa-exclamation-triangle';
      default:
        return 'fas fa-info-circle';
    }
  };

  const tabs = [
    { id: 'summary', label: 'Summary', icon: 'fas fa-chart-pie' },
    { id: 'details', label: 'Details', icon: 'fas fa-list-ul' },
    { id: 'raw', label: 'Raw Data', icon: 'fas fa-code' }
  ];

  return (
    <div className="artifact-card bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold flex items-center text-white">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center mr-3">
            <i className="fas fa-chart-bar text-white"></i>
          </div>
          Test Report
        </h3>
        
        {/* Export button */}
        <button
          onClick={() => {
            const dataStr = JSON.stringify(report, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `scenario-report-${Date.now()}.json`;
            link.click();
            URL.revokeObjectURL(url);
          }}
          className="px-3 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg font-medium transition-all flex items-center gap-2"
        >
          <i className="fas fa-download"></i>
          Export
        </button>
      </div>

      {/* Tab navigation */}
      <div className="flex space-x-1 mb-6 p-1 bg-gray-900/50 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-3 py-2 rounded-md font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
          >
            <i className={tab.icon}></i>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="space-y-4">
        {activeTab === 'summary' && (
          <div className="space-y-4">
            {/* Overall status */}
            <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <i className={`${getStatusIcon(report.status)} ${getStatusColor(report.status)} text-xl`}></i>
                  <div>
                    <p className="text-white font-semibold">
                      {report.status || 'Unknown Status'}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {report.message || 'No additional information'}
                    </p>
                  </div>
                </div>
                {report.timestamp && (
                  <div className="text-right">
                    <p className="text-gray-400 text-xs">Completed</p>
                    <p className="text-gray-300 text-sm">{formatTimestamp(report.timestamp)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {report.duration !== undefined && (
                <div className="p-4 bg-gradient-to-br from-blue-900/30 to-blue-800/30 rounded-lg border border-blue-700/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-300 text-sm font-medium">Duration</p>
                      <p className="text-white text-lg font-bold">
                        {typeof report.duration === 'number' ? `${report.duration.toFixed(2)}s` : report.duration}
                      </p>
                    </div>
                    <i className="fas fa-clock text-blue-400 text-xl"></i>
                  </div>
                </div>
              )}

              {report.testsCount !== undefined && (
                <div className="p-4 bg-gradient-to-br from-green-900/30 to-green-800/30 rounded-lg border border-green-700/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-300 text-sm font-medium">Tests Run</p>
                      <p className="text-white text-lg font-bold">{report.testsCount}</p>
                    </div>
                    <i className="fas fa-vial text-green-400 text-xl"></i>
                  </div>
                </div>
              )}

              {report.gasUsed !== undefined && (
                <div className="p-4 bg-gradient-to-br from-purple-900/30 to-purple-800/30 rounded-lg border border-purple-700/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-300 text-sm font-medium">Gas Used</p>
                      <p className="text-white text-lg font-bold">
                        {typeof report.gasUsed === 'number' ? report.gasUsed.toLocaleString() : report.gasUsed}
                      </p>
                    </div>
                    <i className="fas fa-gas-pump text-purple-400 text-xl"></i>
                  </div>
                </div>
              )}
            </div>

            {/* Error information */}
            {report.error && (
              <div className="p-4 bg-red-900/30 border border-red-700 rounded-lg">
                <div className="flex items-start gap-3">
                  <i className="fas fa-exclamation-triangle text-red-400 text-lg mt-1"></i>
                  <div className="flex-1">
                    <p className="text-red-300 font-medium mb-2">Error Details</p>
                    <p className="text-red-200 text-sm font-mono bg-red-900/50 p-3 rounded border border-red-800">
                      {report.error}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'details' && (
          <div className="space-y-4">
            {/* Test results */}
            {report.tests && Array.isArray(report.tests) && (
              <div>
                <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <i className="fas fa-list-check"></i>
                  Test Results
                </h4>
                <div className="space-y-2">
                  {report.tests.map((test, index) => (
                    <div
                      key={index}
                      className="p-3 bg-gray-900/50 rounded-lg border border-gray-700"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <i className={`${getStatusIcon(test.status)} ${getStatusColor(test.status)}`}></i>
                          <div>
                            <p className="text-white font-medium">{test.name || `Test ${index + 1}`}</p>
                            {test.description && (
                              <p className="text-gray-400 text-sm">{test.description}</p>
                            )}
                          </div>
                        </div>
                        {test.duration && (
                          <span className="text-gray-400 text-sm">{test.duration}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional data */}
            {Object.entries(report).filter(([key]) => 
              !['status', 'message', 'timestamp', 'duration', 'testsCount', 'gasUsed', 'error', 'tests'].includes(key)
            ).map(([key, value]) => (
              <div key={key} className="p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                <p className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-1">{key}</p>
                <p className="text-gray-300 text-sm break-all">
                  {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                </p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'raw' && (
          <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <p className="text-gray-400 text-sm font-medium">Raw JSON Data</p>
              <CopyButton text={JSON.stringify(report, null, 2)} size="small" variant="ghost" />
            </div>
            <pre className="text-gray-300 text-xs overflow-x-auto whitespace-pre-wrap bg-gray-900 p-3 rounded border border-gray-800 max-h-96 overflow-y-auto">
              {JSON.stringify(report, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportViewer;
