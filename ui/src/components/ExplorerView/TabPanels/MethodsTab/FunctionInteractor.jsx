import React, { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import TransactionSimulator from './TransactionSimulator';

const FunctionInteractor = ({ func, contract }) => {
  const [inputs, setInputs] = useState({});
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);
  const [processedArgs, setProcessedArgs] = useState([]);

  const isRead = func.stateMutability === 'view' || func.stateMutability === 'pure';

  const validateInput = useCallback((type, value) => {
    if (value === undefined || value === '') return 'Input is required';

    switch (type) {
      case 'address':
        return ethers.utils.isAddress(value) ? '' : 'Invalid address';
      case 'bool':
        return value === 'true' || value === 'false' ? '' : 'Must be true or false';
      default:
        if (type.startsWith('uint') || type.startsWith('int')) {
          try {
            ethers.BigNumber.from(value);
            return '';
          } catch {
            return 'Invalid number';
          }
        }
        if (type.startsWith('bytes')) {
            if (!ethers.utils.isHexString(value)) {
                return 'Invalid hex string';
            }
            const length = parseInt(type.replace('bytes', ''));
            if (!isNaN(length) && ethers.utils.hexDataLength(value) !== length) {
                return `Must be ${length} bytes`;
            }
            return '';
        }
        return '';
    }
  }, []);

  const handleInputChange = (path, value) => {
    setInputs(prev => {
      const newInputs = { ...prev };
      let current = newInputs;
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      current[path[path.length - 1]] = value;
      return newInputs;
    });

    const type = getIn(func.inputs, path.slice(0, -1)).type;
    const error = validateInput(type, value);
    setValidationErrors(prev => ({ ...prev, [path.join('.')]: error }));
  };

  const getIn = (obj, path) => {
    let current = obj;
    for (const key of path) {
        if (current.components) {
            current = current.components.find(c => c.name === key);
        } else {
            current = current[key];
        }
    }
    return current;
  };

  const processInputs = (inputsDef, currentValues) => {
    return inputsDef.map(inputDef => {
      const value = currentValues ? currentValues[inputDef.name] : undefined;
      if (inputDef.type.endsWith('[]')) {
        if (!Array.isArray(value)) {
            throw new Error(`Expected an array for ${inputDef.name}`);
        }
        // Further processing for array elements can be added here if needed
        return value;
      }
      if (inputDef.type === 'tuple') {
        return processInputs(inputDef.components, value);
      }
      return value;
    });
  };

  const execute = async () => {
    setLoading(true);
    setResult('');
    setError('');

    const hasErrors = Object.values(validationErrors).some(e => e);
    if (hasErrors) {
      setError("Please fix validation errors before executing.");
      setLoading(false);
      return;
    }

    try {
      const args = processInputs(func.inputs, inputs);

      if (isRead) {
        const res = await contract[func.name](...args);
        setResult(JSON.stringify(res, null, 2));
      } else {
        const signer = new ethers.providers.Web3Provider(window.ethereum).getSigner();
        const contractWithSigner = contract.connect(signer);

        const txOptions = {};
        if (func.payable) {
          const ethValue = inputs['payableValue'];
          if (!ethValue || isNaN(parseFloat(ethValue))) {
            throw new Error("A valid ETH value is required for payable function.");
          }
          txOptions.value = ethers.utils.parseEther(ethValue);
        }

        const tx = await contractWithSigner[func.name](...args, txOptions);
        setResult(`Transaction sent: ${tx.hash}`);
        await tx.wait();
        setResult(`Transaction confirmed: ${tx.hash}`);
      }
    } catch (e) {
      console.error(e);
      setError(e.reason || e.message);
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (input, path = []) => {
    const currentPath = [...path, input.name];
    const placeholder = `${input.type} ${input.name}`;
    const error = validationErrors[currentPath.join('.')];

    if (input.type === 'tuple') {
      return (
        <div key={currentPath.join('.')} className="pl-4 border-l-2 border-gray-600 space-y-2">
          <p className="text-sm text-gray-400">{input.name} (struct)</p>
          {input.components.map(component => renderInput(component, currentPath))}
        </div>
      );
    }

    if (input.type.endsWith('[]')) {
      const arrayBaseType = input.type.slice(0, -2);
      const arrayValues = getIn(inputs, currentPath) || [];

      const handleAddElement = () => {
        const newArray = [...arrayValues, ''];
        handleInputChange(currentPath, newArray);
      };

      const handleRemoveElement = (index) => {
        const newArray = arrayValues.filter((_, i) => i !== index);
        handleInputChange(currentPath, newArray);
      };

      const handleArrayElementChange = (index, value) => {
        const newArray = [...arrayValues];
        newArray[index] = value;
        handleInputChange(currentPath, newArray);
      };

      return (
        <div key={currentPath.join('.')} className="pl-4 border-l-2 border-gray-600 space-y-2">
            <p className="text-sm text-gray-400">{input.name} ({input.type})</p>
            {arrayValues.map((value, index) => (
                <div key={index} className="flex items-center space-x-2">
                    <input
                        type="text"
                        placeholder={`${arrayBaseType} at index ${index}`}
                        value={value}
                        onChange={(e) => handleArrayElementChange(index, e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
                    />
                    <button onClick={() => handleRemoveElement(index)} className="text-red-500 hover:text-red-400 text-sm">Remove</button>
                </div>
            ))}
            <button onClick={handleAddElement} className="text-green-500 hover:text-green-400 text-sm">+ Add Element</button>
        </div>
      )
    }
    
    if (input.type === 'bool') {
        return (
            <div key={currentPath.join('.')}>
                <select
                    onChange={(e) => handleInputChange(currentPath, e.target.value)}
                    className={`w-full bg-gray-700 border rounded px-2 py-1 text-sm ${error ? 'border-red-500' : 'border-gray-600'}`}
                    defaultValue=""
                >
                    <option value="" disabled>{placeholder}</option>
                    <option value="true">true</option>
                    <option value="false">false</option>
                </select>
                {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
            </div>
        )
    }

    return (
      <div key={currentPath.join('.')}>
        <input
          type="text"
          placeholder={placeholder}
          onChange={(e) => handleInputChange(currentPath, e.target.value)}
          className={`w-full bg-gray-700 border rounded px-2 py-1 text-sm ${error ? 'border-red-500' : 'border-gray-600'}`}
        />
        {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
      </div>
    );
  };

  return (
    <div className={`contract-method p-6 rounded-xl border transition-all ${
      isRead 
        ? 'bg-gradient-to-br from-blue-900/20 to-blue-800/20 border-blue-700/50' 
        : 'bg-gradient-to-br from-orange-900/20 to-orange-800/20 border-orange-700/50'
    }`}>
      {/* Function Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            isRead ? 'bg-blue-600' : 'bg-orange-600'
          }`}>
            <i className={`fas ${isRead ? 'fa-eye' : 'fa-edit'} text-white text-sm`}></i>
          </div>
          <div>
            <h3 className="font-semibold text-white">{func.name}</h3>
            <div className="flex items-center space-x-2 text-xs">
              <span className={`px-2 py-1 rounded-full ${
                isRead ? 'bg-blue-600/30 text-blue-300' : 'bg-orange-600/30 text-orange-300'
              }`}>
                {isRead ? 'READ' : 'WRITE'}
              </span>
              {func.payable && (
                <span className="px-2 py-1 rounded-full bg-yellow-600/30 text-yellow-300 flex items-center">
                  <i className="fas fa-coins mr-1"></i>
                  PAYABLE
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Function Signature */}
        <div className="text-right">
          <code className="text-xs text-gray-400 bg-gray-800/50 px-2 py-1 rounded">
            {func.format()}
          </code>
        </div>
      </div>

      {/* Inputs Section */}
      {func.inputs.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center mb-3">
            <i className="fas fa-arrow-right text-gray-400 mr-2"></i>
            <span className="text-sm font-medium text-gray-300">Parameters</span>
          </div>
          <div className="space-y-3 pl-4">
            {func.inputs.map(input => renderInput(input))}
          </div>
        </div>
      )}

      {/* Payable Value Input */}
      {func.payable && (
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <i className="fas fa-coins text-yellow-400 mr-2"></i>
            <span className="text-sm font-medium text-yellow-300">ETH Value</span>
          </div>
          <div className="pl-4">
            <input
              type="text"
              placeholder="Amount in ETH (e.g., 0.1)"
              onChange={(e) => handleInputChange(['payableValue'], e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
            />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center space-x-3 mb-4">
        <button
          onClick={execute}
          disabled={loading}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            loading 
              ? 'bg-gray-600 cursor-not-allowed' 
              : isRead 
                ? 'bg-blue-600 hover:bg-blue-500 text-white' 
                : 'bg-orange-600 hover:bg-orange-500 text-white'
          }`}
        >
          {loading ? (
            <>
              <i className="fas fa-spinner fa-spin"></i>
              <span>Executing...</span>
            </>
          ) : (
            <>
              <i className={`fas ${isRead ? 'fa-search' : 'fa-paper-plane'}`}></i>
              <span>{isRead ? 'Query' : 'Execute'}</span>
            </>
          )}
        </button>
        
        {!isRead && (
          <button
            onClick={() => {
              const args = processInputs(func.inputs, inputs);
              setProcessedArgs(args);
              setShowSimulator(!showSimulator);
            }}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-all"
          >
            <i className={`fas ${showSimulator ? 'fa-eye-slash' : 'fa-microscope'}`}></i>
            <span>{showSimulator ? 'Hide Simulator' : 'Simulate'}</span>
          </button>
        )}
      </div>

      {/* Results Section */}
      {result && (
        <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <i className="fas fa-check-circle text-green-400 mr-2"></i>
            <span className="text-sm font-medium text-green-300">Result</span>
          </div>
          <pre className="text-green-300 text-sm font-mono overflow-x-auto">{result}</pre>
        </div>
      )}
      
      {error && (
        <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <i className="fas fa-exclamation-triangle text-red-400 mr-2"></i>
            <span className="text-sm font-medium text-red-300">Error</span>
          </div>
          <pre className="text-red-300 text-sm font-mono overflow-x-auto">{error}</pre>
        </div>
      )}
      
      {showSimulator && !isRead && (
        <div className="mt-4 border-t border-gray-700 pt-4">
          <TransactionSimulator contract={contract} func={func} args={processedArgs} value={inputs['payableValue']} />
        </div>
      )}
    </div>
  );
};

export default FunctionInteractor;
