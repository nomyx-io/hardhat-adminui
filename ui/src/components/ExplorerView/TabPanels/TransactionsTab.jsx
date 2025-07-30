import React, { useState, useEffect, useCallback } from 'react';
import TransactionListItem from '../common/TransactionListItem';

const TransactionsTab = ({ deployment, onTransactionClick }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    status: 'all', // all, success, failed
    method: 'all',
    limit: 20
  });

  const fetchTransactions = useCallback(async () => {
    if (!deployment) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        contract: deployment.address,
        limit: filters.limit.toString(),
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.method !== 'all' && { method: filters.method })
      });

      const response = await fetch(`/api/transactions?${params}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch transactions: ${response.statusText}`);
      }
      
      const data = await response.json();
      setTransactions(data);
      
      // Calculate pagination (simple client-side pagination for now)
      const itemsPerPage = filters.limit;
      setTotalPages(Math.ceil(data.length / itemsPerPage));
      
    } catch (err) {
      setError(err.message);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [deployment, filters]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const getPaginatedTransactions = () => {
    const startIndex = (currentPage - 1) * filters.limit;
    const endIndex = startIndex + filters.limit;
    return transactions.slice(startIndex, endIndex);
  };

  const getUniqueValues = (field) => {
    const values = [...new Set(transactions.map(tx => tx[field]).filter(Boolean))];
    return values.sort();
  };

  const formatAddress = (address, length = 10) => {
    if (!address) return '';
    return `${address.slice(0, length)}...${address.slice(-8)}`;
  };

  if (!deployment) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-400">No contract selected</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Transaction History</h2>
          <p className="text-slate-400 mt-1">
            Transactions for contract {formatAddress(deployment.address)}
          </p>
        </div>
        <button
          onClick={fetchTransactions}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-lg transition-colors duration-200"
        >
          <i className={`fas fa-sync-alt mr-2 ${loading ? 'animate-spin' : ''}`}></i>
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-slate-800/50 rounded-lg p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Method
            </label>
            <select
              value={filters.method}
              onChange={(e) => handleFilterChange('method', e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Methods</option>
              {getUniqueValues('method').map(method => (
                <option key={method} value={method}>{method}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Results per page
            </label>
            <select
              value={filters.limit}
              onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Total Found
            </label>
            <div className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-slate-300">
              {transactions.length} transactions
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-slate-400">Loading transactions...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <i className="fas fa-exclamation-triangle text-red-400"></i>
            <div>
              <p className="text-red-400 font-medium">Error loading transactions</p>
              <p className="text-red-300 text-sm mt-1">{error}</p>
            </div>
          </div>
          <button
            onClick={fetchTransactions}
            className="mt-3 inline-flex items-center px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors duration-200"
          >
            <i className="fas fa-redo mr-2"></i>
            Retry
          </button>
        </div>
      )}

      {!loading && !error && transactions.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-history text-slate-500 text-xl"></i>
          </div>
          <p className="text-slate-400 text-lg mb-2">No transactions found</p>
          <p className="text-slate-500 text-sm">
            This contract hasn't been interacted with yet, or no transactions match your filters.
          </p>
        </div>
      )}

      {!loading && !error && transactions.length > 0 && (
        <div className="space-y-4">
          {/* Transactions Table */}
          <div className="bg-slate-800/30 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Transaction Hash
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Method
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      From
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Gas Used
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Block
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {getPaginatedTransactions().map((transaction, index) => (
                    <TransactionListItem
                      key={`${transaction.hash}-${index}`}
                      transaction={transaction}
                      onTransactionClick={onTransactionClick}
                      showFrom={true}
                      showTo={false} // Don't show "To" since it's always this contract
                      showValue={true}
                      showMethod={true}
                      showGas={true}
                      showTimestamp={false}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-400">
                Showing {(currentPage - 1) * filters.limit + 1} to{' '}
                {Math.min(currentPage * filters.limit, transactions.length)} of{' '}
                {transactions.length} transactions
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-700/50 disabled:text-slate-500 text-white rounded transition-colors duration-200"
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 rounded transition-colors duration-200 ${
                      page === currentPage
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 hover:bg-slate-600 text-white'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-700/50 disabled:text-slate-500 text-white rounded transition-colors duration-200"
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TransactionsTab;