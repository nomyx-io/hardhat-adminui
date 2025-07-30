import React, { useMemo, useState } from 'react';
import { ethers } from 'ethers';
import FunctionInteractor from './FunctionInteractor';
import CopyButton from '../../common/CopyButton';

const MethodsTab = ({ deployment, onTransactionClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'read', 'write'
  
  const contract = useMemo(() => {
    if (!deployment) return null;
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      return new ethers.Contract(deployment.address, deployment.abi, provider);
    } catch (error) {
      console.error('Error creating contract instance:', error);
      return null;
    }
  }, [deployment]);

  const functions = useMemo(() => {
    if (!contract) return { read: [], write: [], all: [] };
    
    try {
      const allFunctions = contract.interface.fragments.filter(f => f.type === 'function');
      const readFunctions = allFunctions.filter(f => f.stateMutability === 'view' || f.stateMutability === 'pure');
      const writeFunctions = allFunctions.filter(f => f.stateMutability !== 'view' && f.stateMutability !== 'pure');
      
      return {
        read: readFunctions,
        write: writeFunctions,
        all: allFunctions
      };
    } catch (error) {
      console.error('Error parsing contract functions:', error);
      return { read: [], write: [], all: [] };
    }
  }, [contract]);

  const filteredFunctions = useMemo(() => {
    let functionsToFilter = [];
    
    switch (filter) {
      case 'read':
        functionsToFilter = functions.read;
        break;
      case 'write':
        functionsToFilter = functions.write;
        break;
      default:
        functionsToFilter = functions.all;
    }
    
    if (!searchTerm) return functionsToFilter;
    
    return functionsToFilter.filter(func =>
      func.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      func.format().toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [functions, filter, searchTerm]);

  if (!deployment) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="fas fa-exclamation-triangle text-gray-500 text-2xl"></i>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">No Contract Selected</h3>
        <p className="text-gray-400">Please select a contract to view its methods</p>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="fas fa-exclamation-circle text-red-400 text-2xl"></i>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Contract Load Error</h3>
        <p className="text-gray-400 mb-4">Unable to load contract interface</p>
        <div className="text-sm text-gray-500">
          Check that your wallet is connected and you're on the correct network
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Contract Info */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center">
              <i className="fas fa-code text-blue-400 mr-3"></i>
              Contract Methods
            </h2>
            <p className="text-gray-400 mt-1">
              Interactive interface for {deployment.contractName}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm text-gray-400">Contract Address</div>
              <div className="flex items-center gap-2">
                <code className="text-purple-300 font-mono text-sm">
                  {deployment.address}
                </code>
                <CopyButton text={deployment.address} size="small" variant="ghost" />
              </div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-gray-700/50 rounded-lg">
            <div className="text-2xl font-bold text-blue-400">{functions.read.length}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wide">Read Methods</div>
          </div>
          <div className="text-center p-3 bg-gray-700/50 rounded-lg">
            <div className="text-2xl font-bold text-orange-400">{functions.write.length}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wide">Write Methods</div>
          </div>
          <div className="text-center p-3 bg-gray-700/50 rounded-lg">
            <div className="text-2xl font-bold text-green-400">{functions.all.length}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wide">Total Methods</div>
          </div>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                placeholder="Search methods by name or signature..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          
          {/* Filter Buttons */}
          <div className="flex gap-2">
            {[
              { key: 'all', label: 'All', icon: 'fas fa-list', count: functions.all.length },
              { key: 'read', label: 'Read', icon: 'fas fa-eye', count: functions.read.length },
              { key: 'write', label: 'Write', icon: 'fas fa-edit', count: functions.write.length }
            ].map(({ key, label, icon, count }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  filter === key
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <i className={icon}></i>
                {label}
                <span className="text-xs bg-black/20 px-1.5 py-0.5 rounded">
                  {count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Methods Grid */}
      {filteredFunctions.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredFunctions.map((func, index) => (
            <FunctionInteractor
              key={`${func.name}-${index}`}
              func={func}
              contract={contract}
              onTransactionClick={onTransactionClick}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-search text-gray-500 text-2xl"></i>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No Methods Found</h3>
          <p className="text-gray-400">
            {searchTerm
              ? `No methods match "${searchTerm}"`
              : `No ${filter === 'all' ? '' : filter} methods available`
            }
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="mt-4 text-blue-400 hover:text-blue-300 text-sm"
            >
              Clear search
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default MethodsTab;
