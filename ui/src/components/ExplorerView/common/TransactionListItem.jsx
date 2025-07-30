import React from 'react';
import CopyButton from './CopyButton';

const TransactionListItem = ({ 
  transaction, 
  onTransactionClick, 
  compact = false,
  showFrom = true,
  showTo = true,
  showValue = true,
  showMethod = true,
  showGas = false,
  showTimestamp = false
}) => {
  const formatValue = (value, decimals = 18) => {
    if (!value || value === '0') return '0';
    const ethValue = parseFloat(value) / Math.pow(10, decimals);
    return ethValue.toFixed(6);
  };

  const formatGas = (gasValue) => {
    if (!gasValue) return '0';
    return parseInt(gasValue).toLocaleString();
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = new Date(timestamp * 1000);
    if (compact) {
      return date.toLocaleTimeString();
    }
    return date.toLocaleString();
  };

  const truncateAddress = (address, length = 10) => {
    if (!address) return '';
    return `${address.slice(0, length)}...${address.slice(-8)}`;
  };

  const getStatusColor = (status) => {
    if (status === 1 || status === 'Success') return 'bg-green-400';
    if (status === 0 || status === 'Failed') return 'bg-red-400';
    return 'bg-yellow-400';
  };

  const getStatusText = (status) => {
    if (status === 1 || status === 'Success') return 'Success';
    if (status === 0 || status === 'Failed') return 'Failed';
    return 'Pending';
  };

  const getStatusTextColor = (status) => {
    if (status === 1 || status === 'Success') return 'text-green-400';
    if (status === 0 || status === 'Failed') return 'text-red-400';
    return 'text-yellow-400';
  };

  if (compact) {
    return (
      <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-colors duration-200">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className={`w-2 h-2 rounded-full ${getStatusColor(transaction.status)}`}></div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-2">
              <span 
                className="text-blue-400 hover:text-blue-300 cursor-pointer font-mono text-sm transition-colors duration-200"
                onClick={() => onTransactionClick && onTransactionClick(transaction.hash)}
                title={`View details for ${transaction.hash}`}
              >
                {truncateAddress(transaction.hash, 12)}
              </span>
              {showMethod && transaction.method && (
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {transaction.method}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4 text-xs text-slate-400 mt-1">
              {showFrom && transaction.from && (
                <span>From: {truncateAddress(transaction.from, 6)}</span>
              )}
              {showTo && transaction.to && (
                <span>To: {truncateAddress(transaction.to, 6)}</span>
              )}
              {showTimestamp && transaction.timestamp && (
                <span>{formatTimestamp(transaction.timestamp)}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {showValue && transaction.value && (
            <span className="text-sm font-mono text-slate-300">
              {formatValue(transaction.value)} ETH
            </span>
          )}
          <span className={`text-xs font-semibold ${getStatusTextColor(transaction.status)}`}>
            {getStatusText(transaction.status)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <tr className="group transition-all duration-200 hover:bg-slate-800/30">
      <td className="font-mono text-sm">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full animate-pulse ${getStatusColor(transaction.status)}`}></div>
          <span 
            className="text-blue-400 truncate max-w-[200px] hover:text-blue-300 cursor-pointer transition-colors duration-200"
            onClick={() => onTransactionClick && onTransactionClick(transaction.hash)}
            title={`View details for ${transaction.hash}`}
          >
            {transaction.hash}
          </span>
        </div>
      </td>
      
      {showMethod && (
        <td>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/30">
            {transaction.method || 'Unknown'}
          </span>
        </td>
      )}
      
      {showFrom && (
        <td className="font-mono text-sm">
          <div className="flex items-center space-x-2">
            <span 
              className="text-purple-400 hover:text-purple-300 cursor-pointer"
              title={transaction.from}
            >
              {truncateAddress(transaction.from)}
            </span>
            <CopyButton textToCopy={transaction.from} />
          </div>
        </td>
      )}
      
      {showTo && (
        <td className="font-mono text-sm">
          <div className="flex items-center space-x-2">
            <span 
              className="text-cyan-400 hover:text-cyan-300 cursor-pointer"
              title={transaction.to || 'Contract Creation'}
            >
              {transaction.to ? truncateAddress(transaction.to) : 'Contract Creation'}
            </span>
            {transaction.to && <CopyButton textToCopy={transaction.to} />}
          </div>
        </td>
      )}
      
      {showValue && (
        <td className="font-mono text-sm">
          <span className="text-slate-300">
            {formatValue(transaction.value)} ETH
          </span>
        </td>
      )}
      
      {showGas && (
        <td className="font-mono text-sm">
          <div className="space-y-1">
            <div className="text-slate-300">
              {formatGas(transaction.gasUsed)} / {formatGas(transaction.gasLimit)}
            </div>
            {transaction.gasPrice && (
              <div className="text-xs text-slate-400">
                {formatValue(transaction.gasPrice, 9)} Gwei
              </div>
            )}
          </div>
        </td>
      )}
      
      <td>
        {transaction.blockNumber && (
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded bg-amber-500/20 flex items-center justify-center">
              <span className="text-amber-400 text-xs font-bold">
                {transaction.blockNumber}
              </span>
            </div>
          </div>
        )}
      </td>
      
      {showTimestamp && (
        <td className="text-sm text-slate-400">
          {formatTimestamp(transaction.timestamp)}
        </td>
      )}
      
      <td>
        <div className="flex items-center space-x-1">
          <div className={`w-2 h-2 rounded-full ${getStatusColor(transaction.status)}`}></div>
          <span className={`text-xs font-semibold ${getStatusTextColor(transaction.status)}`}>
            {getStatusText(transaction.status)}
          </span>
        </div>
      </td>
    </tr>
  );
};

export default TransactionListItem;