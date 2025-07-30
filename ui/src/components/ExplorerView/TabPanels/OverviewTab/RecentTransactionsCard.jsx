import React from 'react';

const RecentTransactionsCard = ({ recentTransactions = [], onTransactionClick }) => {
  return (
    <div className="glass-card p-6 md:col-span-2 animate-fade-in">
      <h3 className="text-xl font-bold mb-6 flex items-center">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center mr-3">
          <i className="fas fa-exchange-alt text-white text-sm"></i>
        </div>
        <span className="gradient-text">Recent Transactions</span>
      </h3>
      <div className="overflow-x-auto scrollbar-thin">
        {recentTransactions && recentTransactions.length > 0 ? (
          <table className="table-modern">
            <thead>
              <tr>
                <th>Transaction Hash</th>
                <th>Method</th>
                <th>From</th>
                <th>Block</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((tx, index) => (
                <tr key={index} className="group transition-all duration-200">
                  <td className="font-mono text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                      <span
                        className="text-blue-400 truncate max-w-[200px] hover:text-blue-300 cursor-pointer transition-colors duration-200"
                        onClick={() => onTransactionClick && onTransactionClick(tx.hash)}
                        title={`View details for ${tx.hash}`}
                      >
                        {tx.hash}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/30">
                      {tx.method}
                    </span>
                  </td>
                  <td className="font-mono text-sm">
                    <span
                      className="text-purple-400 hover:text-purple-300 cursor-pointer"
                      title={tx.from}
                    >
                      {tx.from?.slice(0, 6)}...{tx.from?.slice(-4)}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded bg-amber-500/20 flex items-center justify-center">
                        <span className="text-amber-400 text-xs font-bold">
                          {tx.blockNumber}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center space-x-1">
                      <div className={`w-2 h-2 rounded-full ${
                        tx.status === 'Success' || tx.status === 1
                          ? 'bg-green-400'
                          : 'bg-red-400'
                      }`}></div>
                      <span className={`text-xs font-semibold ${
                        tx.status === 'Success' || tx.status === 1
                          ? 'text-green-400'
                          : 'text-red-400'
                      }`}>
                        {tx.status === 1 ? 'Success' : tx.status === 0 ? 'Failed' : tx.status}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-history text-slate-500 text-xl"></i>
            </div>
            <p className="text-slate-400 text-lg">No recent transactions found</p>
            <p className="text-slate-500 text-sm mt-2">
              Transactions will appear here once the contract is interacted with
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentTransactionsCard;
