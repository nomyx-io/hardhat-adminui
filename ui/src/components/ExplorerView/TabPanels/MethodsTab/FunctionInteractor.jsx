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
    <div className="contract-method p-4 rounded-lg">
      <p className="font-medium">{func.name}</p>
      <div className="space-y-2 my-2">
        {func.inputs.map(input => renderInput(input))}
        {func.payable && (
          <input
            type="text"
            placeholder="Value (ETH)"
            onChange={(e) => handleInputChange(['payableValue'], e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
          />
        )}
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={execute}
          disabled={loading}
          className="bg-primary hover:bg-indigo-700 px-4 py-1 rounded-lg text-sm"
        >
          {loading ? 'Executing...' : (isRead ? 'Query' : 'Transact')}
        </button>
        {!isRead && (
            <button
                onClick={() => {
                    const args = processInputs(func.inputs, inputs);
                    setProcessedArgs(args);
                    setShowSimulator(!showSimulator);
                }}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-1 rounded-lg text-sm"
            >
                {showSimulator ? 'Hide Simulator' : 'Simulate'}
            </button>
        )}
      </div>
      {result && <pre className="text-green-400 mt-2">{result}</pre>}
      {error && <pre className="text-red-400 mt-2">{error}</pre>}
      {showSimulator && !isRead && (
        <TransactionSimulator contract={contract} func={func} args={processedArgs} value={inputs['payableValue']} />
      )}
    </div>
  );
};

export default FunctionInteractor;
