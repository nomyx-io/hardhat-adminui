import React, { useState, useMemo } from 'react';
import CodeBlock from '../common/CodeBlock';
import CopyButton from '../common/CopyButton';

const BytecodeTab = ({ bytecode, isLoading = false, error = null }) => {
  const [activeView, setActiveView] = useState('overview'); // 'overview', 'raw', 'analyzed'
  const [searchTerm, setSearchTerm] = useState('');
  const [displayFormat, setDisplayFormat] = useState('hex'); // 'hex', 'bytes'

  // Analyze bytecode
  const bytecodeAnalysis = useMemo(() => {
    if (!bytecode || typeof bytecode !== 'string') {
      return {
        size: 0,
        sizeKB: 0,
        isValid: false,
        hasConstructor: false,
        estimatedGasCost: 0,
        opcodeCount: 0,
        uniqueOpcodes: 0
      };
    }

    const cleanBytecode = bytecode.startsWith('0x') ? bytecode.slice(2) : bytecode;
    const size = cleanBytecode.length / 2; // Each byte is 2 hex characters
    const sizeKB = size / 1024;
    
    // Basic checks
    const isValid = /^[0-9a-fA-F]*$/.test(cleanBytecode) && cleanBytecode.length % 2 === 0;
    
    // Estimate deployment gas cost (rough approximation)
    const estimatedGasCost = size * 200; // Approximate gas per byte
    
    // Count opcodes (each byte could be an opcode)
    const opcodeCount = size;
    
    // Check for constructor pattern (simplified detection)
    const hasConstructor = cleanBytecode.includes('60806040') || cleanBytecode.includes('608060405260');

    return {
      size,
      sizeKB,
      isValid,
      hasConstructor,
      estimatedGasCost,
      opcodeCount,
      uniqueOpcodes: new Set(cleanBytecode.match(/.{1,2}/g) || []).size
    };
  }, [bytecode]);

  // Format bytecode for display
  const formatBytecode = (code, format) => {
    if (!code) return '';
    
    const cleanCode = code.startsWith('0x') ? code.slice(2) : code;
    
    if (format === 'bytes') {
      // Split into bytes and format nicely
      const bytes = cleanCode.match(/.{1,2}/g) || [];
      return bytes.map((byte, index) => {
        const lineBreak = (index + 1) % 16 === 0 ? '\n' : ' ';
        return `${byte}${lineBreak}`;
      }).join('');
    }
    
    return `0x${cleanCode}`;
  };

  // Search within bytecode
  const highlightedBytecode = useMemo(() => {
    if (!searchTerm || !bytecode) return formatBytecode(bytecode, displayFormat);
    
    const formatted = formatBytecode(bytecode, displayFormat);
    const regex = new RegExp(searchTerm, 'gi');
    return formatted.replace(regex, `**${searchTerm}**`);
  }, [bytecode, searchTerm, displayFormat]);

  // Loading state
  if (isLoading) {
    return (
      <div className="artifact-card bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700">
        <div className="animate-pulse space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-700 rounded-lg"></div>
            <div className="h-6 bg-gray-700 rounded w-40"></div>
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-4 bg-gray-700 rounded w-full"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="artifact-card bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-exclamation-triangle text-white text-xl"></i>
          </div>
          <h3 className="text-xl font-semibold text-red-400 mb-2">Error Loading Bytecode</h3>
          <p className="text-gray-400">{error.message || 'Failed to load contract bytecode'}</p>
        </div>
      </div>
    );
  }

  // No bytecode state
  if (!bytecode || bytecode === '0x') {
    return (
      <div className="artifact-card bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700">
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <i className="fas fa-microchip text-gray-400 text-2xl"></i>
          </div>
          <h4 className="text-gray-300 text-lg font-semibold mb-2">No Bytecode Available</h4>
          <p className="text-gray-500 text-sm max-w-md mx-auto leading-relaxed">
            The contract bytecode is not available. This might be because the contract hasn't been deployed
            or the bytecode couldn't be retrieved from the blockchain.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Main Bytecode Card */}
      <div className="artifact-card bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold flex items-center text-white">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
              <i className="fas fa-microchip text-white"></i>
            </div>
            Contract Bytecode
          </h3>
          
          <div className="flex items-center space-x-3">
            {/* Search */}
            {activeView === 'raw' && (
              <div className="relative">
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"></i>
                <input
                  type="text"
                  placeholder="Search bytecode..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            )}

            {/* Format Toggle */}
            {activeView === 'raw' && (
              <select
                value={displayFormat}
                onChange={(e) => setDisplayFormat(e.target.value)}
                className="px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500 transition-colors"
              >
                <option value="hex">Hex Format</option>
                <option value="bytes">Byte Format</option>
              </select>
            )}

            {/* Copy Button */}
            <CopyButton text={bytecode} size="default" variant="primary" showLabel={true} />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-gray-900/60 rounded-lg p-1 border border-gray-700 mb-6">
          <button
            onClick={() => setActiveView('overview')}
            className={`px-4 py-2 rounded text-sm font-medium transition-all flex items-center space-x-2 ${
              activeView === 'overview'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <i className="fas fa-chart-bar"></i>
            <span>Overview</span>
          </button>
          <button
            onClick={() => setActiveView('raw')}
            className={`px-4 py-2 rounded text-sm font-medium transition-all flex items-center space-x-2 ${
              activeView === 'raw'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <i className="fas fa-code"></i>
            <span>Raw Bytecode</span>
          </button>
          <button
            onClick={() => setActiveView('analyzed')}
            className={`px-4 py-2 rounded text-sm font-medium transition-all flex items-center space-x-2 ${
              activeView === 'analyzed'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <i className="fas fa-microscope"></i>
            <span>Analysis</span>
          </button>
        </div>

        {/* Overview Tab */}
        {activeView === 'overview' && (
          <div className="space-y-6">
            {/* Bytecode Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gradient-to-br from-blue-900/30 to-blue-800/30 rounded-lg border border-blue-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-300 text-sm font-medium">Size (Bytes)</p>
                    <p className="text-white text-2xl font-bold">{bytecodeAnalysis.size.toLocaleString()}</p>
                  </div>
                  <i className="fas fa-weight text-blue-400 text-xl"></i>
                </div>
              </div>
              
              <div className="p-4 bg-gradient-to-br from-green-900/30 to-green-800/30 rounded-lg border border-green-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-300 text-sm font-medium">Size (KB)</p>
                    <p className="text-white text-2xl font-bold">{bytecodeAnalysis.sizeKB.toFixed(2)}</p>
                  </div>
                  <i className="fas fa-file text-green-400 text-xl"></i>
                </div>
              </div>
              
              <div className="p-4 bg-gradient-to-br from-amber-900/30 to-amber-800/30 rounded-lg border border-amber-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-amber-300 text-sm font-medium">Deploy Cost</p>
                    <p className="text-white text-2xl font-bold">{Math.round(bytecodeAnalysis.estimatedGasCost / 1000)}K</p>
                  </div>
                  <i className="fas fa-gas-pump text-amber-400 text-xl"></i>
                </div>
              </div>
              
              <div className="p-4 bg-gradient-to-br from-purple-900/30 to-purple-800/30 rounded-lg border border-purple-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-300 text-sm font-medium">Opcodes</p>
                    <p className="text-white text-2xl font-bold">{bytecodeAnalysis.uniqueOpcodes}</p>
                  </div>
                  <i className="fas fa-microchip text-purple-400 text-xl"></i>
                </div>
              </div>
            </div>

            {/* Bytecode Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Validation Status */}
              <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                <div className="flex items-center space-x-3 mb-2">
                  <i className={`fas ${bytecodeAnalysis.isValid ? 'fa-check-circle text-green-400' : 'fa-times-circle text-red-400'}`}></i>
                  <h4 className="font-semibold text-white">Validation Status</h4>
                </div>
                <p className={`text-sm ${bytecodeAnalysis.isValid ? 'text-green-300' : 'text-red-300'}`}>
                  {bytecodeAnalysis.isValid ? 'Valid hexadecimal bytecode' : 'Invalid bytecode format'}
                </p>
              </div>

              {/* Constructor Detection */}
              <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                <div className="flex items-center space-x-3 mb-2">
                  <i className={`fas ${bytecodeAnalysis.hasConstructor ? 'fa-hammer text-orange-400' : 'fa-times text-gray-400'}`}></i>
                  <h4 className="font-semibold text-white">Constructor</h4>
                </div>
                <p className={`text-sm ${bytecodeAnalysis.hasConstructor ? 'text-orange-300' : 'text-gray-400'}`}>
                  {bytecodeAnalysis.hasConstructor ? 'Constructor pattern detected' : 'No constructor detected'}
                </p>
              </div>
            </div>

            {/* Size Analysis */}
            <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
              <h4 className="font-semibold text-white mb-3 flex items-center">
                <i className="fas fa-ruler mr-2 text-cyan-400"></i>
                Size Analysis
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Size:</span>
                  <span className="text-white font-mono">{bytecodeAnalysis.size} bytes ({bytecodeAnalysis.sizeKB.toFixed(2)} KB)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Estimated Gas Cost:</span>
                  <span className="text-white font-mono">{bytecodeAnalysis.estimatedGasCost.toLocaleString()} gas</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Contract Efficiency:</span>
                  <span className={`font-semibold ${
                    bytecodeAnalysis.sizeKB < 10 ? 'text-green-400' :
                    bytecodeAnalysis.sizeKB < 20 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {bytecodeAnalysis.sizeKB < 10 ? 'Efficient' :
                     bytecodeAnalysis.sizeKB < 20 ? 'Moderate' : 'Large'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Raw Bytecode Tab */}
        {activeView === 'raw' && (
          <div className="space-y-4">
            {/* Bytecode Display Options Info */}
            <div className="p-3 bg-cyan-900/20 border border-cyan-500/30 rounded-lg">
              <div className="flex items-center space-x-2 text-cyan-300 text-sm">
                <i className="fas fa-info-circle"></i>
                <span>
                  {displayFormat === 'hex' ? 'Displaying as continuous hexadecimal string' : 'Displaying as formatted bytes (16 per line)'}
                  {searchTerm && ` | Searching for: "${searchTerm}"`}
                </span>
              </div>
            </div>
            
            {/* Bytecode Content */}
            <div className="relative">
              <div className="max-h-96 overflow-y-auto bg-gray-900 rounded-lg border border-gray-700">
                <CodeBlock
                  code={highlightedBytecode}
                  language="text"
                  className="text-xs font-mono"
                />
              </div>
              <div className="absolute top-4 right-4">
                <CopyButton text={formatBytecode(bytecode, displayFormat)} size="small" variant="ghost" />
              </div>
            </div>

            {/* Search Results */}
            {searchTerm && (
              <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <p className="text-blue-300 text-sm">
                  <i className="fas fa-search mr-2"></i>
                  {highlightedBytecode.split(searchTerm).length - 1} occurrence(s) of "{searchTerm}" found
                </p>
              </div>
            )}
          </div>
        )}

        {/* Analysis Tab */}
        {activeView === 'analyzed' && (
          <div className="space-y-6">
            {/* Bytecode Structure Analysis */}
            <div className="p-6 bg-gray-900/50 rounded-lg border border-gray-700">
              <h4 className="font-semibold text-white mb-4 flex items-center">
                <i className="fas fa-microscope mr-2 text-purple-400"></i>
                Bytecode Structure
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="text-gray-400 font-medium mb-2">Analysis Results</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Format:</span>
                      <span className="text-white">
                        {bytecode.startsWith('0x') ? 'Hexadecimal with 0x prefix' : 'Raw hexadecimal'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Hex Characters:</span>
                      <span className="text-white font-mono">{(bytecode.startsWith('0x') ? bytecode.slice(2) : bytecode).length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Byte Count:</span>
                      <span className="text-white font-mono">{bytecodeAnalysis.size}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Unique Bytes:</span>
                      <span className="text-white font-mono">{bytecodeAnalysis.uniqueOpcodes}/256</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h5 className="text-gray-400 font-medium mb-2">Deployment Impact</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Gas Estimate:</span>
                      <span className="text-white font-mono">{bytecodeAnalysis.estimatedGasCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">ETH Cost (~):</span>
                      <span className="text-white font-mono">
                        {((bytecodeAnalysis.estimatedGasCost * 20) / 1e9).toFixed(4)} ETH
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Size Category:</span>
                      <span className={`font-semibold ${
                        bytecodeAnalysis.sizeKB < 5 ? 'text-green-400' :
                        bytecodeAnalysis.sizeKB < 15 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {bytecodeAnalysis.sizeKB < 5 ? 'Small' :
                         bytecodeAnalysis.sizeKB < 15 ? 'Medium' : 'Large'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Optimization:</span>
                      <span className="text-gray-300">
                        {bytecodeAnalysis.sizeKB < 10 ? 'Well optimized' : 'Could be optimized'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="p-4 bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border border-blue-500/50 rounded-lg">
              <h5 className="font-semibold text-blue-300 mb-2 flex items-center">
                <i className="fas fa-lightbulb mr-2"></i>
                Optimization Recommendations
              </h5>
              <div className="space-y-2 text-sm text-blue-200">
                {bytecodeAnalysis.sizeKB > 20 && (
                  <p>• Consider enabling Solidity optimizer with higher runs for smaller bytecode</p>
                )}
                {bytecodeAnalysis.sizeKB > 15 && (
                  <p>• Large contracts may hit the 24KB deployment limit on some networks</p>
                )}
                {bytecodeAnalysis.sizeKB < 5 && (
                  <p>• Well-optimized contract size - good for gas efficiency</p>
                )}
                <p>• Estimated deployment cost: ~{Math.round(bytecodeAnalysis.estimatedGasCost / 1000)}K gas</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BytecodeTab;
