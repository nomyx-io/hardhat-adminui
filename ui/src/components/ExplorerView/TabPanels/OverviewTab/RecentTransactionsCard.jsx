import React, { useState } from 'react';
import CopyButton from '../../common/CopyButton';

const RecentTransactionsCard = ({ recentTransactions = [], onTransactionClick, isLoading = false }) => {
  const [hoveredTx, setHoveredTx] = useState(null);

  const formatAddress = (address) => {
    if (!address) return 'Unknown';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatBlockNumber = (blockNumber) => {
    if (!blockNumber) return '---';
    return typeof blockNumber === 'string' ? blockNumber : blockNumber.toString();
  };

  const getStatusDisplay = (status) => {
    if (status === 1 || status === 'Success') {
      return { text: 'Success', color: 'text-green-400', bgColor: 'bg-green-400' };
    } else if (status === 0 || status === 'Failed') {
      return { text: 'Failed', color: 'text-red-400', bgColor: 'bg-red-400' };
    }
    return { text: status || 'Unknown', color: 'text-gray-400', bgColor: 'bg-gray-400' };
  };

  const getMethodDisplay = (method) => {
    if (!method) return 'Unknown';
    // Common method mappings for better display
    const methodMap = {
      '0x': 'Transfer',
      'transfer': 'Transfer',
      'approve': 'Approve',
      'transferFrom': 'Transfer From',
      'mint': 'Mint',
      'burn': 'Burn',
    };
    return methodMap[method] || method;
  };

  if (isLoading) {
    return (
      <div className="artifact-card bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 md:col-span-2">
        <h3 className="text-xl font-bold mb-6 flex items-center text-white">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mr-3">
            <i className="fas fa-exchange-alt text-white"></i>
          </div>
          Recent Transactions
        </h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-12 bg-gray-700 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="artifact-card bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 shadow-lg md:col-span-2">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold flex items-center text-white">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mr-3">
            <i className="fas fa-exchange-alt text-white"></i>
          </div>
          Recent Transactions
        </h3>
        {recentTransactions.length > 0 && (
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>{recentTransactions.length} transaction{recentTransactions.length !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        {recentTransactions && recentTransactions.length > 0 ? (
          <div className="space-y-3">
            {recentTransactions.map((tx, index) => {
              const status = getStatusDisplay(tx.status);
              return (
                <div
                  key={index}
                  className="p-4 bg-gray-900/50 rounded-lg border border-gray-700 hover:border-gray-600 transition-all duration-200 group"
                  onMouseEnter={() => setHoveredTx(index)}
                  onMouseLeave={() => setHoveredTx(null)}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-center">
                    {/* Transaction Hash */}
                    <div className="lg:col-span-2">
                      <p className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-1">Transaction Hash</p>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                        <code
                          className="text-blue-300 text-sm cursor-pointer hover:text-blue-200 transition-colors truncate flex-1"
                          onClick={() => onTransactionClick && onTransactionClick(tx.hash)}
                          title={`View details for ${tx.hash}`}
                        >
                          {tx.hash ? formatAddress(tx.hash) : 'Unknown'}
                        </code>
                        {tx.hash && (
                          <CopyButton text={tx.hash} size="small" variant="ghost" />
                        )}
                      </div>
                    </div>

                    {/* Method */}
                    <div>
                      <p className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-1">Method</p>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-500/30">
                        <i className="fas fa-function mr-1"></i>
                        {getMethodDisplay(tx.method)}
                      </span>
                    </div>

                    {/* From Address */}
                    <div>
                      <p className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-1">From</p>
                      <div className="flex items-center gap-2">
                        <code className="text-purple-300 text-sm" title={tx.from}>
                          {formatAddress(tx.from)}
                        </code>
                        {tx.from && (
                          <CopyButton text={tx.from} size="small" variant="ghost" />
                        )}
                      </div>
                    </div>

                    {/* Block & Status */}
                    <div className="flex items-center justify-between lg:justify-end gap-4">
                      {/* Block */}
                      <div className="text-center">
                        <p className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-1">Block</p>
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded bg-amber-500/20 flex items-center justify-center">
                            <i className="fas fa-cube text-amber-400 text-xs"></i>
                          </div>
                          <span className="text-amber-300 text-sm font-bold">
                            {formatBlockNumber(tx.blockNumber)}
                          </span>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="text-center">
                        <p className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-1">Status</p>
                        <div className="flex items-center justify-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${status.bgColor} ${
                            status.text === 'Success' ? 'animate-pulse' : ''
                          }`}></div>
                          <span className={`text-xs font-semibold ${status.color}`}>
                            {status.text}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expand on hover for additional details */}
                  {hoveredTx === index && tx.timestamp && (
                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>Timestamp: {new Date(tx.timestamp * 1000).toLocaleString()}</span>
                        {tx.gasUsed && (
                          <span>Gas Used: {parseInt(tx.gasUsed).toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <i className="fas fa-history text-gray-400 text-2xl"></i>
            </div>
            <h4 className="text-gray-300 text-lg font-semibold mb-2">No Recent Transactions</h4>
            <p className="text-gray-500 text-sm max-w-md mx-auto leading-relaxed">
              Transactions will appear here once the contract is interacted with.
              Try calling some contract methods to see transaction history.
            </p>
            <div className="mt-6 flex justify-center">
              <div className="px-4 py-2 bg-gray-700/50 rounded-lg border border-gray-600">
                <p className="text-xs text-gray-400">
                  <i className="fas fa-info-circle mr-1"></i>
                  Listening for new transactions...
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentTransactionsCard;
